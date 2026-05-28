import { Wrench } from "lucide-react";
import { getServicesData } from "@/lib/dashboard-data";
import { SubmitButton } from "@/components/ui/submit-button";
import { addService, toggleServiceActive } from "./actions";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

const demoServices = [
  { id: "demo-sv1", name: "كشف عام", description: "فحص طبي شامل", price: 100, price_max: null, duration_minutes: 30, is_active: true, staff_members: null },
  { id: "demo-sv2", name: "تنظيف أسنان", description: null, price: 150, price_max: null, duration_minutes: 45, is_active: true, staff_members: null },
  { id: "demo-sv3", name: "استشارة تغذية", description: null, price: 200, price_max: null, duration_minutes: 60, is_active: false, staff_members: null },
];

type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  price_max: number | null;
  duration_minutes: number;
  is_active: boolean;
  staff_members: { name: string } | null;
};

type ServicesPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function ServicesPage({ searchParams }: ServicesPageProps) {
  const params = await searchParams;
  const { services: rawServices, staff, businessId } = await getServicesData();

  const services: ServiceRow[] = rawServices.length === 0
    ? demoServices
    : (rawServices as ServiceRow[]);
  const isDemo = rawServices.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-2 lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">الخدمات</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">الخدمات المقدمة</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">قائمة الخدمات</h2>
            {isDemo && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">عرض تجريبي</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
        <div className="divide-y divide-surface-200/30 dark:divide-surface-700/20">
          {services.map((service) => (
            <div key={service.id} className="flex items-center justify-between gap-4 px-6 py-4">
              <div className="min-w-0">
                <p className="font-bold text-surface-900 dark:text-white">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">{service.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <span className="rounded-lg bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-xs text-surface-500">
                    {service.duration_minutes} د
                  </span>
                  {service.price != null && (
                    <span className="rounded-lg bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 text-xs text-primary-700 dark:text-primary-300">
                      {service.price}{service.price_max ? `–${service.price_max}` : ""} ر.س
                    </span>
                  )}
                  {(service.staff_members as { name: string } | null)?.name && (
                    <span className="rounded-lg bg-accent-100 dark:bg-accent-900/30 px-2 py-0.5 text-xs text-accent-700 dark:text-accent-300">
                      {(service.staff_members as { name: string }).name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`rounded-lg px-2 py-1 text-xs font-medium ${
                  service.is_active
                    ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
                    : "bg-surface-100 dark:bg-surface-800 text-surface-500"
                }`}>
                  {service.is_active ? "نشطة" : "موقوفة"}
                </span>
                {businessId && !isDemo && (
                  <form action={toggleServiceActive}>
                    <input type="hidden" name="id" value={service.id} />
                    <input type="hidden" name="is_active" value={String(service.is_active)} />
                    <button
                      type="submit"
                      title={service.is_active ? "إيقاف" : "تفعيل"}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium border border-surface-200 dark:border-surface-700 text-surface-500 hover:text-primary-600 hover:border-primary-300 transition-colors"
                    >
                      {service.is_active ? "إيقاف" : "تفعيل"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة خدمة</h2>
        </div>
        <div className="p-6">
          {params?.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              تعذر الإضافة. تأكد من إدخال اسم الخدمة.
            </div>
          )}
          {businessId ? (
            <form action={addService} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">اسم الخدمة *</label>
                <input name="name" className={inputClass} placeholder="كشف عام" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">الوصف</label>
                <input name="description" className={inputClass} placeholder="وصف مختصر للخدمة" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">السعر (ر.س)</label>
                  <input name="price" type="number" min="0" step="1" className={inputClass} placeholder="100" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">المدة (دقيقة)</label>
                  <input name="duration_minutes" type="number" min="5" step="5" defaultValue="30" className={inputClass} />
                </div>
              </div>
              {staff.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">الموظف المسؤول</label>
                  <select name="staff_id" className={inputClass}>
                    <option value="">— غير محدد —</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <SubmitButton pendingText="جاري الإضافة..." className="btn-primary w-full">
                إضافة خدمة
              </SubmitButton>
            </form>
          ) : (
            <div className="rounded-xl border border-primary-200/50 dark:border-primary-800/30 bg-primary-50/50 dark:bg-primary-900/10 p-4 text-sm text-primary-700 dark:text-primary-300 leading-7">
              سجّل دخولك وأنشئ نشاطاً لإضافة خدمات حقيقية.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
