import Link from "next/link";
import { Compass, Eye, EyeOff, ReceiptText, Settings } from "lucide-react";
import { createBusiness, setMarketplaceVisibility } from "@/app/dashboard/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { ThemeSelector } from "@/components/theme-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessTypeLabels } from "@/lib/demo-data";
import { getCurrentBusiness, getMarketplaceVisibility } from "@/lib/dashboard-data";
import type { BusinessType } from "@/types";

const businessTypes = Object.entries(businessTypeLabels) as [BusinessType, string][];

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

type SettingsPageProps = {
  searchParams?: Promise<{
    error?: string;
    zone?: string;
  }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const business = await getCurrentBusiness();
  const marketplace = await getMarketplaceVisibility();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <section className="space-y-2 lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">الإعداد</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">بيانات النشاط وربط WhatsApp</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">النشاط الحالي</h2>
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Settings className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6">
          {business ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                <p className="text-sm text-surface-500 dark:text-surface-400">اسم النشاط</p>
                <p className="mt-1 text-xl font-bold text-surface-900 dark:text-white">{business.name}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400">المدينة</p>
                  <p className="mt-1 font-medium text-surface-900 dark:text-white">{business.city ?? "غير محددة"}</p>
                </div>
                <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400">رقم WhatsApp</p>
                  <p className="mt-1 font-medium text-surface-900 dark:text-white" dir="ltr">
                    {business.whatsapp_number ?? "غير مربوط"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm leading-7 text-amber-700 dark:text-amber-300">
              لا يوجد نشاط حقيقي مربوط في هذه البيئة. تجربة الإعداد الأولى أصبحت في صفحة onboarding، ويمكنك استخدام هذا النموذج لإدارة النشاط لاحقا.
            </div>
          )}
        </div>
      </div>

      <Link
        href="/dashboard/sales"
        className="glass-card flex items-center justify-between gap-4 p-6 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/30"
      >
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">المبيعات والفوترة</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            كاشير المنتجات، الفواتير، إعدادات VAT وZATCA Phase 1.
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
          <ReceiptText className="size-5" />
        </div>
      </Link>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-surface-200/50 p-6 dark:border-surface-700/30">
          <div className="text-right">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">إظهار المتجر في الزون</h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              فعّل ظهور نشاطك للأفراد ضمن فئة {marketplace.categoryName}.
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
            <Compass className="size-5" />
          </div>
        </div>
        <div className="space-y-4 p-6">
          {params?.zone === "enabled" ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
              تم تفعيل ظهور المتجر في الزون.
            </div>
          ) : null}
          {params?.zone === "disabled" ? (
            <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 text-sm text-surface-600 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-300">
              تم إيقاف ظهور المتجر في الزون.
            </div>
          ) : null}
          {params?.error === "zone_category" || marketplace.targetCategoryMissing ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
              فئة {marketplace.categoryName} غير موجودة في زون. أضفها في Supabase أولاً ثم أعد المحاولة.
            </div>
          ) : null}
          {params?.error === "zone" ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              تعذّر تحديث ظهور المتجر في الزون. تحقق من صلاحيات Supabase.
            </div>
          ) : null}

          <div className="rounded-xl border border-surface-200/50 bg-surface-50/50 p-4 text-right dark:border-surface-700/30 dark:bg-surface-800/30">
            <p className="text-sm text-surface-500 dark:text-surface-400">الحالة الحالية</p>
            <p className={`mt-1 text-lg font-extrabold ${marketplace.active ? "text-emerald-600 dark:text-emerald-300" : "text-surface-900 dark:text-white"}`}>
              {marketplace.active ? "ظاهر في الزون" : "غير ظاهر حالياً"}
            </p>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              الفئة: {marketplace.activeCategoryName ?? marketplace.categoryName}
            </p>
          </div>

          <form action={setMarketplaceVisibility}>
            <input type="hidden" name="enabled" value={marketplace.active ? "0" : "1"} />
            <SubmitButton
              pendingText="جاري التحديث..."
              className={marketplace.active ? "w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300" : "btn-primary w-full"}
              disabled={!business || marketplace.targetCategoryMissing}
            >
              <span className="inline-flex items-center justify-center gap-2">
                {marketplace.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {marketplace.active ? "إيقاف الظهور في الزون" : "إظهار المتجر في الزون"}
              </span>
            </SubmitButton>
          </form>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">المظهر</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            اختر الوضع الذي يناسب شاشة العمل الحالية.
          </p>
        </div>
        <div className="p-6">
          <ThemeSelector />
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إنشاء النشاط</h2>
        </div>
        <div className="p-6">
          {params?.error ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              تعذر حفظ النشاط. تأكد من تسجيل الدخول وتطبيق قاعدة البيانات الجديدة.
            </div>
          ) : null}
          <form action={createBusiness} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-surface-700 dark:text-surface-300">اسم النشاط</Label>
              <Input id="name" name="name" placeholder="مثال: عيادة النخبة" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="business_type" className="text-surface-700 dark:text-surface-300">نوع النشاط</Label>
              <Select name="business_type" defaultValue="services">
                <SelectTrigger id="business_type" className="w-full rounded-xl">
                  <SelectValue placeholder="اختر نوع النشاط" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city" className="text-surface-700 dark:text-surface-300">المدينة</Label>
              <Input id="city" name="city" placeholder="الرياض" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp_number" className="text-surface-700 dark:text-surface-300">رقم WhatsApp</Label>
              <Input id="whatsapp_number" name="whatsapp_number" dir="ltr" placeholder="+9665..." className={inputClass} />
            </div>
            <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full mt-2">
              حفظ النشاط
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
