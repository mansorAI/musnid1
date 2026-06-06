"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin-data";

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

  await supabase.from("zone_sections").update({ name, sort_order, updated_at: new Date().toISOString() }).eq("id", id);
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
  const supabase = await createClient();

  const id = formData.get("id") as string;
  const section_key = (formData.get("section_key") as string).trim();

  await supabase
    .from("store_categories")
    .update({ section_key, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/zone");
  revalidatePath("/admin/display-config");
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
