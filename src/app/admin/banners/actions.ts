"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin-data";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("غير مصرح");
  return user;
}

export async function createBanner(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const title = (formData.get("title") as string).trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || null;
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const bg_color = (formData.get("bg_color") as string) || "#7a5af8";
  const section_key = (formData.get("section_key") as string) || "general";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  await supabase.from("ad_banners").insert({ title, subtitle, image_url, bg_color, section_key, sort_order });
  revalidatePath("/admin/banners");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string).trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || null;
  const image_url = (formData.get("image_url") as string)?.trim() || null;
  const bg_color = (formData.get("bg_color") as string) || "#7a5af8";
  const section_key = (formData.get("section_key") as string) || "general";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  await supabase
    .from("ad_banners")
    .update({ title, subtitle, image_url, bg_color, section_key, sort_order, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/banners");
}

export async function toggleBanner(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";

  await supabase
    .from("ad_banners")
    .update({ is_active: !is_active, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/admin/banners");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  await supabase.from("ad_banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
}
