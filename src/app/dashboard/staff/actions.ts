"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness } from "@/lib/dashboard-data";

export async function addStaffMember(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/staff");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/dashboard/staff?error=missing_name");

  const title = String(formData.get("title") ?? "").trim() || null;
  const specialty = String(formData.get("specialty") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("staff_members").insert({
    business_id: business.id,
    name,
    title,
    specialty,
    is_active: true,
  });

  if (error) {
    console.error("addStaffMember error:", error);
    redirect("/dashboard/staff?error=insert");
  }

  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff");
}

export async function toggleStaffActive(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const id = String(formData.get("id") ?? "").trim();
  const current = formData.get("is_active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("staff_members").update({ is_active: !current }).eq("id", id);

  revalidatePath("/dashboard/staff");
}
