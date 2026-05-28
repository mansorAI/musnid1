"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness } from "@/lib/dashboard-data";

export async function addCalendarOverride(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/calendar");

  const date = String(formData.get("date") ?? "").trim();
  const isClosed = formData.get("is_closed") === "on";
  const openTime = String(formData.get("open_time") ?? "").trim() || null;
  const closeTime = String(formData.get("close_time") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!date) redirect("/dashboard/calendar?error=missing_date");

  const supabase = await createClient();
  const { error } = await supabase.from("calendar_overrides").insert({
    business_id: business.id,
    date,
    is_closed: isClosed,
    open_time: isClosed ? null : openTime,
    close_time: isClosed ? null : closeTime,
    notes,
  });

  if (error) {
    console.error("addCalendarOverride error:", error);
    redirect("/dashboard/calendar?error=insert");
  }

  revalidatePath("/dashboard/calendar");
  redirect("/dashboard/calendar");
}

export async function deleteCalendarOverride(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("calendar_overrides").delete().eq("id", id);

  revalidatePath("/dashboard/calendar");
}
