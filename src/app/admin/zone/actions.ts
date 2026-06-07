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

// ── Zone Sections ────────────────────────────────────────────────────────────

export async function createSection(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = (formData.get("name") as string).trim();
  const section_key = (formData.get("section_key") as string).trim().toLowerCase().replace(/\s+/g, "_");
  const sort_order = Number(formData.get("sort_order") ?? 0);

  await supabase.from("zone_sections").insert({ name, section_key, sort_order });
  revalidatePath("/admin/zone");
}

export async function updateSection(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const sort_order = Number(formData.get("sort_order") ?? 0);
  const bg_color_start = (formData.get("bg_color_start") as string)?.trim() || "#1a5c3a";
  const bg_color_end = (formData.get("bg_color_end") as string)?.trim() || "#2d9e6b";

  await supabase.from("zone_sections").update({ name, sort_order, bg_color_start, bg_color_end, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/zone");
}

export async function toggleSection(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";

  await supabase.from("zone_sections").update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/zone");
}

export async function deleteSection(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  await supabase.from("zone_sections").delete().eq("id", id);
  revalidatePath("/admin/zone");
}

// ── Store Categories ─────────────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = (formData.get("name") as string).trim();
  const icon = (formData.get("icon") as string).trim() || "storefront-outline";
  const section_key = (formData.get("section_key") as string) || "general";
  const action_type = (formData.get("action_type") as "order" | "booking" | "inquiry") || "order";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  await supabase.from("store_categories").insert({ name, icon, section_key, action_type, sort_order });
  revalidatePath("/admin/zone");
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const name = (formData.get("name") as string).trim();
  const icon = (formData.get("icon") as string).trim() || "storefront-outline";
  const section_key = (formData.get("section_key") as string) || "general";
  const action_type = (formData.get("action_type") as "order" | "booking" | "inquiry") || "order";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  await supabase.from("store_categories").update({ name, icon, section_key, action_type, sort_order, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/zone");
}

export async function moveCategorySection(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const id = formData.get("id") as string;
  const section_key = (formData.get("section_key") as string).trim();

  const { error } = await supabase
    .from("store_categories")
    .update({ section_key, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/zone");
  revalidatePath("/admin/display-config");
  redirect("/admin/zone");
}

export async function toggleCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";

  await supabase.from("store_categories").update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/zone");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const id = formData.get("id") as string;
  await supabase.from("store_categories").delete().eq("id", id);
  revalidatePath("/admin/zone");
}

// ── Category Icon Upload ──────────────────────────────────────────────────────

export async function uploadCategoryIcon(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const categoryId = formData.get("category_id") as string;
  const file = formData.get("icon_file") as File;

  if (!file || file.size === 0) throw new Error("لم يتم اختيار ملف");
  if (file.size > 2 * 1024 * 1024) throw new Error("حجم الملف أكبر من 2MB");

  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${categoryId}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("category-icons")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) throw new Error(uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from("category-icons")
    .getPublicUrl(path);

  // أضف cache-busting لتحديث الصورة فوراً
  const iconUrl = `${publicUrl}?v=${Date.now()}`;

  await supabase
    .from("store_categories")
    .update({ icon_url: iconUrl, updated_at: new Date().toISOString() })
    .eq("id", categoryId);

  revalidatePath("/admin/zone");
}

export async function removeCategoryIcon(formData: FormData) {
  await requireAdmin();
  const supabase = getServiceClient();

  const categoryId = formData.get("category_id") as string;

  await supabase
    .from("store_categories")
    .update({ icon_url: null, updated_at: new Date().toISOString() })
    .eq("id", categoryId);

  revalidatePath("/admin/zone");
}
