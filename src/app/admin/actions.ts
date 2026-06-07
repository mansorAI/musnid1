"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/admin-data";
import type { Database } from "@/types/database";

function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("غير مصرح");
  return user;
}

export async function updateBusinessCategory(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const businessId = formData.get("businessId") as string;
  const categoryId = formData.get("categoryId") as string;

  // Preserve the current is_public state so zone visibility isn't reset
  const { data: existing } = await supabase
    .from("business_category_mapping")
    .select("is_public")
    .eq("business_id", businessId)
    .maybeSingle();
  const isPublic = existing?.is_public ?? false;

  const { error: delError } = await supabase
    .from("business_category_mapping")
    .delete()
    .eq("business_id", businessId);
  if (delError) throw new Error(delError.message);

  if (categoryId) {
    const { error: insError } = await supabase.from("business_category_mapping").insert({
      business_id: businessId,
      category_id: categoryId,
      is_public: isPublic,
    });
    if (insError) throw new Error(insError.message);
  }

  revalidatePath("/admin/members");
  redirect("/admin/members?tab=businesses");
}

export async function toggleBusinessZoneVisibility(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const businessId = formData.get("businessId") as string;
  const isPublic = formData.get("isPublic") === "true";

  await supabase
    .from("business_category_mapping")
    .update({ is_public: isPublic })
    .eq("business_id", businessId);

  revalidatePath("/admin/members");
}

export async function updateMemberRole(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const userId = formData.get("userId") as string;
  const role = formData.get("role") as "admin" | "business" | "customer";

  await supabase.from("profiles").update({ role }).eq("id", userId);
  revalidatePath("/admin/members");
}

export async function createPlan(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || null;
  const price = Number(formData.get("price") ?? 0);
  const billingInterval = (formData.get("billingInterval") as string) ?? "monthly";
  const isFeatured = formData.get("isFeatured") === "on";

  const { data: maxOrder } = await supabase
    .from("plans")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await supabase.from("plans").insert({
    name,
    description,
    price,
    billing_interval: billingInterval,
    is_featured: isFeatured,
    sort_order: (maxOrder?.sort_order ?? 0) + 1,
  });

  revalidatePath("/admin/packages");
}

export async function updatePlan(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const planId = formData.get("planId") as string;
  const name = formData.get("name") as string;
  const price = Number(formData.get("price") ?? 0);

  await supabase.from("plans").update({ name, price }).eq("id", planId);
  revalidatePath("/admin/packages");
}

export async function deletePlan(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const planId = formData.get("planId") as string;
  await supabase.from("plan_features").delete().eq("plan_id", planId);
  await supabase.from("plans").delete().eq("id", planId);

  revalidatePath("/admin/packages");
}

export async function addPlanFeature(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const planId = formData.get("planId") as string;
  const featureKey = formData.get("featureKey") as string;
  const featureLimit = formData.get("featureLimit")
    ? Number(formData.get("featureLimit"))
    : null;

  await supabase.from("plan_features").upsert({
    plan_id: planId,
    feature_key: featureKey,
    feature_limit: featureLimit,
  }, { onConflict: "plan_id,feature_key" });

  revalidatePath("/admin/packages");
  revalidatePath("/admin/features");
}

export async function removePlanFeature(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const featureId = formData.get("featureId") as string;
  await supabase.from("plan_features").delete().eq("id", featureId);

  revalidatePath("/admin/packages");
  revalidatePath("/admin/features");
}

export async function assignSubscription(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const businessId = formData.get("businessId") as string;
  const planId = formData.get("planId") as string;

  await supabase.from("business_subscriptions").upsert({
    business_id: businessId,
    plan_id: planId,
    status: "active",
    started_at: new Date().toISOString(),
  }, { onConflict: "business_id" });

  revalidatePath("/admin/features");
}

export async function addDirectFeature(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const businessId = formData.get("businessId") as string;
  const featureKey = formData.get("featureKey") as string;

  await supabase.from("business_features").upsert(
    { business_id: businessId, feature_key: featureKey },
    { onConflict: "business_id,feature_key" },
  );

  revalidatePath("/admin/features");
}

export async function removeDirectFeature(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const featureId = formData.get("featureId") as string;
  await supabase.from("business_features").delete().eq("id", featureId);

  revalidatePath("/admin/features");
}
