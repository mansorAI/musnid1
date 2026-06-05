import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  processRestaurantOrderTurn,
  type PaidAddon,
  type RestaurantOrderDraft,
} from "@/lib/bot/restaurant-order";

type ConversationMetadata = {
  restaurant_order_draft?: RestaurantOrderDraft;
  [key: string]: unknown;
};

const DAY_LABELS: Record<string, string> = {
  saturday: "السبت", sunday: "الأحد", monday: "الإثنين",
  tuesday: "الثلاثاء", wednesday: "الأربعاء", thursday: "الخميس", friday: "الجمعة",
};

// ── Meta verification challenge ──────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

// ── Send reply via Meta Graph API ────────────────────────────────────────────
async function sendMetaMessage(phoneNumberId: string, to: string, text: string): Promise<string | null> {
  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    });
    const data = await res.json() as { messages?: { id: string }[] };
    return data?.messages?.[0]?.id ?? null;
  } catch (err) {
    console.error("[meta-webhook] send error:", err);
    return null;
  }
}

// ── Normalize phone number for DB lookup ─────────────────────────────────────
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return `+${digits}`;
}

// ── Incoming messages ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json() as Record<string, unknown>;

  const change = (body?.entry as { changes?: { value: Record<string, unknown> }[] }[])?.[0]
    ?.changes?.[0]?.value;

  if (!change) return new NextResponse("OK", { status: 200 });

  // Only handle text messages
  const message = (change.messages as { from: string; id: string; type: string; text?: { body: string } }[])?.[0];
  if (!message || message.type !== "text") return new NextResponse("OK", { status: 200 });

  const from = message.from; // customer phone (digits only, no +)
  const messageText = message.text?.body?.trim() ?? "";
  const messageSid = message.id;
  const profileName = (change.contacts as { profile?: { name?: string } }[])?.[0]?.profile?.name ?? null;
  const phoneNumberId = (change.metadata as { phone_number_id?: string })?.phone_number_id ?? "";
  const displayPhone = (change.metadata as { display_phone_number?: string })?.display_phone_number ?? "";

  if (!from || !messageText) return new NextResponse("OK", { status: 200 });

  const fromE164 = normalizePhone(from);
  const toE164 = normalizePhone(displayPhone);

  const supabase = createAdminClient();

  // 1. Find business by whatsapp_number
  const { data: allBiz } = await supabase.from("businesses").select("id,name,whatsapp_number").limit(20);
  console.log("[meta-webhook] looking for:", toE164, "| all whatsapp_numbers:", JSON.stringify(allBiz?.map(b => ({ id: b.id.slice(0,8), wa: b.whatsapp_number }))));

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("whatsapp_number", toE164)
    .maybeSingle();

  if (!business) {
    console.error(`[meta-webhook] No business for number: ${toE164} (raw: ${displayPhone})`);
    return new NextResponse("OK", { status: 200 });
  }

  // 2. Find or create customer
  const { data: existingCustomer } = await supabase
    .from("customers").select("*")
    .eq("business_id", business.id).eq("phone", fromE164).maybeSingle();

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
      .insert({ business_id: business.id, phone: fromE164, name: profileName, tags: [] })
      .select("id").single();
    if (error || !newCustomer) {
      console.error("[meta-webhook] Failed to create customer:", error);
      return new NextResponse("OK", { status: 200 });
    }
    customerId = newCustomer.id;
  }

  // 3. Find or create conversation
  const { data: activeConv } = await supabase
    .from("conversations").select("id,metadata")
    .eq("business_id", business.id).eq("customer_id", customerId).eq("status", "active")
    .order("started_at", { ascending: false }).limit(1).maybeSingle();

  let conversationId: string;
  let conversationMetadata: ConversationMetadata = {};

  if (activeConv) {
    conversationId = activeConv.id;
    conversationMetadata = (activeConv.metadata ?? {}) as ConversationMetadata;
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
      }).select("id,metadata").single();
    if (error || !newConv) {
      console.error("[meta-webhook] Failed to create conversation:", error);
      return new NextResponse("OK", { status: 200 });
    }
    conversationId = newConv.id;
    conversationMetadata = (newConv.metadata ?? {}) as ConversationMetadata;
  }

  // 4. Save inbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId, direction: "inbound",
    content_type: "text", content: { text: messageText },
    twilio_message_sid: messageSid, status: "delivered",
  });

  // 5. Restaurant/cafe/retail order flow
  const botSettingsForOrder = (business.bot_settings as Record<string, unknown>) ?? {};
  const isMenuBusiness = ["restaurant", "cafe", "retail"].includes(business.type);

  if (isMenuBusiness) {
    const { data: menuItems } = await supabase
      .from("menu_items").select("id,name,price,is_available")
      .eq("business_id", business.id).eq("is_available", true).order("display_order");

    const paidAddons = Array.isArray(botSettingsForOrder.paid_addons)
      ? (botSettingsForOrder.paid_addons as PaidAddon[])
      : [
          { name: "زيادة مايونيز", price: 2, aliases: ["مايونيز", "زود مايونيز"] },
          { name: "زيادة جبن", price: 3, aliases: ["جبن", "زيادة جبنة", "زود جبن"] },
        ];

    const orderTurn = processRestaurantOrderTurn({
      text: messageText, menu: menuItems ?? [], customerPhone: fromE164,
      draft: conversationMetadata.restaurant_order_draft ?? null, paidAddons,
    });

    if (orderTurn.handled) {
      const nextMetadata: ConversationMetadata = {
        ...conversationMetadata,
        restaurant_order_draft: orderTurn.draft ?? undefined,
      };
      if (!orderTurn.draft) delete nextMetadata.restaurant_order_draft;

      await supabase.from("conversations").update({
        metadata: nextMetadata as never,
        summary: orderTurn.orderSummary ? "طلب جديد من واتساب" : orderTurn.reply.slice(0, 80),
        last_message_at: new Date().toISOString(),
      }).eq("id", conversationId);

      const outboundId = await sendMetaMessage(phoneNumberId, from, orderTurn.reply);

      await supabase.from("messages").insert({
        conversation_id: conversationId, direction: "outbound",
        content_type: "text", content: { text: orderTurn.reply },
        twilio_message_sid: outboundId,
        ai_metadata: { type: "restaurant_order_bot" }, status: "sent",
      });

      if (orderTurn.orderSummary) {
        await supabase.from("messages").insert({
          conversation_id: conversationId, direction: "inbound",
          content_type: "order_summary", content: { text: orderTurn.orderSummary }, status: "delivered",
        });
      }

      return new NextResponse("OK", { status: 200 });
    }
  }

  // 6. Conversation history
  const { data: history } = await supabase
    .from("messages").select("direction,content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false }).limit(11);

  const previousMessages = (history ?? []).slice(1).reverse().map((m) => ({
    role: (m.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
    content: (m.content as { text?: string })?.text ?? "",
  })).filter((m) => m.content);

  // 7. Build system prompt
  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const personality = (botSettings.personality as string) ?? "friendly";
  const dialect = (botSettings.dialect as string) ?? "saudi";
  const greeting = (botSettings.greeting as string) ?? "حياك الله، كيف أقدر أخدمك؟";

  const personalityLabel = personality === "professional" ? "مهني ورسمي" : personality === "concise" ? "مختصر ودقيق" : "ودود ومرح";
  const dialectLabel = dialect === "najdi" ? "نجدية" : dialect === "hijazi" ? "حجازية" : dialect === "formal_arabic" ? "عربية فصحى مبسطة" : "سعودية عامية خفيفة";

  const knowledge = Array.isArray(botSettings.knowledge)
    ? (botSettings.knowledge as { title: string; content: string; enabled: boolean }[]).filter((k) => k.enabled)
    : [];
  const knowledgeBlock = knowledge.length > 0
    ? "\n\nمعلومات النشاط:\n" + knowledge.map((k) => `- ${k.title}: ${k.content}`).join("\n")
    : "";

  const wh = business.working_hours as Record<string, { closed?: boolean; open?: string; close?: string; has_evening?: boolean; evening_open?: string; evening_close?: string }> | null;
  const workingHoursBlock = wh && Object.keys(wh).length > 0
    ? "\n\nساعات العمل:\n" + Object.entries(wh).map(([day, h]) => {
        if (h?.closed) return `${DAY_LABELS[day] ?? day}: مغلق`;
        const m = `${h?.open ?? "09:00"} - ${h?.close ?? "17:00"}`;
        const e = h?.has_evening ? ` | ${h.evening_open} - ${h.evening_close}` : "";
        return `${DAY_LABELS[day] ?? day}: ${m}${e}`;
      }).join("\n")
    : "";

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

      bookingBlock = `\n\nعند طلب الحجز اتبع هذه الخطوات:\n1. اسأل عن التخصص\n2. اعرض الأطباء المتاحين\n3. اعرض الأوقات المتاحة (كل 30 دقيقة)\n4. بعد موافقة العميل أضف: [BOOKING:STAFF_ID:YYYY-MM-DD:HH:MM:30]\n\nالأطباء:\n${staffLines}\n\nالمحجوز:\n${bookedLines}`;
    }
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const todayLabel = now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const systemPrompt = [
    `أنت مساعد ذكي لنشاط تجاري اسمه "${business.name}"${business.city ? ` في ${business.city}` : ""}.`,
    `تاريخ اليوم: ${todayLabel} (${todayStr}).`,
    business.description ? `وصف النشاط: ${business.description}` : "",
    `شخصيتك: ${personalityLabel}. اللهجة: ${dialectLabel}.`,
    "رد دائماً بالعربية. ردودك قصيرة ومفيدة.",
    "لا تذكر أنك ذكاء اصطناعي ولا تذكر اسم Claude أو Anthropic.",
    knowledgeBlock, workingHoursBlock, bookingBlock,
  ].filter(Boolean).join("\n");

  // 8. Generate AI reply
  let aiReply = greeting;
  let bookingData: { staffId: string; date: string; time: string; duration: number } | null = null;

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const response = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages: [...previousMessages, { role: "user", content: messageText }],
      });
      aiReply = response.content[0]?.type === "text" ? response.content[0].text : greeting;

      const bookingMatch = aiReply.match(/\[BOOKING:([^:]+):(\d{4}-\d{2}-\d{2}):(\d{2}:\d{2}):(\d+)\]/);
      if (bookingMatch) {
        bookingData = {
          staffId: bookingMatch[1], date: bookingMatch[2],
          time: bookingMatch[3], duration: parseInt(bookingMatch[4]),
        };
        aiReply = aiReply.replace(/\[BOOKING:[^\]]+\]/, "").trim();
      }
    } catch (err) {
      console.error("[meta-webhook] Claude error:", err);
    }
  }

  // 9. Save appointment if booking confirmed
  if (bookingData) {
    const scheduledAt = new Date(`${bookingData.date}T${bookingData.time}:00`).toISOString();
    const slotStart = new Date(scheduledAt);
    const windowStart = new Date(slotStart.getTime() - 29 * 60 * 1000).toISOString();
    const windowEnd = new Date(slotStart.getTime() + 29 * 60 * 1000).toISOString();

    const { data: conflictAppt } = await supabase
      .from("appointments").select("id")
      .eq("staff_id", bookingData.staffId)
      .gte("scheduled_at", windowStart).lte("scheduled_at", windowEnd)
      .in("status", ["pending", "confirmed"]).maybeSingle();

    if (conflictAppt) {
      aiReply = "عذراً، هذا الوقت محجوز بالفعل. يرجى اختيار وقت آخر.";
    } else {
      await supabase.from("appointments").insert({
        business_id: business.id, customer_id: customerId,
        staff_id: bookingData.staffId,
        scheduled_at: scheduledAt, duration_minutes: bookingData.duration,
        status: "confirmed", customer_name: customerName, customer_phone: fromE164,
      });
    }
  }

  // 10. Send reply via Meta
  const outboundId = await sendMetaMessage(phoneNumberId, from, aiReply);

  // 11. Save outbound message
  await supabase.from("messages").insert({
    conversation_id: conversationId, direction: "outbound",
    content_type: "text", content: { text: aiReply },
    twilio_message_sid: outboundId,
    ai_metadata: { model: "claude-haiku-4-5-20251001", personality, dialect, booking: bookingData },
    status: "sent",
  });

  await supabase.from("conversations").update({
    summary: messageText.length > 80 ? messageText.slice(0, 80) + "…" : messageText,
    last_message_at: new Date().toISOString(),
  }).eq("id", conversationId);

  return new NextResponse("OK", { status: 200 });
}
