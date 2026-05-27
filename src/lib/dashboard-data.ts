import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { automationRules, recentConversations } from "@/lib/demo-data";

export async function getCurrentOrganization() {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("organizations")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getCustomers() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return [
      {
        id: "demo-1",
        name: "نورة العتيبي",
        phone: "+966 55 124 8890",
        tags: ["حجز", "عميل جديد"],
        last_seen_at: new Date().toISOString(),
      },
      {
        id: "demo-2",
        name: "فهد المالكي",
        phone: "+966 50 661 3020",
        tags: ["استفسار", "دفع"],
        last_seen_at: new Date().toISOString(),
      },
      {
        id: "demo-3",
        name: "سارة الحربي",
        phone: "+966 56 778 1142",
        tags: ["تصعيد"],
        last_seen_at: new Date().toISOString(),
      },
    ];
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("customers")
    .select("id,name,phone,tags,last_seen_at")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getKnowledgeArticles() {
  const organization = await getCurrentOrganization();

  if (!organization) {
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

  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_articles")
    .select("id,title,content,enabled")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAutomations() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return automationRules.map((rule, index) => ({
      id: `demo-rule-${index}`,
      name: rule.name,
      trigger: rule.trigger,
      response: "رد تجريبي قابل للتخصيص بعد ربط Supabase.",
      enabled: rule.enabled,
    }));
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("automations")
    .select("id,name,trigger,response,enabled")
    .eq("organization_id", organization.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export function getDemoConversations() {
  return recentConversations;
}

export async function getConversations() {
  const organization = await getCurrentOrganization();

  if (!organization) {
    return recentConversations;
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select("id,status,summary,last_message_at,customers(name,phone)")
    .eq("organization_id", organization.id)
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
        conversation.status === "resolved"
          ? "محلولة"
          : conversation.status === "pending"
            ? "بانتظار مراجعة"
            : "مفتوحة",
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
