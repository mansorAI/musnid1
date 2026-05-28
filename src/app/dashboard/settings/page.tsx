import { Settings } from "lucide-react";
import { createOrganization } from "@/app/dashboard/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { businessTypeLabels } from "@/lib/demo-data";
import { getCurrentOrganization } from "@/lib/dashboard-data";
import type { BusinessType } from "@/types";

const businessTypes = Object.entries(businessTypeLabels) as [BusinessType, string][];

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

export default async function SettingsPage() {
  const organization = await getCurrentOrganization();

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
          {organization ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                <p className="text-sm text-surface-500 dark:text-surface-400">اسم النشاط</p>
                <p className="mt-1 text-xl font-bold text-surface-900 dark:text-white">{organization.name}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400">المدينة</p>
                  <p className="mt-1 font-medium text-surface-900 dark:text-white">{organization.city ?? "غير محددة"}</p>
                </div>
                <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                  <p className="text-sm text-surface-500 dark:text-surface-400">رقم WhatsApp</p>
                  <p className="mt-1 font-medium text-surface-900 dark:text-white" dir="ltr">
                    {organization.whatsapp_number ?? "غير مربوط"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 dark:border-amber-800/40 bg-amber-50 dark:bg-amber-900/20 p-4 text-sm leading-7 text-amber-700 dark:text-amber-300">
              لا يوجد نشاط حقيقي مربوط في هذه البيئة. املأ النموذج بعد إعداد Supabase وتسجيل الدخول لإنشاء أول منظمة.
            </div>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إنشاء النشاط</h2>
        </div>
        <div className="p-6">
          <form action={createOrganization} className="space-y-4">
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
            <button type="submit" className="btn-primary w-full mt-2">حفظ النشاط</button>
          </form>
        </div>
      </div>
    </div>
  );
}
