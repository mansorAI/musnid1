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

export async function updateWorkingHours(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/calendar");

  const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

  const workingHours: Record<string, {
    closed: boolean;
    open: string;
    close: string;
    has_evening: boolean;
    evening_open: string;
    evening_close: string;
  }> = {};

  for (const day of days) {
    workingHours[day] = {
      closed: formData.get(`${day}_closed`) === "on",
      open: String(formData.get(`${day}_open`) ?? "09:00"),
      close: String(formData.get(`${day}_close`) ?? "17:00"),
      has_evening: formData.get(`${day}_has_evening`) === "on",
      evening_open: String(formData.get(`${day}_evening_open`) ?? "17:00"),
      evening_close: String(formData.get(`${day}_evening_close`) ?? "22:00"),
    };
  }

  const supabase = await createClient();
  await supabase.from("businesses").update({ working_hours: workingHours }).eq("id", business.id);

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
