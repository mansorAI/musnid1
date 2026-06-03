import Link from "next/link";
import { AlertTriangle, FolderPlus, Plus, ReceiptText, Trash2 } from "lucide-react";
import { getSalesProductsData } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";
import { calculateInvoiceTotals } from "@/lib/zatca";
import { addSalesCategory, addSalesProduct, deleteSalesProduct, issueProductInvoice } from "../actions";

const sar = new Intl.NumberFormat("ar-SA", { style: "currency", currency: "SAR" });

type ProductsPageProps = {
  searchParams?: Promise<{ category?: string; error?: string }>;
};

export default async function SalesProductsPage({ searchParams }: ProductsPageProps) {
  const [params, data] = await Promise.all([searchParams, getSalesProductsData()]);
  const activeCategoryId = params?.category ?? "all";
  const filteredProducts =
    activeCategoryId === "all"
      ? data.products
      : data.products.filter((product) => product.category_id === activeCategoryId);
  const preview = calculateInvoiceTotals(
    data.products.slice(0, 1).map((product) => ({ name: product.name, quantity: 1, unitPrice: product.price })),
    data.settings,
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">كاشير المنتجات</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">إصدار فاتورة من المنتجات</h1>
      </section>

      <section className="glass-card space-y-4 p-5 lg:col-span-2">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <form action={addSalesCategory} className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-base font-bold text-surface-900 dark:text-white">إضافة تصنيف</h2>
              <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">مثال: سندوتشات، عصيرات، حلويات</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-[260px_auto]">
              <input name="name" required placeholder="اسم التصنيف" className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
              <button className="btn-secondary px-5">
                <FolderPlus className="size-4" />
                إضافة تصنيف
              </button>
            </div>
          </form>
        </div>

        <div className="flex gap-2 overflow-x-auto border-t border-surface-200/50 pt-4 dark:border-surface-700/30">
          <Link
            href="/dashboard/sales/products"
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              activeCategoryId === "all"
                ? "border-primary-500 bg-primary-500 text-white"
                : "border-surface-200 bg-white text-surface-600 hover:border-primary-200 hover:text-primary-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300",
            )}
          >
            كل المنتجات
          </Link>
          {data.categories.map((category) => (
            <Link
              key={category.id}
              href={`/dashboard/sales/products?category=${category.id}`}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                activeCategoryId === category.id
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-surface-200 bg-white text-surface-600 hover:border-primary-200 hover:text-primary-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <form action={issueProductInvoice} className="glass-card overflow-hidden">
        <div className="border-b border-surface-200/50 p-6 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">اختر الكميات</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            المنتجات مأخوذة من `menu_items` حتى تبقى مشتركة بين الموبايل والويب.
          </p>
        </div>

        {params?.error === "schema" ? (
          <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-800 dark:border-amber-800/40 dark:bg-amber-900/20 dark:text-amber-200">
            <AlertTriangle className="mb-2 size-5" />
            تعذّر إصدار الفاتورة لأن جداول الفوترة غير مطبقة. طبّق migration
            `20260531061600_zatca_fatoora_schema.sql`.
          </div>
        ) : null}

        <div className="divide-y divide-surface-200/50 dark:divide-surface-700/30">
          {filteredProducts.map((product) => (
            <div key={product.id} className="grid items-center gap-3 p-5 md:grid-cols-[1fr_120px_110px_auto]">
              <div>
                <p className="font-bold text-surface-900 dark:text-white">{product.name}</p>
                <p className="text-sm text-surface-500 dark:text-surface-400">{sar.format(product.price)}</p>
              </div>
              <input
                name={`qty_${product.id}`}
                type="number"
                min="0"
                step="1"
                defaultValue="0"
                className="rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-center dark:border-surface-700 dark:bg-surface-800/50"
              />
              <span className="text-sm text-surface-500 dark:text-surface-400">الكمية</span>
              {data.canManageProducts ? (
                <button
                  type="submit"
                  name="product_id"
                  value={product.id}
                  formAction={deleteSalesProduct}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-950/30"
                  aria-label="حذف المنتج"
                  title="حذف المنتج"
                >
                  <Trash2 className="size-4" />
                </button>
              ) : null}
            </div>
          ))}

          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-surface-500 dark:text-surface-400">
              لا توجد منتجات في هذا التصنيف بعد.
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 border-t border-surface-200/50 p-5 dark:border-surface-700/30 md:grid-cols-3">
          <input name="buyer_name" placeholder="اسم العميل اختياري" className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          <input name="buyer_phone" dir="ltr" placeholder="+9665..." className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          <select name="payment_method" defaultValue="card" className="rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50">
            <option value="card">بطاقة</option>
            <option value="cash">نقداً</option>
            <option value="bank_transfer">تحويل بنكي</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <div className="flex items-center justify-between border-t border-surface-200/50 p-5 dark:border-surface-700/30">
          <p className="text-sm text-surface-500 dark:text-surface-400">VAT {Math.round(data.settings.vatRate * 100)}%</p>
          <button type="submit" className="btn-primary px-5 py-2 text-sm">
            <ReceiptText className="size-4" />
            إصدار فاتورة
          </button>
        </div>
      </form>

      <aside className="space-y-4">
        <form action={addSalesProduct} className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة منتج سريع</h2>
          <input name="name" required placeholder="اسم المنتج" className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          <input name="price" required type="number" min="0" step="0.01" placeholder="السعر" className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          <select name="category_id" defaultValue={activeCategoryId === "all" ? "" : activeCategoryId} className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50">
            <option value="">بدون تصنيف</option>
            {data.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button className="btn-secondary w-full">
            <Plus className="size-4" />
            إضافة
          </button>
        </form>

        <div className="glass-card p-6 text-sm leading-7 text-surface-600 dark:text-surface-300">
          <p className="font-bold text-surface-900 dark:text-white">مثال حساب الضريبة</p>
          <p className="mt-2">الإجمالي: {sar.format(preview.total)}</p>
          <p>الضريبة: {sar.format(preview.taxTotal)}</p>
          <p>الوضع: {data.settings.taxMode}</p>
        </div>
      </aside>
    </div>
  );
}
