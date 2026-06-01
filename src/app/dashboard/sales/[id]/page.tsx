import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, QrCode } from "lucide-react";
import { getCurrentBusiness } from "@/lib/dashboard-data";
import { createClient } from "@/lib/supabase/server";

const sar = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" });

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, business] = await Promise.all([params, getCurrentBusiness()]);
  if (!business) notFound();

  const supabase = await createClient();
  const [{ data: invoice }, { data: items }] = await Promise.all([
    supabase.from("invoices").select("*").eq("id", id).eq("business_id", business.id).maybeSingle(),
    supabase.from("invoice_items").select("*").eq("invoice_id", id).eq("business_id", business.id),
  ]);

  if (!invoice) notFound();

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400">تفاصيل الفاتورة</p>
          <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">{invoice.invoice_number}</h1>
        </div>
        <Link href="/dashboard/sales" className="btn-secondary px-4 py-2 text-sm">
          <ArrowRight className="size-4" />
          رجوع
        </Link>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="glass-card overflow-hidden">
          <div className="grid gap-4 border-b border-surface-200/50 p-6 dark:border-surface-700/30 md:grid-cols-2">
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">البائع</p>
              <p className="mt-1 font-bold text-surface-900 dark:text-white">{invoice.seller_name}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400" dir="ltr">{invoice.seller_vat_number ?? "بدون رقم ضريبي"}</p>
            </div>
            <div>
              <p className="text-sm text-surface-500 dark:text-surface-400">المشتري</p>
              <p className="mt-1 font-bold text-surface-900 dark:text-white">{invoice.buyer_name ?? "عميل نقدي"}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400" dir="ltr">{invoice.buyer_phone ?? ""}</p>
            </div>
          </div>

          <div className="divide-y divide-surface-200/50 dark:divide-surface-700/30">
            {(items ?? []).map((item) => (
              <div key={item.id} className="grid gap-3 p-5 md:grid-cols-[1fr_100px_120px_120px]">
                <p className="font-bold text-surface-900 dark:text-white">{item.name}</p>
                <p className="text-surface-600 dark:text-surface-300">x{Number(item.qty)}</p>
                <p className="text-surface-600 dark:text-surface-300">{sar.format(Number(item.unit_price))}</p>
                <p className="font-bold text-surface-900 dark:text-white">{sar.format(Number(item.total_amount))}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-card p-6">
            <p className="text-sm text-surface-500 dark:text-surface-400">الإجمالي قبل الضريبة</p>
            <p className="mt-1 text-xl font-extrabold text-surface-900 dark:text-white">{sar.format(Number(invoice.subtotal_amount))}</p>
            <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">ضريبة القيمة المضافة</p>
            <p className="mt-1 text-xl font-extrabold text-surface-900 dark:text-white">{sar.format(Number(invoice.vat_amount))}</p>
            <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">الإجمالي</p>
            <p className="mt-1 text-3xl font-extrabold text-primary-600 dark:text-primary-300">{sar.format(Number(invoice.total_amount))}</p>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 font-bold text-surface-900 dark:text-white">
              <QrCode className="size-5" />
              QR الضريبي
            </div>
            <div className="mt-4 rounded-xl border border-dashed border-surface-300 bg-surface-50 p-4 text-xs break-all text-surface-600 dark:border-surface-700 dark:bg-surface-800/30 dark:text-surface-300" dir="ltr">
              {invoice.qr_tlv ?? "لا يوجد QR"}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
