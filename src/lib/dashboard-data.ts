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

export async function getKnowledgeArticles() {
  const business = await getCurrentBusiness();
  if (!business) {
    return [
      { id: "demo-k1", title: "سياسة الإلغاء", content: "يمكن إلغاء الموعد قبل 6 ساعات من وقت الحجز بدون رسوم.", enabled: true },
      { id: "demo-k2", title: "طرق الدفع", content: "ندعم الدفع نقدًا، مدى، Apple Pay، وروابط الدفع الإلكترونية.", enabled: true },
    ];
  }

  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const knowledge = Array.isArray(botSettings.knowledge)
    ? (botSettings.knowledge as { id: string; title: string; content: string; enabled: boolean }[])
    : [];

  return knowledge;
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

export async function getDashboardStats() {
  const business = await getCurrentBusiness();
  if (!business) return null;

  const supabase = await createClient();

  const [totalConv, totalCust, activeConv, escalatedConv] = await Promise.all([
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("customers").select("*", { count: "exact", head: true }).eq("business_id", business.id),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "active"),
    supabase.from("conversations").select("*", { count: "exact", head: true }).eq("business_id", business.id).eq("status", "escalated"),
  ]);

  return {
    totalConversations: totalConv.count ?? 0,
    totalCustomers: totalCust.count ?? 0,
    activeConversations: activeConv.count ?? 0,
    escalatedConversations: escalatedConv.count ?? 0,
  };
}

export async function getCalendarData() {
  const business = await getCurrentBusiness();
  if (!business) return { workingHours: null, overrides: [], businessId: null };

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data } = await supabase
    .from("calendar_overrides")
    .select("*")
    .eq("business_id", business.id)
    .gte("date", today)
    .order("date", { ascending: true })
    .limit(30);

  return {
    workingHours: business.working_hours as Record<string, { open: string; close: string; closed: boolean }> | null,
    overrides: data ?? [],
    businessId: business.id,
  };
}

export async function getMenuData() {
  const business = await getCurrentBusiness();
  if (!business) return { categories: [], items: [], businessId: null };

  const supabase = await createClient();
  const [catResult, itemsResult] = await Promise.all([
    supabase.from("menu_categories").select("*").eq("business_id", business.id).order("display_order"),
    supabase.from("menu_items").select("*").eq("business_id", business.id).order("display_order"),
  ]);

  return {
    categories: catResult.data ?? [],
    items: itemsResult.data ?? [],
    businessId: business.id,
  };
}

export async function getStaffData() {
  const business = await getCurrentBusiness();
  if (!business) return { staff: [], businessId: null };

  const supabase = await createClient();
  const { data } = await supabase
    .from("staff_members")
    .select("*")
    .eq("business_id", business.id)
    .order("display_order");

  return { staff: data ?? [], businessId: business.id };
}

export async function getUpcomingAppointments() {
  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("appointments")
    .select("id,scheduled_at,duration_minutes,status,customer_name,customer_phone,staff_members(name),customers(name,phone)")
    .eq("business_id", business.id)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(20);

  return data ?? [];
}

export async function getServicesData() {
  const business = await getCurrentBusiness();
  if (!business) return { services: [], staff: [], businessId: null };

  const supabase = await createClient();
  const [servResult, staffResult] = await Promise.all([
    supabase
      .from("services")
      .select("id,name,description,price,price_max,duration_minutes,is_active,display_order,staff_id,staff_members(name)")
      .eq("business_id", business.id)
      .order("display_order"),
    supabase
      .from("staff_members")
      .select("id,name")
      .eq("business_id", business.id)
      .eq("is_active", true),
  ]);

  return {
    services: servResult.data ?? [],
    staff: staffResult.data ?? [],
    businessId: business.id,
  };
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
