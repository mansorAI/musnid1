"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness } from "@/lib/dashboard-data";

export async function addService(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/services");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/dashboard/services?error=missing_name");

  const description = String(formData.get("description") ?? "").trim() || null;
  const priceRaw = Number(formData.get("price"));
  const price = Number.isFinite(priceRaw) && priceRaw > 0 ? priceRaw : null;
  const durationRaw = Number(formData.get("duration_minutes"));
  const durationMinutes = Number.isFinite(durationRaw) && durationRaw > 0 ? durationRaw : 30;
  const staffId = String(formData.get("staff_id") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("services").insert({
    business_id: business.id,
    name,
    description,
    price,
    duration_minutes: durationMinutes,
    staff_id: staffId,
    is_active: true,
  });

  if (error) {
    console.error("addService error:", error);
    redirect("/dashboard/services?error=insert");
  }

  revalidatePath("/dashboard/services");
  redirect("/dashboard/services");
}

export async function toggleServiceActive(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const id = String(formData.get("id") ?? "").trim();
  const current = formData.get("is_active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("services").update({ is_active: !current }).eq("id", id);

  revalidatePath("/dashboard/services");
}
