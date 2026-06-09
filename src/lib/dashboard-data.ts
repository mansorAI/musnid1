import { cookies } from "next/headers";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { automationRules, recentConversations } from "@/lib/demo-data";
import { getDefaultInvoiceSettings, parseInvoiceSettings } from "@/lib/zatca";
import type { Database } from "@/types/database";

type BusinessType = Database["public"]["Enums"]["business_type"];

export type FeatureKey =
  | "whatsapp_bot" | "sales" | "invoices" | "marketplace"
  | "bookings" | "staff" | "add_business";

export async function getBusinessFeatures(): Promise<Set<FeatureKey>> {
  if (!hasSupabaseEnv()) return new Set();

  const business = await getCurrentBusiness();
  if (!business) return new Set();

  const supabase = await createClient();
  const [subResult, directResult] = await Promise.all([
    supabase
      .from("business_subscriptions")
      .select("plan_id")
      .eq("business_id", business.id)
      .in("status", ["active", "trial"])
      .maybeSingle(),
    supabase
      .from("business_features")
      .select("feature_key")
      .eq("business_id", business.id),
  ]);

  const features = new Set<FeatureKey>();

  if (subResult.data?.plan_id) {
    const { data: planFeats } = await supabase
      .from("plan_features")
      .select("feature_key")
      .eq("plan_id", subResult.data.plan_id);
    (planFeats ?? []).forEach(({ feature_key }) => features.add(feature_key as FeatureKey));
  }

  (directResult.data ?? []).forEach(({ feature_key }) => features.add(feature_key as FeatureKey));

  return features;
}

const MARKETPLACE_CATEGORY_BY_TYPE: Partial<Record<BusinessType, string>> = {
  restaurant: "مطاعم",
  cafe: "كوفيهات",
  clinic: "عيادات",
  salon: "صالونات",
  retail: "متاجر",
  real_estate: "عقارات",
  services: "خدمات",
  other: "خدمات",
};

export async function getAllBusinesses() {
  if (!hasSupabaseEnv()) return [];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true });
  return data ?? [];
}

export async function getCurrentBusiness() {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const activeBizId = cookieStore.get("active_biz_id")?.value;

  if (activeBizId) {
    const { data: specific } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", activeBizId)
      .eq("owner_id", user.id)
      .maybeSingle();
    if (specific) return specific;
  }

  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function getMarketplaceVisibility() {
  const business = await getCurrentBusiness();
  if (!business) {
    return {
      business: null,
      active: false,
      categoryName: "زون",
      activeCategoryName: null as string | null,
      targetCategoryMissing: false,
    };
  }

  const supabase = await createClient();
  const targetCategoryName = MARKETPLACE_CATEGORY_BY_TYPE[business.type] ?? "خدمات";
  const db = supabase as any;

  const [categoriesResult, mappingResult] = await Promise.all([
    db
      .from("store_categories")
      .select("id,name,icon")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    db
      .from("business_category_mapping")
      .select("id,is_public,category_id,store_categories:category_id (id,name,icon)")
      .eq("business_id", business.id),
  ]);

  if (categoriesResult.error || mappingResult.error) {
    return {
      business,
      active: false,
      categoryName: targetCategoryName,
      activeCategoryName: null,
      targetCategoryMissing: true,
    };
  }

  const categories = (categoriesResult.data ?? []) as { id: string; name: string; icon?: string | null }[];
  const mappings = (mappingResult.data ?? []) as {
    is_public: boolean;
    store_categories?: { name?: string | null } | { name?: string | null }[] | null;
  }[];
  const targetCategory = categories.find((category) => category.name === targetCategoryName) ?? null;
  const activeMapping = mappings.find((mapping) => mapping.is_public) ?? null;
  const activeCategory = Array.isArray(activeMapping?.store_categories)
    ? activeMapping?.store_categories[0]
    : activeMapping?.store_categories;

  return {
    business,
    active: Boolean(activeMapping),
    categoryName: targetCategoryName,
    activeCategoryName: activeCategory?.name ?? null,
    targetCategoryMissing: !targetCategory,
  };
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

export async function getZoneMappingData() {
  const business = await getCurrentBusiness();
  if (!business) return { isPublic: false, showStaff: false };

  const supabase = await createClient();
  const db = supabase as any;
  const { data } = await db
    .from("business_category_mapping")
    .select("is_public, show_staff")
    .eq("business_id", business.id)
    .maybeSingle();

  return { isPublic: data?.is_public ?? false, showStaff: data?.show_staff ?? false };
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


export async function getInvoiceSettingsData() {
  const business = await getCurrentBusiness();
  if (!business) return { settings: getDefaultInvoiceSettings("مُسند"), businessId: null, fromFallback: true };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoice_settings")
    .select("*")
    .eq("business_id", business.id)
    .maybeSingle();

  if (!error && data) {
    return {
      settings: {
        sellerName: data.seller_name || business.name,
        vatNumber: data.vat_number ?? "",
        taxMode: data.vat_mode,
        vatRate: Number(data.vat_rate),
      },
      businessId: business.id,
      fromFallback: false,
    };
  }

  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  return {
    settings: parseInvoiceSettings(botSettings.invoice_settings, business.name),
    businessId: business.id,
    fromFallback: true,
  };
}

export async function getSalesOverviewData() {
  const business = await getCurrentBusiness();
  if (!business) {
    return {
      businessId: null,
      invoices: [
        {
          id: "demo-inv-1",
          invoice_number: "INV-2026-000001",
          buyer_name: "عميل نقدي",
          total_amount: 184,
          vat_amount: 24,
          issued_at: new Date().toISOString(),
          status: "issued",
        },
      ],
      todayTotal: 184,
      todayVat: 24,
      invoiceCount: 1,
      schemaMissing: false,
    };
  }

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabase
    .from("invoices")
    .select("id,invoice_number,buyer_name,total_amount,vat_amount,issued_at,status")
    .eq("business_id", business.id)
    .order("issued_at", { ascending: false })
    .limit(30);

  if (error) {
    return { businessId: business.id, invoices: [], todayTotal: 0, todayVat: 0, invoiceCount: 0, schemaMissing: true };
  }

  const invoices = data ?? [];
  const todayInvoices = invoices.filter((invoice) => invoice.issued_at.startsWith(today));
  return {
    businessId: business.id,
    invoices,
    todayTotal: todayInvoices.reduce((sum, invoice) => sum + Number(invoice.total_amount), 0),
    todayVat: todayInvoices.reduce((sum, invoice) => sum + Number(invoice.vat_amount), 0),
    invoiceCount: invoices.length,
    schemaMissing: false,
  };
}

export async function getAllSalesInvoices() {
  const business = await getCurrentBusiness();
  if (!business) {
    return {
      invoices: [
        {
          id: "demo-inv-1",
          invoice_number: "INV-2026-000001",
          buyer_name: "عميل نقدي" as string | null,
          total_amount: 184 as number | string,
          vat_amount: 24 as number | string,
          issued_at: new Date().toISOString(),
          status: "issued",
        },
      ],
      schemaMissing: false,
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("invoices")
    .select("id,invoice_number,buyer_name,total_amount,vat_amount,issued_at,status")
    .eq("business_id", business.id)
    .order("issued_at", { ascending: false });

  if (error) {
    return { invoices: [], schemaMissing: true };
  }

  return { invoices: data ?? [], schemaMissing: false };
}

export async function getSalesProductsData() {
  const business = await getCurrentBusiness();
  if (!business) {
    return {
      businessId: null,
      categories: [
        { id: "demo-cat-1", name: "مشروبات", display_order: 1 },
        { id: "demo-cat-2", name: "وجبات", display_order: 2 },
      ],
      products: [
        { id: "demo-p1", name: "قهوة اليوم", price: 18, is_available: true, category_id: "demo-cat-1" },
        { id: "demo-p2", name: "كيكة تمر", price: 26, is_available: true, category_id: "demo-cat-1" },
        { id: "demo-p3", name: "ساندويتش دجاج", price: 32, is_available: true, category_id: "demo-cat-2" },
      ],
      settings: getDefaultInvoiceSettings("مُسند"),
      settingsFallback: true,
      canManageProducts: true,
    };
  }

  const [menuData, settingsData] = await Promise.all([getMenuData(), getInvoiceSettingsData()]);

  return {
    businessId: business.id,
    categories: menuData.categories.map((category) => ({
      id: category.id,
      name: category.name,
      display_order: category.display_order,
    })),
    products: menuData.items
      .filter((item) => item.is_available)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        is_available: item.is_available,
        category_id: item.category_id,
      })),
    settings: settingsData.settings,
    settingsFallback: settingsData.fromFallback,
    canManageProducts: true,
  };
}

export async function getBusinessOffers() {
  const business = await getCurrentBusiness();
  if (!business) return { businessId: null, offers: [], products: [] };

  const supabase = await import("@/lib/supabase/server").then((m) => m.createClient());
  const [offersResult, productsResult] = await Promise.all([
    supabase.from("business_offers").select("*").eq("business_id", business.id).order("sort_order", { ascending: true }),
    supabase.from("menu_items").select("id,name").eq("business_id", business.id).eq("is_available", true),
  ]);

  return {
    businessId: business.id,
    offers: (offersResult.data ?? []) as import("@/types/database").BusinessOffer[],
    products: (productsResult.data ?? []) as { id: string; name: string }[],
  };
}
