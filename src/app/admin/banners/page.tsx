import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AdBanner, ZoneSection } from "@/types/database";
import { createBanner, updateBanner, toggleBanner, deleteBanner } from "./actions";

const COLOR_PRESETS = [
  { label: "بنفسجي", value: "#7a5af8" },
  { label: "أزرق", value: "#2e90fa" },
  { label: "أخضر", value: "#15b79e" },
  { label: "برتقالي", value: "#ef6820" },
  { label: "وردي", value: "#d444f1" },
  { label: "أحمر", value: "#f04438" },
];

async function getBannersData() {
  const supabase = await createClient();
  const [bannersResult, sectionsResult] = await Promise.all([
    supabase.from("ad_banners").select("*").order("section_key").order("sort_order"),
    supabase.from("zone_sections").select("*").order("sort_order"),
  ]);
  return {
    banners: (bannersResult.data ?? []) as AdBanner[],
    sections: (sectionsResult.data ?? []) as ZoneSection[],
  };
}

export default async function BannersPage() {
  const { banners, sections } = await getBannersData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">البنرات الإعلانية</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          بنرات متحركة تظهر أعلى أنشطة زون لكل قسم
        </p>
      </div>

      {/* Add banner form */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-surface-900 dark:border-surface-800">
        <h2 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">إضافة بنر جديد</h2>
        <form action={createBanner} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400">العنوان *</label>
              <input
                name="title"
                required
                placeholder="مثال: عروض نهاية الأسبوع"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400">العنوان الفرعي</label>
              <input
                name="subtitle"
                placeholder="مثال: خصومات حتى ٥٠٪"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400">رابط الصورة</label>
              <input
                name="image_url"
                placeholder="https://..."
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400">لون الخلفية</label>
              <div className="flex items-center gap-2">
                <input
                  name="bg_color"
                  defaultValue="#7a5af8"
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-28"
                />
                <div className="flex gap-1.5">
                  {COLOR_PRESETS.map((c) => (
                    <div
                      key={c.value}
                      title={c.label}
                      style={{ backgroundColor: c.value }}
                      className="w-6 h-6 rounded-full cursor-pointer border-2 border-white shadow-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400">القسم</label>
              <select
                name="section_key"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              >
                {sections.map((s) => (
                  <option key={s.section_key} value={s.section_key}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-surface-500 dark:text-surface-400">الترتيب</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={banners.length}
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              />
            </div>
          </div>
          <SubmitButton
            pendingText="جاري الإضافة..."
            className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
          >
            إضافة بنر
          </SubmitButton>
        </form>
      </div>

      {/* Banners list */}
      <div className="space-y-3">
        {sections.map((section) => {
          const sectionBanners = banners.filter((b) => b.section_key === section.section_key);
          return (
            <div key={section.section_key} className="space-y-2">
              <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                {section.name} ({sectionBanners.length})
              </h3>
              {sectionBanners.length === 0 ? (
                <p className="text-xs text-surface-400 dark:text-surface-600 pr-4">لا توجد بنرات لهذا القسم</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {sectionBanners.map((banner) => (
                    <div
                      key={banner.id}
                      className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:bg-surface-900 dark:border-surface-800"
                    >
                      {/* Preview */}
                      <div
                        className="h-20 flex flex-col justify-end p-3 relative"
                        style={{ backgroundColor: banner.bg_color }}
                      >
                        <p className="text-white font-bold text-sm leading-tight">{banner.title}</p>
                        {banner.subtitle && (
                          <p className="text-white/70 text-xs mt-0.5">{banner.subtitle}</p>
                        )}
                        {!banner.is_active && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">معطّل</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <form action={toggleBanner}>
                          <input type="hidden" name="id" value={banner.id} />
                          <input type="hidden" name="is_active" value={String(banner.is_active)} />
                          <SubmitButton
                            pendingText="..."
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              banner.is_active
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-surface-100 text-surface-500 dark:bg-surface-800"
                            }`}
                          >
                            {banner.is_active ? "إخفاء" : "إظهار"}
                          </SubmitButton>
                        </form>
                        <form action={deleteBanner}>
                          <input type="hidden" name="id" value={banner.id} />
                          <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:text-rose-700 hover:underline">
                            حذف
                          </SubmitButton>
                        </form>
                      </div>

                      {/* Edit form */}
                      <details className="px-3 pb-3">
                        <summary className="text-xs text-violet-600 cursor-pointer hover:underline select-none">تعديل</summary>
                        <form action={updateBanner} className="mt-2 space-y-2">
                          <input type="hidden" name="id" value={banner.id} />
                          <input
                            name="title"
                            defaultValue={banner.title}
                            className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                            placeholder="العنوان"
                          />
                          <input
                            name="subtitle"
                            defaultValue={banner.subtitle ?? ""}
                            className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                            placeholder="العنوان الفرعي"
                          />
                          <div className="flex gap-2">
                            <input
                              name="bg_color"
                              defaultValue={banner.bg_color}
                              className="flex-1 rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                              placeholder="#7a5af8"
                            />
                            <input
                              name="sort_order"
                              type="number"
                              defaultValue={banner.sort_order}
                              className="w-16 rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                            />
                          </div>
                          <input
                            name="image_url"
                            defaultValue={banner.image_url ?? ""}
                            className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                            placeholder="رابط الصورة (اختياري)"
                          />
                          <input type="hidden" name="section_key" value={banner.section_key} />
                          <SubmitButton
                            pendingText="..."
                            className="w-full rounded-lg bg-violet-600 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors"
                          >
                            حفظ التعديلات
                          </SubmitButton>
                        </form>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {banners.length === 0 && (
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm dark:bg-surface-900 dark:border-surface-800">
            <p className="text-surface-500 dark:text-surface-400">لا توجد بنرات بعد — أضف أول بنر من النموذج أعلاه</p>
          </div>
        )}
      </div>
    </div>
  );
}
