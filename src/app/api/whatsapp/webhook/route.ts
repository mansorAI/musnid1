import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";

async function parseFormBody(req: NextRequest): Promise<Record<string, string>> {
  const text = await req.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    result[key] = value;
  }
  return result;
}

export async function POST(req: NextRequest) {
  const body = await parseFormBody(req);

  const from = (body.From ?? "").replace("whatsapp:", "");
  const to = (body.To ?? "").replace("whatsapp:", "");
  const messageText = (body.Body ?? "").trim();
  const messageSid = body.MessageSid ?? null;
  const profileName = body.ProfileName ?? null;

  if (!from || !messageText) {
    return new NextResponse("OK", { status: 200 });
  }

  const supabase = createAdminClient();

  // 1. Find business by whatsapp_number
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("whatsapp_number", to)
    .maybeSingle();

  if (!business) {
    console.error(`[webhook] No business found for number: ${to}`);
    return new NextResponse("OK", { status: 200 });
  }

  // 2. Find or create customer
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("*")
    .eq("business_id", business.id)
    .eq("phone", from)
    .maybeSingle();

  let customerId: string;

  if (existingCustomer) {
    customerId = existingCustomer.id;
    await supabase.from("customers").update({
      last_message_at: new Date().toISOString(),
      total_messages: (existingCustomer.total_messages ?? 0) + 1,
      ...(profileName && !existingCustomer.name ? { name: profileName } : {}),
    }).eq("id", customerId);
  } else {
    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert({ business_id: business.id, phone: from, name: profileName, tags: [] })
      .select("id")
      .single();
    if (error || !newCustomer) {
      console.error("[webhook] Failed to create customer:", error);
      return new NextResponse("OK", { status: 200 });
    }
    customerId = newCustomer.id;
  }

  // 3. Find active conversation or create one
  const { data: activeConv } = await supabase
    .from("conversations")
    .select("id,summary")
    .eq("business_id", business.id)
    .eq("customer_id", customerId)
    .eq("status", "active")
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let conversationId: string;

  if (activeConv) {
    conversationId = activeConv.id;
    await supabase.from("conversations").update({
      last_message_at: new Date().toISOString(),
      window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }).eq("id", conversationId);
  } else {
    const { data: newConv, error } = await supabase
      .from("conversations")
      .insert({
        business_id: business.id,
        customer_id: customerId,
        status: "active",
        last_message_at: new Date().toISOString(),
        window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })
      .select("id")
      .single();
    if (error || !newConv) {
      console.error("[webhook] Failed to create conversation:", error);
      return new NextResponse("OK", { status: 200 });
    }
    conversationId = newConv.id;
  }

  // 4. Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    content_type: "text",
    content: { text: messageText },
    twilio_message_sid: messageSid,
    status: "delivered",
  });

  // 5. Generate AI reply
  const botSettings = business.bot_settings as Record<string, string> | null;
  const personality = botSettings?.personality ?? "friendly";
  const dialect = botSettings?.dialect ?? "saudi";
  const greeting = botSettings?.greeting ?? "حياك الله، كيف أقدر أخدمك؟";

  let aiReply = greeting;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const personalityLabel =
        personality === "professional" ? "مهني ورسمي" :
        personality === "concise" ? "مختصر ودقيق" :
        "ودود ومرح";

      const dialectLabel =
        dialect === "najdi" ? "نجدية" :
        dialect === "hijazi" ? "حجازية" :
        dialect === "formal_arabic" ? "عربية فصحى مبسطة" :
        "سعودية عامية خفيفة";

      const systemPrompt = [
        `أنت مساعد ذكي لنشاط تجاري اسمه "${business.name}"${business.city ? ` في ${business.city}` : ""}.`,
        business.description ? `وصف النشاط: ${business.description}` : "",
        `شخصيتك: ${personalityLabel}. اللهجة: ${dialectLabel}.`,
        "رد دائماً بالعربية. ردودك قصيرة ومفيدة (جملة أو جملتان كحد أقصى).",
        "لا تذكر أنك ذكاء اصطناعي ولا تذكر اسم Claude أو Anthropic.",
      ].filter(Boolean).join("\n");

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: systemPrompt,
        messages: [{ role: "user", content: messageText }],
      });

      aiReply =
        response.content[0]?.type === "text"
          ? response.content[0].text
          : greeting;
    } catch (err) {
      console.error("[webhook] Claude error:", err);
    }
  }

  // 6. Send reply via Twilio
  const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!,
  );

  let outboundSid: string | null = null;
  try {
    const sent = await twilioClient.messages.create({
      from: `whatsapp:${to}`,
      to: `whatsapp:${from}`,
      body: aiReply,
    });
    outboundSid = sent.sid;
  } catch (err) {
    console.error("[webhook] Twilio send error:", err);
  }

  // 7. Save outbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "outbound",
    content_type: "text",
    content: { text: aiReply },
    twilio_message_sid: outboundSid,
    ai_metadata: { model: "claude-haiku-4-5-20251001", personality, dialect },
    status: "sent",
  });

  // 8. Update conversation summary
  await supabase.from("conversations").update({
    summary: messageText.length > 80 ? messageText.slice(0, 80) + "…" : messageText,
    last_message_at: new Date().toISOString(),
  }).eq("id", conversationId);

  return new NextResponse("OK", { status: 200 });
}
