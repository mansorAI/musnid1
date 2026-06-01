import { getInvoiceSettingsData } from "@/lib/dashboard-data";
import { saveInvoiceSettings } from "../actions";

type SalesSettingsPageProps = {
  searchParams?: Promise<{ saved?: string }>;
};

export default async function SalesSettingsPage({ searchParams }: SalesSettingsPageProps) {
  const [params, data] = await Promise.all([searchParams, getInvoiceSettingsData()]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">إعدادات الفوترة</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">الضريبة وبيانات البائع</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="border-b border-surface-200/50 p-6 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إعدادات ZATCA Phase 1</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            يتم حفظ الإعدادات في `invoice_settings`، ومع غياب الجدول تُحفظ مؤقتاً في `businesses.bot_settings`.
          </p>
        </div>
        <form action={saveInvoiceSettings} className="space-y-4 p-6">
          {params?.saved ? (
            <div className="rounded-xl border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700 dark:border-accent-800 dark:bg-accent-900/20 dark:text-accent-300">
              تم حفظ إعدادات الفوترة.
            </div>
          ) : null}
          <label className="block space-y-1.5 text-sm font-medium text-surface-700 dark:text-surface-300">
            اسم البائع
            <input name="seller_name" defaultValue={data.settings.sellerName} className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-surface-700 dark:text-surface-300">
            الرقم الضريبي
            <input name="vat_number" dir="ltr" maxLength={15} defaultValue={data.settings.vatNumber} placeholder="300000000000003" className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-surface-700 dark:text-surface-300">
            عنوان البائع
            <input name="seller_address" className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50" />
          </label>
          <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
            <input name="vat_registered" type="checkbox" className="size-4" defaultChecked={Boolean(data.settings.vatNumber)} />
            مسجل في ضريبة القيمة المضافة
          </label>
          <label className="block space-y-1.5 text-sm font-medium text-surface-700 dark:text-surface-300">
            طريقة الضريبة
            <select name="vat_mode" defaultValue={data.settings.taxMode} className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 dark:border-surface-700 dark:bg-surface-800/50">
              <option value="none">بدون ضريبة</option>
              <option value="inclusive">السعر شامل الضريبة</option>
              <option value="exclusive">الضريبة تضاف على السعر</option>
            </select>
          </label>
          <button type="submit" className="btn-primary w-full">حفظ الإعدادات</button>
        </form>
      </div>

      <aside className="glass-card p-6">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">حالة الربط</h2>
        <div className="mt-4 rounded-xl border border-surface-200 bg-surface-50 p-4 text-sm leading-7 text-surface-600 dark:border-surface-700 dark:bg-surface-800/30 dark:text-surface-300">
          {data.fromFallback
            ? "الإعدادات تعمل حالياً عبر fallback داخل bot_settings إلى أن يتم تطبيق migration الفوترة."
            : "الإعدادات مربوطة مباشرة بجدول invoice_settings المشترك مع الموبايل."}
        </div>
        <div className="mt-4 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm leading-7 text-primary-700 dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-300">
          Phase 2 يتطلب Backend/Edge Function للتوقيع والختم وXML/UBL والتكامل مع Fatoora.
        </div>
      </aside>
    </div>
  );
}
