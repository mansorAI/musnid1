import { getPlans, getBusinessSubscriptions } from "@/lib/admin-data";
import { assignSubscription } from "@/app/admin/actions";
import { getAllBusinesses } from "@/lib/admin-data";
import { SubmitButton } from "@/components/ui/submit-button";

const FEATURES = [
  { key: "whatsapp_bot", label: "بوت واتساب", desc: "ردود ذكية تلقائية على واتساب" },
  { key: "sales", label: "المبيعات", desc: "إدارة المنتجات وكاشير البيع" },
  { key: "invoices", label: "الفواتير", desc: "إصدار فواتير ZATCA متوافقة" },
  { key: "staff", label: "الموظفون", desc: "إدارة فريق العمل والصلاحيات" },
  { key: "marketplace", label: "زون / السوق", desc: "ظهور المنشأة في سوق الأفراد" },
  { key: "bookings", label: "الحجوزات", desc: "نظام المواعيد والحجوزات" },
  { key: "medical_records", label: "السجلات الطبية", desc: "ملفات المرضى والتشخيصات" },
  { key: "analytics", label: "التحليلات", desc: "تقارير وإحصائيات متقدمة" },
  { key: "multi_branch", label: "فروع متعددة", desc: "إدارة أكثر من فرع" },
];

export default async function FeaturesPage() {
  const [plans, businesses, subscriptions] = await Promise.all([
    getPlans(),
    getAllBusinesses(),
    getBusinessSubscriptions(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">الخصائص</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          جميع مفاتيح الخصائص المتاحة في النظام
        </p>
      </div>

      {/* Features catalog */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.key}
            className="rounded-2xl border bg-white p-4 shadow-sm dark:bg-surface-900 dark:border-surface-800"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{feature.label}</p>
                <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{feature.desc}</p>
              </div>
              <code className="text-xs rounded bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-surface-600 dark:text-surface-400 shrink-0">
                {feature.key}
              </code>
            </div>
            <p className="mt-2 text-xs text-surface-400 dark:text-surface-600">
              متوفر في:{" "}
              {plans
                .filter((p: any) =>
                  p.plan_features?.some((pf: any) => pf.feature_key === feature.key)
                )
                .map((p: any) => p.name)
                .join("، ") || "لا توجد باقة"}
            </p>
          </div>
        ))}
      </div>

      {/* Assign subscription to business */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-surface-900 dark:border-surface-800">
        <h2 className="mb-4 text-lg font-semibold text-surface-900 dark:text-white">
          إسناد باقة لمنشأة
        </h2>
        <form action={assignSubscription} className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-surface-500 dark:text-surface-400">المنشأة</label>
            <select
              name="businessId"
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
            >
              {businesses.map((b: any) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-surface-500 dark:text-surface-400">الباقة</label>
            <select
              name="planId"
              className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
            >
              {plans.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <SubmitButton
            pendingText="جاري الإسناد..."
            className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            إسناد
          </SubmitButton>
        </form>
      </div>

      {/* Active subscriptions */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800">
        <div className="p-4 border-b border-surface-100 dark:border-surface-800">
          <h2 className="font-semibold text-surface-900 dark:text-white">
            الاشتراكات النشطة ({subscriptions.length})
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-surface-50 dark:bg-surface-800/50">
            <tr>
              <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">المنشأة</th>
              <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الباقة</th>
              <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الحالة</th>
              <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">تاريخ الانتهاء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
            {subscriptions.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">
                  {sub.business?.name ?? "—"}
                </td>
                <td className="px-4 py-3 text-surface-600 dark:text-surface-400">
                  {sub.plan?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                    sub.status === "active"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : sub.status === "trial"
                      ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-surface-100 text-surface-500 dark:bg-surface-800"
                  }`}>
                    {sub.status === "active" ? "نشط" : sub.status === "trial" ? "تجريبي" : sub.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-surface-500 dark:text-surface-400 text-xs">
                  {sub.expires_at
                    ? new Date(sub.expires_at).toLocaleDateString("ar-SA")
                    : "بلا انتهاء"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscriptions.length === 0 && (
          <div className="py-12 text-center text-surface-500 dark:text-surface-400">
            لا توجد اشتراكات نشطة
          </div>
        )}
      </div>
    </div>
  );
}
