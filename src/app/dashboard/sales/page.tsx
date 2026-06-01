import Link from "next/link";
import { PackagePlus, Settings2 } from "lucide-react";
import { getAllSalesInvoices } from "@/lib/dashboard-data";
import SalesList from "./sales-list";

export default async function SalesPage() {
  const data = await getAllSalesInvoices();

  return (
    <div className="grid gap-6">
      {/* ── Header ── */}
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400">المبيعات والفوترة</p>
          <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">
            فواتير ZATCA والكاشير
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/sales/products"
            className="btn-primary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <PackagePlus className="size-4" />
            كاشير المنتجات
          </Link>
          <Link
            href="/dashboard/sales/settings"
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm"
          >
            <Settings2 className="size-4" />
            إعدادات الفوترة
          </Link>
        </div>
      </section>

      {data.schemaMissing ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
          جداول الفوترة غير مطبّقة في Supabase. طبّق migration{" "}
          <code className="font-mono">supabase/migrations/20260531061600_zatca_fatoora_schema.sql</code>.
        </div>
      ) : null}

      <SalesList invoices={data.invoices} />
    </div>
  );
}
