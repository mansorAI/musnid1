"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type BusinessType = Database["public"]["Enums"]["business_type"];

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

export async function createBusiness(formData: FormData) {
  const { supabase, userId, userEmail } = await getUserId();

  const name = requireValue(formData, "name");
  const businessType = requireValue(formData, "business_type") as BusinessType;
  const city = String(formData.get("city") ?? "").trim() || null;
  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim() || null;

  // Ensure profile exists (handles users created before handle_new_user trigger)
  await supabase.from("profiles").upsert(
    { id: userId, email: userEmail },
    { onConflict: "id", ignoreDuplicates: true },
  );

  const slug = generateSlug(name);

  const { error } = await supabase.from("businesses").insert({
    owner_id: userId,
    name,
    slug,
    type: businessType,
    city,
    whatsapp_number: whatsappNumber,
  });

  if (error) {
    console.error("createBusiness error:", error);
    redirect("/dashboard/settings?error=business");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
