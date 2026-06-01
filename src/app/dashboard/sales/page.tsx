import Link from "next/link";
import { FileText, PackagePlus, ReceiptText, Settings2 } from "lucide-react";
import { getSalesOverviewData } from "@/lib/dashboard-data";

const sar = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" });

export default async function SalesPage() {
  const data = await getSalesOverviewData();

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400">المبيعات والفوترة</p>
          <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">فواتير ZATCA والكاشير</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/sales/products" className="btn-primary px-4 py-2 text-sm">
            <PackagePlus className="size-4" />
            كاشير المنتجات
          </Link>
          <Link href="/dashboard/sales/settings" className="btn-secondary px-4 py-2 text-sm">
            <Settings2 className="size-4" />
            إعدادات الفوترة
          </Link>
        </div>
      </section>

      {data.schemaMissing ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
          جداول الفوترة غير مطبقة في Supabase. طبّق migration
          `supabase/migrations/20260531061600_zatca_fatoora_schema.sql` حتى تظهر الفواتير الحقيقية.
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-surface-500 dark:text-surface-400">مبيعات اليوم</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-white">{sar.format(data.todayTotal)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-surface-500 dark:text-surface-400">ضريبة اليوم</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-white">{sar.format(data.todayVat)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-surface-500 dark:text-surface-400">عدد الفواتير</p>
          <p className="mt-2 text-3xl font-extrabold text-surface-900 dark:text-white">{data.invoiceCount}</p>
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-surface-200/50 p-6 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">آخر الفواتير</h2>
          <ReceiptText className="size-5 text-primary-500" />
        </div>
        <div className="divide-y divide-surface-200/50 dark:divide-surface-700/30">
          {data.invoices.length ? (
            data.invoices.map((invoice) => (
              <Link
                key={invoice.id}
                href={`/dashboard/sales/${invoice.id}`}
                className="grid gap-3 p-5 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/30 md:grid-cols-[1fr_auto]"
              >
                <div>
                  <p className="font-bold text-surface-900 dark:text-white">{invoice.invoice_number}</p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">{invoice.buyer_name ?? "عميل نقدي"}</p>
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-surface-900 dark:text-white">{sar.format(Number(invoice.total_amount))}</p>
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    {new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(invoice.issued_at))}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-surface-500">
              <FileText className="mx-auto mb-3 size-8 text-surface-400" />
              لا توجد فواتير بعد.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
