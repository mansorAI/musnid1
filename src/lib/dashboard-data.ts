import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { automationRules, recentConversations } from "@/lib/demo-data";

export async function getCurrentBusiness() {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getCustomers() {
  const business = await getCurrentBusiness();

  if (!business) {
    return [
      {
        id: "demo-1",
        name: "نورة العتيبي",
        phone: "+966 55 124 8890",
        tags: ["حجز", "عميل جديد"],
        last_message_at: new Date().toISOString(),
      },
      {
        id: "demo-2",
        name: "فهد المالكي",
        phone: "+966 50 661 3020",
        tags: ["استفسار", "دفع"],
        last_message_at: new Date().toISOString(),
      },
      {
        id: "demo-3",
        name: "سارة الحربي",
        phone: "+966 56 778 1142",
        tags: ["تصعيد"],
        last_message_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id,name,phone,tags,last_message_at")
    .eq("business_id", business.id)
    .order("first_seen_at", { ascending: false });

  return data ?? [];
}

// Knowledge articles and automations are not yet stored in the database.
// They are driven by businesses.bot_settings JSONB and will be editable
// in a future release. Return demo data for now.
export async function getKnowledgeArticles() {
  return [
    {
      id: "demo-knowledge-1",
      title: "سياسة الإلغاء",
      content: "يمكن إلغاء الموعد قبل 6 ساعات من وقت الحجز بدون رسوم.",
      enabled: true,
    },
    {
      id: "demo-knowledge-2",
      title: "طرق الدفع",
      content: "ندعم الدفع نقدًا، مدى، Apple Pay، وروابط الدفع الإلكترونية.",
      enabled: true,
    },
  ];
}

export async function getAutomations() {
  return automationRules.map((rule, index) => ({
    id: `demo-rule-${index}`,
    name: rule.name,
    trigger: rule.trigger,
    response: "رد تجريبي قابل للتخصيص بعد ربط WhatsApp.",
    enabled: rule.enabled,
  }));
}

export function getDemoConversations() {
  return recentConversations;
}

export async function getConversations() {
  const business = await getCurrentBusiness();

  if (!business) return recentConversations;

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id,status,summary,last_message_at,customers(name,phone)")
    .eq("business_id", business.id)
    .order("last_message_at", { ascending: false });

  return (data ?? []).map((conversation) => {
    const customer = Array.isArray(conversation.customers)
      ? conversation.customers[0]
      : conversation.customers;

    return {
      id: conversation.id,
      name: customer?.name ?? "عميل غير معروف",
      phone: customer?.phone ?? "",
      status:
        conversation.status === "closed"
          ? "مغلقة"
          : conversation.status === "escalated"
            ? "بانتظار مراجعة"
            : "نشطة",
      summary: conversation.summary ?? "لا يوجد ملخص بعد.",
      time: conversation.last_message_at
        ? new Intl.DateTimeFormat("ar-SA", {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(conversation.last_message_at))
        : "",
    };
  });
}
