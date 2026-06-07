import { getPlans } from "@/lib/admin-data";
import { createPlan, deletePlan, addPlanFeature, removePlanFeature } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { Plus, Trash2, Star } from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  whatsapp_bot:  "بوت واتساب",
  sales:         "المبيعات",
  invoices:      "الفواتير",
  staff:         "الموظفون",
  marketplace:   "زون / السوق",
  bookings:      "الحجوزات",
  add_business:  "إضافة نشاط",
  analytics:     "التحليلات",
  multi_branch:  "فروع متعددة",
};

export default async function PackagesPage() {
  const plans = await getPlans();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">الباقات</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">إدارة باقات الاشتراك ومميزاتها</p>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {plans.map((plan: any) => (
          <div
            key={plan.id}
            className={`relative rounded-2xl border p-6 shadow-sm
              bg-white dark:bg-surface-900
              ${plan.is_featured ? "border-violet-500 ring-1 ring-violet-500" : "border-surface-200 dark:border-surface-800"}`}
          >
            {plan.is_featured && (
              <div className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white">
                <Star className="h-3 w-3 fill-current" />
                مميز
              </div>
            )}

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{plan.description}</p>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-surface-900 dark:text-white">
                  {plan.price === 0 ? "مجاني" : plan.price.toLocaleString("ar-SA")}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-surface-500 dark:text-surface-400">
                    {plan.currency} / {plan.billing_interval === "monthly" ? "شهر" : "سنة"}
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide">
                  الخصائص ({plan.plan_features?.length ?? 0})
                </p>
                {plan.plan_features?.map((pf: any) => (
                  <div key={pf.id} className="flex items-center justify-between">
                    <span className="text-sm text-surface-700 dark:text-surface-300">
                      {FEATURE_LABELS[pf.feature_key] ?? pf.feature_key}
                      {pf.feature_limit ? ` (${pf.feature_limit})` : ""}
                    </span>
                    <form action={removePlanFeature}>
                      <input type="hidden" name="featureId" value={pf.id} />
                      <button
                        type="submit"
                        className="text-rose-500 hover:text-rose-700 transition-colors"
                        title="حذف الخاصية"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>

              {/* Add feature */}
              <form action={addPlanFeature} className="flex items-center gap-2">
                <input type="hidden" name="planId" value={plan.id} />
                <select
                  name="featureKey"
                  className="flex-1 text-xs rounded-lg border px-2 py-1.5 bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                >
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <SubmitButton
                  pendingText="..."
                  className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  إضافة
                </SubmitButton>
              </form>

              {/* Delete plan */}
              <form action={deletePlan}>
                <input type="hidden" name="planId" value={plan.id} />
                <SubmitButton
                  pendingText="جاري الحذف..."
                  className="w-full text-xs py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-900/20 transition-colors"
                >
                  حذف الباقة
                </SubmitButton>
              </form>
            </div>
          </div>
        ))}

        {/* Create new plan card */}
        <div className="rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-800 p-6">
          <h3 className="mb-4 font-semibold text-surface-900 dark:text-white">إنشاء باقة جديدة</h3>
          <form action={createPlan} className="space-y-3">
            <input
              name="name"
              placeholder="اسم الباقة"
              required
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white placeholder:text-surface-400"
            />
            <input
              name="description"
              placeholder="وصف مختصر (اختياري)"
              className="w-full rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white placeholder:text-surface-400"
            />
            <div className="flex gap-2">
              <input
                name="price"
                type="number"
                min="0"
                placeholder="السعر"
                defaultValue="0"
                className="flex-1 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              />
              <select
                name="billingInterval"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              >
                <option value="monthly">شهري</option>
                <option value="yearly">سنوي</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-surface-700 dark:text-surface-300">
              <input type="checkbox" name="isFeatured" className="rounded" />
              باقة مميزة
            </label>
            <SubmitButton
              pendingText="جاري الإنشاء..."
              className="w-full rounded-xl bg-violet-600 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              إنشاء الباقة
            </SubmitButton>
          </form>
        </div>
      </div>
    </div>
  );
}
