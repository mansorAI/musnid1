import { CalendarDays, Trash2 } from "lucide-react";
import { getCalendarData } from "@/lib/dashboard-data";
import { deleteCalendarOverride } from "./actions";
import { CalendarOverrideForm } from "./calendar-override-form";
import { WorkingHoursEditor } from "./working-hours-editor";

type CalendarPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = await searchParams;
  const { workingHours, overrides, businessId } = await getCalendarData();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="space-y-2 lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">التقويم</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">ساعات العمل والاستثناءات</h1>
      </section>

      {/* ساعات العمل — قابلة للتعديل */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">الجدول الأسبوعي</h2>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">يمكنك تحديد فترتين (صباحية ومسائية) لكل يوم</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <CalendarDays className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6">
          {businessId ? (
            <WorkingHoursEditor workingHours={workingHours as Record<string, {
              closed?: boolean; open?: string; close?: string;
              has_evening?: boolean; evening_open?: string; evening_close?: string;
            }> | null} />
          ) : (
            <div className="rounded-xl border border-dashed border-surface-300 dark:border-surface-700 p-6 text-center text-sm text-surface-500">
              سجّل دخولك وأنشئ نشاطاً لتعديل ساعات العمل.
            </div>
          )}
        </div>
      </div>

      {/* العمود الأيمن: الاستثناءات + إضافة استثناء */}
      <div className="space-y-6">
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">الاستثناءات القادمة</h2>
          </div>
          <div className="p-6 space-y-3">
            {overrides.length > 0 ? (
              overrides.map((override) => (
                <div
                  key={override.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white" dir="ltr">{override.date}</p>
                    {override.is_closed ? (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">مغلق</p>
                    ) : (
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5" dir="ltr">
                        {override.open_time} – {override.close_time}
                      </p>
                    )}
                    {override.notes && (
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{override.notes}</p>
                    )}
                  </div>
                  {businessId && (
                    <form action={deleteCalendarOverride}>
                      <input type="hidden" name="id" value={override.id} />
                      <button
                        type="submit"
                        className="p-2 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-surface-500 dark:text-surface-400">
                لا توجد استثناءات مجدولة.
              </p>
            )}
          </div>
        </div>

        <CalendarOverrideForm error={params?.error} />
      </div>
    </div>
  );
}
