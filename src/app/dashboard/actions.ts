"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

const BIZ_COOKIE = "active_biz_id";
const COOKIE_OPTS = { path: "/", httpOnly: true, sameSite: "lax" as const, maxAge: 60 * 60 * 24 * 365 };

type BusinessType = Database["public"]["Enums"]["business_type"];

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

function requireValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`Missing required field: ${key}`);
  return value;
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^a-z0-9؀-ۿ-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "business";
  return `${base}-${Date.now().toString(36)}`;
}

async function getUserId() {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard/settings?demo=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/dashboard/settings");
  }

  return { supabase, userId: user.id, userEmail: user.email ?? "" };
}

export async function switchBusiness(formData: FormData) {
  const bizId = String(formData.get("biz_id") ?? "").trim();
  if (!bizId) redirect("/dashboard/settings");
  const cookieStore = await cookies();
  cookieStore.set(BIZ_COOKIE, bizId, COOKIE_OPTS);
  revalidatePath("/dashboard");
  redirect("/dashboard/settings");
}

export async function createBusiness(formData: FormData) {
  const { supabase, userId, userEmail } = await getUserId();

  const name = requireValue(formData, "name");
  const businessType = requireValue(formData, "business_type") as BusinessType;
  const city = String(formData.get("city") ?? "").trim() || null;
  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim() || null;

  await supabase.from("profiles").upsert(
    { id: userId, email: userEmail },
    { onConflict: "id", ignoreDuplicates: true },
  );

  const slug = generateSlug(name);

  const { data: newBiz, error } = await supabase.from("businesses").insert({
    owner_id: userId,
    name,
    slug,
    type: businessType,
    city,
    whatsapp_number: whatsappNumber,
  }).select("id").single();

  if (error || !newBiz) {
    console.error("createBusiness error:", error);
    redirect("/dashboard/settings?error=business");
  }

  const cookieStore = await cookies();
  cookieStore.set(BIZ_COOKIE, newBiz.id, COOKIE_OPTS);

  revalidatePath("/dashboard");
  redirect("/dashboard?created_business=1");
}

export async function updateWhatsappNumber(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const number = String(formData.get("whatsapp_number") ?? "").trim() || null;

  const cookieStore = await cookies();
  const bizId = cookieStore.get(BIZ_COOKIE)?.value;

  const query = supabase
    .from("businesses")
    .update({ whatsapp_number: number })
    .eq("owner_id", userId);

  if (bizId) query.eq("id", bizId);

  const { error } = await query;

  if (error) {
    console.error("updateWhatsappNumber error:", error);
    redirect("/dashboard/settings?error=whatsapp");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard/settings?whatsapp=updated");
}

export async function setMarketplaceVisibility(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const enabled = String(formData.get("enabled") ?? "") === "1";

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id,type")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (businessError || !business) {
    redirect("/dashboard/settings?error=business");
  }

  const db = supabase as any;

  if (!enabled) {
    const { error } = await db
      .from("business_category_mapping")
      .update({ is_public: false })
      .eq("business_id", business.id);

    if (error) {
      console.error("setMarketplaceVisibility disable error:", error);
      redirect("/dashboard/settings?error=zone");
    }

    revalidatePath("/dashboard/settings");
    redirect("/dashboard/settings?zone=disabled");
  }

  const categoryName = MARKETPLACE_CATEGORY_BY_TYPE[business.type] ?? "خدمات";
  const { data: category, error: categoryError } = await db
    .from("store_categories")
    .select("id")
    .eq("name", categoryName)
    .eq("is_active", true)
    .maybeSingle();

  if (categoryError || !category) {
    redirect("/dashboard/settings?error=zone_category");
  }

  const { error: hideOldError } = await db
    .from("business_category_mapping")
    .update({ is_public: false })
    .eq("business_id", business.id);

  if (hideOldError) {
    console.error("setMarketplaceVisibility hide old error:", hideOldError);
    redirect("/dashboard/settings?error=zone");
  }

  const { error } = await db
    .from("business_category_mapping")
    .upsert(
      { business_id: business.id, category_id: category.id, is_public: true },
      { onConflict: "business_id,category_id" },
    );

  if (error) {
    console.error("setMarketplaceVisibility enable error:", error);
    redirect("/dashboard/settings?error=zone");
  }

  revalidatePath("/dashboard/settings");
  redirect("/dashboard/settings?zone=enabled");
}
