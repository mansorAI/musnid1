"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/dashboard-data";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import {
  calculateInvoiceTotals,
  generateInvoiceNumber,
  generateZatcaQrPayload,
  parseInvoiceSettings,
  splitLineTax,
  type TaxMode,
} from "@/lib/zatca";

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function requireBusiness(next = "/dashboard/sales") {
  if (!hasSupabaseEnv()) redirect(`${next}?demo=1`);

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/sales");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/dashboard/sales");
  return { business, supabase, userId: user.id };
}

export async function saveInvoiceSettings(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/settings");
  const sellerName = String(formData.get("seller_name") ?? business.name).trim() || business.name;
  const vatNumber = String(formData.get("vat_number") ?? "").trim() || null;
  const sellerAddress = String(formData.get("seller_address") ?? "").trim() || null;
  const vatMode = String(formData.get("vat_mode") ?? "exclusive") as TaxMode;
  const vatRegistered = formData.get("vat_registered") === "on";

  const payload = {
    business_id: business.id,
    seller_name: sellerName,
    vat_number: vatNumber,
    seller_address: sellerAddress,
    vat_registered: vatRegistered,
    vat_mode: vatMode,
    vat_rate: 0.15,
  };

  const { error } = await supabase.from("invoice_settings").upsert(payload, { onConflict: "business_id" });

  if (error) {
    const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
    await supabase.from("businesses").update({
      bot_settings: {
        ...botSettings,
        invoice_settings: {
          sellerName,
          vatNumber: vatNumber ?? "",
          sellerAddress: sellerAddress ?? "",
          taxMode: vatMode,
          vatRate: 0.15,
          vatRegistered,
        },
      },
    }).eq("id", business.id);
  }

  revalidatePath("/dashboard/sales/settings");
  revalidatePath("/dashboard/sales");
  redirect("/dashboard/sales/settings?saved=1");
}

export async function addSalesProduct(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/products");
  const name = String(formData.get("name") ?? "").trim();
  const price = toNumber(formData.get("price"));
  const categoryId = String(formData.get("category_id") ?? "").trim() || null;

  if (!name || price <= 0) redirect("/dashboard/sales/products?error=product");

  if (categoryId) {
    const { data: category } = await supabase
      .from("menu_categories")
      .select("id")
      .eq("id", categoryId)
      .eq("business_id", business.id)
      .maybeSingle();

    if (!category) redirect("/dashboard/sales/products?error=category");
  }

  const { error } = await supabase.from("menu_items").insert({
    business_id: business.id,
    category_id: categoryId,
    name,
    price,
    is_available: true,
    display_order: 0,
  });

  if (error) redirect("/dashboard/sales/products?error=product");

  revalidatePath("/dashboard/sales/products");
  redirect("/dashboard/sales/products");
}

export async function addSalesCategory(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/products");
  const name = String(formData.get("name") ?? "").trim();

  if (!name) redirect("/dashboard/sales/products?error=category");

  const { data: lastCategory } = await supabase
    .from("menu_categories")
    .select("display_order")
    .eq("business_id", business.id)
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("menu_categories").insert({
    business_id: business.id,
    name,
    display_order: (lastCategory?.display_order ?? 0) + 1,
  });

  if (error) redirect("/dashboard/sales/products?error=category");

  revalidatePath("/dashboard/sales/products");
  revalidatePath("/dashboard/menu");
  redirect("/dashboard/sales/products");
}

export async function deleteSalesProduct(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/products");
  const productId = String(formData.get("product_id") ?? "").trim();

  if (!productId) redirect("/dashboard/sales/products?error=delete");

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", productId)
    .eq("business_id", business.id);

  if (error) redirect("/dashboard/sales/products?error=delete");

  revalidatePath("/dashboard/sales/products");
  revalidatePath("/dashboard/menu");
  redirect("/dashboard/sales/products");
}

export async function issueProductInvoice(formData: FormData) {
  const { business, supabase, userId } = await requireBusiness("/dashboard/sales/products");

  const { data: menuItems } = await supabase
    .from("menu_items")
    .select("id,name,price")
    .eq("business_id", business.id)
    .eq("is_available", true);

  const selected = (menuItems ?? [])
    .map((item) => ({
      id: item.id,
      name: item.name,
      quantity: toNumber(formData.get(`qty_${item.id}`)),
      unitPrice: Number(item.price),
    }))
    .filter((item) => item.quantity > 0);

  if (!selected.length) redirect("/dashboard/sales/products?error=empty");

  const { data: dbSettings } = await supabase
    .from("invoice_settings")
    .select("*")
    .eq("business_id", business.id)
    .maybeSingle();

  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const settings = dbSettings
    ? {
        sellerName: dbSettings.seller_name || business.name,
        vatNumber: dbSettings.vat_number ?? "",
        taxMode: dbSettings.vat_mode,
        vatRate: Number(dbSettings.vat_rate),
      }
    : parseInvoiceSettings(botSettings.invoice_settings, business.name);

  const totals = calculateInvoiceTotals(selected, settings);
  const invoiceNumber = generateInvoiceNumber(dbSettings?.next_invoice_number ?? Date.now() % 1_000_000);
  const issuedAt = new Date().toISOString();
  const qrPayload = generateZatcaQrPayload({
    sellerName: settings.sellerName,
    vatNumber: settings.vatNumber,
    timestamp: issuedAt,
    total: totals.total,
    taxTotal: totals.taxTotal,
  });

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      business_id: business.id,
      created_by: userId,
      invoice_number: invoiceNumber,
      seller_name: settings.sellerName,
      seller_vat_number: settings.vatNumber || null,
      buyer_name: String(formData.get("buyer_name") ?? "").trim() || "عميل نقدي",
      buyer_phone: String(formData.get("buyer_phone") ?? "").trim() || null,
      vat_mode: settings.taxMode,
      vat_rate: settings.vatRate,
      subtotal_amount: totals.subtotal,
      taxable_amount: totals.subtotal,
      vat_amount: totals.taxTotal,
      total_amount: totals.total,
      qr_tlv: qrPayload,
      payment_method: String(formData.get("payment_method") ?? "card") as "cash" | "card" | "bank_transfer" | "other",
      issued_at: issuedAt,
    })
    .select("id")
    .single();

  if (invoiceError || !invoice) redirect("/dashboard/sales/products?error=schema");

  const invoiceItems = selected.map((item) => {
    const lineTotals = splitLineTax({ name: item.name, quantity: item.quantity, unitPrice: item.unitPrice }, settings);
    return {
      invoice_id: invoice.id,
      business_id: business.id,
      name: item.name,
      qty: item.quantity,
      unit_price: item.unitPrice,
      taxable_amount: lineTotals.subtotal,
      vat_amount: lineTotals.taxTotal,
      total_amount: lineTotals.total,
    };
  });

  const { error: itemError } = await supabase.from("invoice_items").insert(invoiceItems);
  if (itemError) redirect("/dashboard/sales/products?error=schema");

  if (dbSettings) {
    await supabase
      .from("invoice_settings")
      .update({ next_invoice_number: dbSettings.next_invoice_number + 1 })
      .eq("business_id", business.id);
  }

  revalidatePath("/dashboard/sales");
  revalidatePath(`/dashboard/sales/${invoice.id}`);
  redirect(`/dashboard/sales/${invoice.id}`);
}


// ── العروض ──────────────────────────────────────────────────────────────────

export async function addOffer(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/products");
  const title = String(formData.get("title") ?? "").trim();
  const product_id = String(formData.get("product_id") ?? "").trim() || null;

  if (!title) redirect("/dashboard/sales/products?error=offer_title");

  const { data: existing } = await supabase
    .from("business_offers")
    .select("id, sort_order")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: false })
    .limit(1);

  const sort_order = existing && existing.length > 0 ? (existing[0] as any).sort_order + 1 : 0;

  await supabase.from("business_offers").insert({
    business_id: business.id,
    title,
    product_id,
    is_visible: true,
    sort_order,
  });

  revalidatePath("/dashboard/sales/products");
  redirect("/dashboard/sales/products");
}

export async function toggleOfferVisibility(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/products");
  const offerId = String(formData.get("offer_id") ?? "").trim();
  const isVisible = formData.get("is_visible") === "true";

  if (!offerId) return;

  await supabase
    .from("business_offers")
    .update({ is_visible: isVisible })
    .eq("id", offerId)
    .eq("business_id", business.id);

  revalidatePath("/dashboard/sales/products");
}

export async function deleteOffer(formData: FormData) {
  const { business, supabase } = await requireBusiness("/dashboard/sales/products");
  const offerId = String(formData.get("offer_id") ?? "").trim();

  if (!offerId) redirect("/dashboard/sales/products");

  await supabase
    .from("business_offers")
    .delete()
    .eq("id", offerId)
    .eq("business_id", business.id);

  revalidatePath("/dashboard/sales/products");
  redirect("/dashboard/sales/products");
}
