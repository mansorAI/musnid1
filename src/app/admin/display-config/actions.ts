"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminUser } from "@/lib/admin-data";

type DisplayConfigFields = {
  showImage: boolean;
  showPrice: boolean;
  showDescription: boolean;
  showLocation: boolean;
  showQtyControls: boolean;
  bookingButton: boolean;
  showDateButton: boolean;
  showTimeButton: boolean;
  allowRepeatedDateBookings: boolean;
  allowRepeatedTimeBookings: boolean;
  showGridLayout: boolean;
  showListLayout: boolean;
  showImageGallery: boolean;
};

const DISPLAY_KEYS: (keyof DisplayConfigFields)[] = [
  "showImage", "showPrice", "showDescription", "showLocation",
  "showQtyControls", "bookingButton",
  "showDateButton", "showTimeButton",
  "allowRepeatedDateBookings", "allowRepeatedTimeBookings",
  "showGridLayout", "showListLayout",
  "showImageGallery",
];

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("غير مصرح");
  return user;
}

function parseConfig(formData: FormData): DisplayConfigFields | null {
  const hasAny = DISPLAY_KEYS.some((k) => formData.get(k) !== null);
  if (!hasAny) return null;
  return Object.fromEntries(
    DISPLAY_KEYS.map((k) => [k, formData.get(k) === "on"])
  ) as DisplayConfigFields;
}

export async function setSectionDisplayConfig(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const section_key = formData.get("section_key") as string;
  const config = parseConfig(formData);

  await supabase
    .from("zone_sections")
    .update({ product_display_config: config, updated_at: new Date().toISOString() })
    .eq("section_key", section_key);

  revalidatePath("/admin/display-config");
}

export async function clearSectionDisplayConfig(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const section_key = formData.get("section_key") as string;

  await supabase
    .from("zone_sections")
    .update({ product_display_config: null, updated_at: new Date().toISOString() })
    .eq("section_key", section_key);

  revalidatePath("/admin/display-config");
}

export async function setCategoryDisplayConfig(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const category_id = formData.get("category_id") as string;
  const config = parseConfig(formData);

  await supabase
    .from("store_categories")
    .update({ product_display_config: config, updated_at: new Date().toISOString() })
    .eq("id", category_id);

  revalidatePath("/admin/display-config");
}

export async function clearCategoryDisplayConfig(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const category_id = formData.get("category_id") as string;

  await supabase
    .from("store_categories")
    .update({ product_display_config: null, updated_at: new Date().toISOString() })
    .eq("id", category_id);

  revalidatePath("/admin/display-config");
}

export async function setBusinessDisplayConfig(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const business_id = formData.get("business_id") as string;
  const config = parseConfig(formData);

  const { data: biz } = await supabase
    .from("businesses")
    .select("bot_settings")
    .eq("id", business_id)
    .single();

  const current = (biz?.bot_settings ?? {}) as Record<string, unknown>;
  await supabase
    .from("businesses")
    .update({ bot_settings: { ...current, product_display_config: config } as import("@/types/database").Json })
    .eq("id", business_id);

  revalidatePath("/admin/display-config");
}

export async function clearBusinessDisplayConfig(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const business_id = formData.get("business_id") as string;

  const { data: biz } = await supabase
    .from("businesses")
    .select("bot_settings")
    .eq("id", business_id)
    .single();

  const current = { ...((biz?.bot_settings ?? {}) as Record<string, unknown>) };
  delete current.product_display_config;

  await supabase
    .from("businesses")
    .update({ bot_settings: current as import("@/types/database").Json })
    .eq("id", business_id);

  revalidatePath("/admin/display-config");
}
