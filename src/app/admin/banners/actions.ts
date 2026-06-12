"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin-data";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("غير مصرح");
  return user;
}

// ── ad_banners ──────────────────────────────────────────────────────────────

export async function createBanner(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const title = (formData.get("title") as string).trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || null;
  let image_url = (formData.get("image_url") as string)?.trim() || null;
  const bg_color = (formData.get("bg_color") as string)?.trim() ?? "";
  const section_key = (formData.get("section_key") as string) || "general";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  const imageFile = formData.get("image_file") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const { data: up } = await supabase.storage
      .from("banners")
      .upload(`banners/${Date.now()}.${ext}`, imageFile, { contentType: imageFile.type, upsert: false });
    if (up) {
      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(up.path);
      image_url = publicUrl;
    }
  }

  await supabase.from("ad_banners").insert({ title, subtitle, image_url, bg_color, section_key, sort_order });
  revalidatePath("/admin/banners");
}

export async function updateBanner(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string).trim();
  const subtitle = (formData.get("subtitle") as string)?.trim() || null;
  let image_url = (formData.get("image_url") as string)?.trim() || null;
  const bg_color = (formData.get("bg_color") as string)?.trim() ?? "";
  const section_key = (formData.get("section_key") as string) || "general";
  const sort_order = Number(formData.get("sort_order") ?? 0);

  const imageFile = formData.get("image_file") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const { data: up } = await supabase.storage
      .from("banners")
      .upload(`banners/${Date.now()}.${ext}`, imageFile, { contentType: imageFile.type, upsert: false });
    if (up) {
      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(up.path);
      image_url = publicUrl;
    }
  }

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
  await supabase.from("ad_banners").update({ is_active: !is_active, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/admin/banners");
}

export async function deleteBanner(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("ad_banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
}

// ── business_offers (admin control) ────────────────────────────────────────

export async function toggleBusinessOffer(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const id = formData.get("id") as string;
  const is_visible = formData.get("is_visible") === "true";
  await supabase.from("business_offers").update({ is_visible: !is_visible }).eq("id", id);
  revalidatePath("/admin/banners");
}

export async function deleteBusinessOffer(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const id = formData.get("id") as string;
  await supabase.from("business_offers").delete().eq("id", id);
  revalidatePath("/admin/banners");
}

export async function updateBusinessOfferTitle(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string).trim();
  await supabase.from("business_offers").update({ title }).eq("id", id);
  revalidatePath("/admin/banners");
}

// ── admin_offers ────────────────────────────────────────────────────────────

export async function createAdminOffer(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const title = (formData.get("title") as string).trim();
  const link_type = formData.get("link_type") as string;
  const external_url = link_type === "external" ? (formData.get("external_url") as string)?.trim() || null : null;
  const business_id = (link_type === "store" || link_type === "product")
    ? (formData.get("business_id") as string) || null : null;
  const product_id = link_type === "product"
    ? (formData.get("product_id") as string) || null : null;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  let image_url: string | null = null;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const { data: up } = await supabase.storage
      .from("banners")
      .upload(`offers/${Date.now()}.${ext}`, imageFile, { contentType: imageFile.type, upsert: false });
    if (up) {
      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(up.path);
      image_url = publicUrl;
    }
  }

  await supabase.from("admin_offers").insert({ title, image_url, external_url, business_id, product_id, sort_order });
  revalidatePath("/admin/banners");
}

export async function toggleAdminOffer(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  await supabase.from("admin_offers").update({ is_active: !is_active }).eq("id", id);
  revalidatePath("/admin/banners");
}

export async function deleteAdminOffer(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = formData.get("id") as string;
  await supabase.from("admin_offers").delete().eq("id", id);
  revalidatePath("/admin/banners");
}

export async function updateAdminOffer(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const id = formData.get("id") as string;
  const title = (formData.get("title") as string).trim();
  const external_url = (formData.get("external_url") as string)?.trim() || null;
  const sort_order = Number(formData.get("sort_order") ?? 0);

  let image_url: string | null = (formData.get("existing_image_url") as string)?.trim() || null;
  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split(".").pop() ?? "jpg";
    const { data: up } = await supabase.storage
      .from("banners")
      .upload(`offers/${Date.now()}.${ext}`, imageFile, { contentType: imageFile.type, upsert: false });
    if (up) {
      const { data: { publicUrl } } = supabase.storage.from("banners").getPublicUrl(up.path);
      image_url = publicUrl;
    }
  }

  await supabase.from("admin_offers").update({ title, image_url, external_url, sort_order }).eq("id", id);
  revalidatePath("/admin/banners");
}
