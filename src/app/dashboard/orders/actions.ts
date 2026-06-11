"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentBusiness } from "@/lib/dashboard-data";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import { calculateInvoiceTotals, generateInvoiceNumber, generateZatcaQrPayload, parseInvoiceSettings, splitLineTax } from "@/lib/zatca";

async function context() {
  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/orders");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/dashboard/orders");
  return { business, supabase: supabase as any, user };
}

export async function sendOrderMessage(formData: FormData) {
  const { business, supabase, user } = await context();
  const interactionId = String(formData.get("interaction_id") ?? "");
  const message = String(formData.get("message") ?? "").trim();
  if (interactionId && message) {
    await supabase.from("order_messages").insert({ interaction_id: interactionId, business_id: business.id, sender_id: user.id, sender_role: "business", message });
  }
  revalidatePath("/dashboard/orders");
}

export async function rejectOrder(formData: FormData) {
  const { business, supabase } = await context();
  const interactionId = String(formData.get("interaction_id") ?? "");
  await supabase.from("customer_interactions").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", interactionId).eq("business_id", business.id);
  revalidatePath("/dashboard/orders");
}

export async function issueOrderInvoice(formData: FormData) {
  const { business, supabase, user } = await context();
  const interactionId = String(formData.get("interaction_id") ?? "");
  const paymentMethod = String(formData.get("payment_method") ?? "bank_transfer") as "cash" | "card" | "bank_transfer" | "other";
  const { data: order } = await supabase.from("customer_interactions").select("*,interaction_items(*)").eq("id", interactionId).eq("business_id", business.id).single();
  if (!order) redirect("/dashboard/orders?error=order");

  const lines = (order.interaction_items ?? []).map((item: any) => ({ name: item.name, quantity: Number(item.qty), unitPrice: Number(item.unit_price) }));
  const { data: dbSettings } = await supabase.from("invoice_settings").select("*").eq("business_id", business.id).maybeSingle();
  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const settings = dbSettings ? { sellerName: dbSettings.seller_name || business.name, vatNumber: dbSettings.vat_number ?? "", taxMode: dbSettings.vat_mode, vatRate: Number(dbSettings.vat_rate) } : parseInvoiceSettings(botSettings.invoice_settings, business.name);
  const totals = calculateInvoiceTotals(lines, settings);
  const issuedAt = new Date().toISOString();
  const invoiceNumber = generateInvoiceNumber(dbSettings?.next_invoice_number ?? Date.now() % 1_000_000);
  const qr = generateZatcaQrPayload({ sellerName: settings.sellerName, vatNumber: settings.vatNumber, timestamp: issuedAt, total: totals.total, taxTotal: totals.taxTotal });

  const { data: invoice } = await supabase.from("invoices").insert({
    business_id: business.id, created_by: user.id, invoice_number: invoiceNumber,
    seller_name: settings.sellerName, seller_vat_number: settings.vatNumber || null,
    buyer_name: order.metadata?.customer_name ?? "عميل زون", vat_mode: settings.taxMode, vat_rate: settings.vatRate,
    subtotal_amount: totals.subtotal, taxable_amount: totals.subtotal, vat_amount: totals.taxTotal, total_amount: totals.total,
    qr_tlv: qr, payment_method: paymentMethod, issued_at: issuedAt,
  }).select("id").single();
  if (!invoice) redirect("/dashboard/orders?error=invoice");

  await supabase.from("invoice_items").insert(lines.map((line: any) => {
    const tax = splitLineTax(line, settings);
    return { invoice_id: invoice.id, business_id: business.id, name: line.name, qty: line.quantity, unit_price: line.unitPrice, taxable_amount: tax.subtotal, vat_amount: tax.taxTotal, total_amount: tax.total };
  }));
  await supabase.from("customer_interactions").update({ status: "accepted", invoice_id: invoice.id, updated_at: issuedAt }).eq("id", interactionId).eq("business_id", business.id);
  if (dbSettings) await supabase.from("invoice_settings").update({ next_invoice_number: dbSettings.next_invoice_number + 1 }).eq("business_id", business.id);

  const itemLines = lines.map((l: any) => `• ${l.name} × ${l.quantity} = ${(l.unitPrice * l.quantity).toFixed(2)} ر.س`).join("\n");
  const vatLine = totals.taxTotal > 0 ? `\nضريبة القيمة المضافة: ${totals.taxTotal.toFixed(2)} ر.س` : "";
  const serviceSupabase = createServiceClient();
  await serviceSupabase.from("order_messages").insert({
    interaction_id: interactionId,
    business_id: business.id,
    sender_role: "system",
    message: `✅ تم إصدار الفاتورة\nرقم الفاتورة: ${invoiceNumber}\n─────────────────\n${itemLines}\n─────────────────\nالمجموع: ${totals.subtotal.toFixed(2)} ر.س${vatLine}\nالإجمالي: ${totals.total.toFixed(2)} ر.س`,
  });

  revalidatePath("/dashboard/orders");
  redirect(`/dashboard/sales/${invoice.id}`);
}
