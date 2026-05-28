import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";

async function parseFormBody(req: NextRequest): Promise<Record<string, string>> {
  const text = await req.text();
  const params = new URLSearchParams(text);
  const result: Record<string, string> = {};
  for (const [key, value] of params.entries()) result[key] = value;
  return result;
}

const DAY_LABELS: Record<string, string> = {
  saturday: "السبت", sunday: "الأحد", monday: "الإثنين",
  tuesday: "الثلاثاء", wednesday: "الأربعاء", thursday: "الخميس", friday: "الجمعة",
};

export async function POST(req: NextRequest) {
  const body = await parseFormBody(req);

  const from = (body.From ?? "").replace("whatsapp:", "");
  const to = (body.To ?? "").replace("whatsapp:", "");
  const messageText = (body.Body ?? "").trim();
  const messageSid = body.MessageSid ?? null;
  const profileName = body.ProfileName ?? null;

  if (!from || !messageText) return new NextResponse("OK", { status: 200 });

  const supabase = createAdminClient();

  // 1. Find business
  const { data: business } = await supabase
    .from("businesses").select("*").eq("whatsapp_number", to).maybeSingle();
  if (!business) {
    console.error(`[webhook] No business for: ${to}`);
    return new NextResponse("OK", { status: 200 });
  }

  // 2. Find or create customer
  const { data: existingCustomer } = await supabase
    .from("customers").select("*").eq("business_id", business.id).eq("phone", from).maybeSingle();

  let customerId: string;
  let customerName: string | null = profileName;

  if (existingCustomer) {
    customerId = existingCustomer.id;
    customerName = existingCustomer.name ?? profileName;
    await supabase.from("customers").update({
      last_message_at: new Date().toISOString(),
      total_messages: (existingCustomer.total_messages ?? 0) + 1,
      ...(profileName && !existingCustomer.name ? { name: profileName } : {}),
    }).eq("id", customerId);
  } else {
    const { data: newCustomer, error } = await supabase
      .from("customers")
      .insert({ business_id: business.id, phone: from, name: profileName, tags: [] })
      .select("id").single();
    if (error || !newCustomer) {
      console.error("[webhook] Failed to create customer:", error);
      return new NextResponse("OK", { status: 200 });
    }
    customerId = newCustomer.id;
  }

  // 3. Find or create conversation
  const { data: activeConv } = await supabase
    .from("conversations").select("id")
    .eq("business_id", business.id).eq("customer_id", customerId).eq("status", "active")
    .order("started_at", { ascending: false }).limit(1).maybeSingle();

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
        business_id: business.id, customer_id: customerId, status: "active",
        last_message_at: new Date().toISOString(),
        window_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }).select("id").single();
    if (error || !newConv) {
      console.error("[webhook] Failed to create conversation:", error);
      return new NextResponse("OK", { status: 200 });
    }
    conversationId = newConv.id;
  }

  // 4. Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId, direction: "inbound",
    content_type: "text", content: { text: messageText },
    twilio_message_sid: messageSid, status: "delivered",
  });

  // 5. Fetch conversation history (last 10 messages for context)
  const { data: history } = await supabase
    .from("messages").select("direction,content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false }).limit(11);

  const previousMessages = (history ?? []).slice(1).reverse().map((m) => ({
    role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
    content: (m.content as { text?: string })?.text ?? "",
  })).filter((m) => m.content);

  // 6. Build system prompt
  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const personality = (botSettings.personality as string) ?? "friendly";
  const dialect = (botSettings.dialect as string) ?? "saudi";
  const greeting = (botSettings.greeting as string) ?? "حياك الله، كيف أقدر أخدمك؟";

  const personalityLabel = personality === "professional" ? "مهني ورسمي" : personality === "concise" ? "مختصر ودقيق" : "ودود ومرح";
  const dialectLabel = dialect === "najdi" ? "نجدية" : dialect === "hijazi" ? "حجازية" : dialect === "formal_arabic" ? "عربية فصحى مبسطة" : "سعودية عامية خفيفة";

  // Knowledge articles
  const knowledge = Array.isArray(botSettings.knowledge)
    ? (botSettings.knowledge as { title: string; content: string; enabled: boolean }[]).filter((k) => k.enabled)
    : [];
  const knowledgeBlock = knowledge.length > 0
    ? "\n\nمعلومات النشاط:\n" + knowledge.map((k) => `- ${k.title}: ${k.content}`).join("\n")
    : "";

  // Working hours
  const wh = business.working_hours as Record<string, { closed?: boolean; open?: string; close?: string; has_evening?: boolean; evening_open?: string; evening_close?: string }> | null;
  const workingHoursBlock = wh && Object.keys(wh).length > 0
    ? "\n\nساعات العمل:\n" + Object.entries(wh).map(([day, h]) => {
        if (h?.closed) return `${DAY_LABELS[day] ?? day}: مغلق`;
        const m = `${h?.open ?? "09:00"} - ${h?.close ?? "17:00"}`;
        const e = h?.has_evening ? ` | ${h.evening_open} - ${h.evening_close}` : "";
        return `${DAY_LABELS[day] ?? day}: ${m}${e}`;
      }).join("\n")
    : "";

  // Clinic / salon booking block
  let bookingBlock = "";
  const isBookingBusiness = business.type === "clinic" || business.type === "salon";

  if (isBookingBusiness) {
    const [staffResult, appointmentsResult] = await Promise.all([
      supabase.from("staff_members").select("id,name,title,specialty,working_hours")
        .eq("business_id", business.id).eq("is_active", true).order("display_order"),
      supabase.from("appointments")
        .select("staff_id,scheduled_at,duration_minutes,status")
        .eq("business_id", business.id)
        .gte("scheduled_at", new Date().toISOString())
        .lte("scheduled_at", new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString())
        .in("status", ["pending", "confirmed"]),
    ]);

    const staff = staffResult.data ?? [];
    const bookedAppts = appointmentsResult.data ?? [];

    if (staff.length > 0) {
      const staffLines = staff.map((s) => {
        const swh = s.working_hours as Record<string, { closed?: boolean; open?: string; close?: string }> | null;
        const hoursStr = swh
          ? Object.entries(swh).filter(([, h]) => !h?.closed).map(([d, h]) => `${DAY_LABELS[d] ?? d} ${h?.open}-${h?.close}`).join("، ")
          : "حسب ساعات العيادة";
        return `- ${s.name} (ID: ${s.id}) | ${s.specialty ?? s.title ?? "عام"} | ${hoursStr}`;
      }).join("\n");

      const bookedLines = bookedAppts.length > 0
        ? bookedAppts.map((a) => {
            const dt = new Date(a.scheduled_at);
            return `- ID الطبيب: ${a.staff_id} | ${dt.toLocaleDateString("ar-SA")} ${dt.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })} (${a.duration_minutes} دقيقة)`;
          }).join("\n")
        : "لا توجد مواعيد محجوزة";

      bookingBlock = `

عند طلب الحجز اتبع هذه الخطوات بدقة:
1. اسأل عن التخصص واعرض التخصصات المتاحة من قائمة الأطباء أدناه
2. بعد اختيار التخصص، اعرض الأطباء المتاحين في هذا التخصص
3. اعرض الأوقات المتاحة: خذ ساعات عمل الطبيب واطرح منها المواعيد المحجوزة المذكورة أدناه (كل موعد يأخذ 30 دقيقة)
   - كل موعد يأخذ 30 دقيقة كاملة، الأوقات المتاحة تبدأ كل 30 دقيقة فقط: 9:00، 9:30، 10:00...
   - مثال: لو الطبيب يعمل 9:00-14:00 والساعة 9:00 محجوزة، اعرض: 9:30، 10:00، 10:30...
   - لا تعرض أبداً وقتاً مذكوراً في قائمة المحجوزة
4. بعد موافقة العميل، أكد الحجز وأضف في آخر ردك هذا النص بالضبط:
   [BOOKING:STAFF_ID:YYYY-MM-DD:HH:MM:30]
   مثال: [BOOKING:abc-123:2026-06-15:10:00:30]
   استخدم ID الطبيب الفعلي من القائمة أدناه

الأطباء المتاحون:
${staffLines}

المواعيد المحجوزة — لا تقترح هذه الأوقات:
${bookedLines}`;
    }
  }

  const systemPrompt = [
    `أنت مساعد ذكي لنشاط تجاري اسمه "${business.name}"${business.city ? ` في ${business.city}` : ""}.`,
    business.description ? `وصف النشاط: ${business.description}` : "",
    `شخصيتك: ${personalityLabel}. اللهجة: ${dialectLabel}.`,
    "رد دائماً بالعربية. ردودك قصيرة ومفيدة.",
    "لا تذكر أنك ذكاء اصطناعي ولا تذكر اسم Claude أو Anthropic.",
    knowledgeBlock,
    workingHoursBlock,
    bookingBlock,
  ].filter(Boolean).join("\n");

  // 7. Generate AI reply
  let aiReply = greeting;
  let bookingData: { staffId: string; date: string; time: string; duration: number } | null = null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [
          ...previousMessages,
          { role: "user", content: messageText },
        ],
      });

      aiReply = response.content[0]?.type === "text" ? response.content[0].text : greeting;

      // Parse booking marker [BOOKING:staff_id:YYYY-MM-DD:HH:MM:duration]
      const bookingMatch = aiReply.match(/\[BOOKING:([^:]+):(\d{4}-\d{2}-\d{2}):(\d{2}:\d{2}):(\d+)\]/);
      if (bookingMatch) {
        bookingData = {
          staffId: bookingMatch[1],
          date: bookingMatch[2],
          time: bookingMatch[3],
          duration: parseInt(bookingMatch[4]),
        };
        aiReply = aiReply.replace(/\[BOOKING:[^\]]+\]/, "").trim();
      }
    } catch (err) {
      console.error("[webhook] Claude error:", err);
    }
  }

  // 8. Save appointment if booking confirmed (with duplicate check)
  if (bookingData) {
    const scheduledAt = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString();

    const slotStart = new Date(scheduledAt);
    const windowStart = new Date(slotStart.getTime() - 29 * 60 * 1000).toISOString();
    const windowEnd   = new Date(slotStart.getTime() + 29 * 60 * 1000).toISOString();

    const { data: conflictAppt } = await supabase
      .from("appointments")
      .select("id")
      .eq("staff_id", bookingData.staffId)
      .gte("scheduled_at", windowStart)
      .lte("scheduled_at", windowEnd)
      .in("status", ["pending", "confirmed"])
      .maybeSingle();

    if (conflictAppt) {
      aiReply = "عذراً، هذا الوقت محجوز بالفعل. يرجى اختيار وقت آخر.";
      console.log(`[webhook] Slot conflict: ${bookingData.date} ${bookingData.time}`);
    } else {
      await supabase.from("appointments").insert({
        business_id: business.id,
        customer_id: customerId,
        staff_id: bookingData.staffId,
        scheduled_at: scheduledAt,
        duration_minutes: bookingData.duration,
        status: "confirmed",
        customer_name: customerName,
        customer_phone: from,
      });
      console.log(`[webhook] Appointment saved: ${bookingData.date} ${bookingData.time}`);
    }
  }

  // 9. Send reply via Twilio
  const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
  let outboundSid: string | null = null;
  try {
    const sent = await twilioClient.messages.create({
      from: `whatsapp:${to}`, to: `whatsapp:${from}`, body: aiReply,
    });
    outboundSid = sent.sid;
  } catch (err) {
    console.error("[webhook] Twilio send error:", err);
  }

  // 10. Save outbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId, direction: "outbound",
    content_type: "text", content: { text: aiReply },
    twilio_message_sid: outboundSid,
    ai_metadata: { model: "claude-haiku-4-5-20251001", personality, dialect, booking: bookingData },
    status: "sent",
  });

  // 11. Update conversation summary
  await supabase.from("conversations").update({
    summary: messageText.length > 80 ? messageText.slice(0, 80) + "…" : messageText,
    last_message_at: new Date().toISOString(),
  }).eq("id", conversationId);

  return new NextResponse("OK", { status: 200 });
}
