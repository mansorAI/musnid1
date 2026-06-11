import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StoreCategory, ZoneSection } from "@/types/database";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  setSectionDisplayConfig, clearSectionDisplayConfig,
  setCategoryDisplayConfig, clearCategoryDisplayConfig,
  setBusinessDisplayConfig, clearBusinessDisplayConfig,
} from "./actions";

type DisplayKey =
  | "showImage" | "showPrice" | "showDescription" | "showLocation"
  | "showQtyControls" | "bookingButton"
  | "showDateButton" | "showTimeButton"
  | "allowRepeatedDateBookings" | "allowRepeatedTimeBookings"
  | "showGridLayout" | "showListLayout"
  | "showImageGallery";

const DISPLAY_OPTIONS: { key: DisplayKey; label: string; group?: "layout" | "booking" | "gallery" }[] = [
  { key: "showImage",          label: "عرض الصورة" },
  { key: "showPrice",          label: "عرض السعر" },
  { key: "showDescription",    label: "وصف المنتج" },
  { key: "showLocation",       label: "رابط الموقع" },
  { key: "showQtyControls",    label: "أزرار الكمية" },
  { key: "bookingButton",      label: "زر الحجز" },
  { key: "showDateButton",     label: "زر التاريخ 📅",    group: "booking" },
  { key: "showTimeButton",     label: "زر الوقت 🕐",      group: "booking" },
  { key: "allowRepeatedDateBookings", label: "تكرار التاريخ", group: "booking" },
  { key: "allowRepeatedTimeBookings", label: "تكرار الوقت", group: "booking" },
  { key: "showGridLayout",     label: "كارت مربع ⊞",      group: "layout" },
  { key: "showListLayout",     label: "كارت مستطيل ☰",   group: "layout" },
  { key: "showImageGallery",   label: "تصفح الصور 🖼",    group: "gallery" },
];

type DisplayConfig = Record<DisplayKey, boolean>;

async function getData() {
  const supabase = await createClient();
  const admin = createAdminClient();
  const [s, c, b] = await Promise.all([
    supabase.from("zone_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("store_categories").select("*").order("sort_order", { ascending: true }),
    admin.from("businesses").select("id, name, bot_settings").order("name", { ascending: true }),
  ]);
  return {
    sections:   (s.data ?? []) as ZoneSection[],
    categories: (c.data ?? []) as StoreCategory[],
    businesses: (b.data ?? []) as { id: string; name: string; bot_settings: Record<string, unknown> | null }[],
  };
}

function ConfigCheckboxes({
  config,
  inherited,
}: {
  config: DisplayConfig | null;
  inherited?: DisplayConfig | null;
}) {
  const mainOpts    = DISPLAY_OPTIONS.filter((o) => !o.group);
  const bookingOpts = DISPLAY_OPTIONS.filter((o) => o.group === "booking");
  const layoutOpts  = DISPLAY_OPTIONS.filter((o) => o.group === "layout");
  const galleryOpts = DISPLAY_OPTIONS.filter((o) => o.group === "gallery");

  const renderOpt = (opt: (typeof DISPLAY_OPTIONS)[number]) => {
    const checked = config != null ? (config[opt.key] ?? false) : (inherited?.[opt.key] ?? true);
    const fromInherited = config == null && inherited != null;
    return (
      <label
        key={opt.key}
        className="flex flex-col items-center gap-1.5 rounded-xl border p-2.5 cursor-pointer
          bg-surface-50 hover:bg-surface-100 dark:bg-surface-800 dark:border-surface-700
          dark:hover:bg-surface-700 transition-colors text-center select-none"
      >
        <input
          type="checkbox"
          name={opt.key}
          defaultChecked={checked}
          className="w-4 h-4 accent-violet-600"
        />
        <span className="text-xs font-medium text-surface-700 dark:text-surface-300 leading-tight">
          {opt.label}
        </span>
        {fromInherited && (
          <span className="text-[10px] text-surface-400 dark:text-surface-500">من القسم</span>
        )}
      </label>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {mainOpts.map(renderOpt)}
      </div>
      <div className="border-t dark:border-surface-700 pt-3">
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-2 text-right">أزرار الحجز</p>
        <div className="flex gap-2">
          {bookingOpts.map(renderOpt)}
        </div>
      </div>
      <div className="border-t dark:border-surface-700 pt-3">
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-2 text-right">شكل الكارت</p>
        <div className="flex gap-2">
          {layoutOpts.map(renderOpt)}
        </div>
      </div>
      <div className="border-t dark:border-surface-700 pt-3">
        <p className="text-xs text-surface-400 dark:text-surface-500 mb-2 text-right">معرض الصور</p>
        <div className="flex gap-2">
          {galleryOpts.map(renderOpt)}
        </div>
      </div>
    </div>
  );
}

function ConfigBadge({ config }: { config: DisplayConfig | null }) {
  if (!config) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500">
        لا يوجد إعداد
      </span>
    );
  }
  const count = Object.values(config).filter(Boolean).length;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-medium">
      {count} / {DISPLAY_OPTIONS.length} مفعّل
    </span>
  );
}

export default async function DisplayConfigPage() {
  const { sections, categories, businesses } = await getData();

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">إعدادات عرض المنتج</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          حدّد أيّ خيارات عرض المنتج تظهر لأصحاب النشاطات في كل قسم أو نشاط.
          إعداد النشاط يُلغي إعداد القسم. إذا لم يُحدَّد أي إعداد تظهر كل الخيارات.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const sectionCfg = (section.product_display_config ?? null) as DisplayConfig | null;
          const sectionCategories = categories.filter((c) => c.section_key === section.section_key);

          return (
            <details key={section.id} className="group rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800" open>
              {/* ── رأس القسم ── */}
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 select-none list-none">
                <div className="flex items-center gap-3">
                  <span className="text-surface-400 dark:text-surface-500 transition-transform group-open:rotate-90">▶</span>
                  <div>
                    <span className="font-semibold text-surface-900 dark:text-white">{section.name}</span>
                    <code className="mr-2 text-xs rounded bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-surface-500">
                      {section.section_key}
                    </code>
                    <span className="mr-2 text-xs text-surface-400">
                      {sectionCategories.length} نشاط
                    </span>
                  </div>
                </div>
                <ConfigBadge config={sectionCfg} />
              </summary>

              <div className="border-t dark:border-surface-800 px-5 py-5 space-y-6">
                {/* ── إعداد القسم ── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">
                      إعداد القسم (يُطبَّق على جميع أنشطته ما لم يُحدَّد إعداد خاص)
                    </p>
                    {sectionCfg && (
                      <form action={clearSectionDisplayConfig}>
                        <input type="hidden" name="section_key" value={section.section_key} />
                        <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:text-rose-700 hover:underline">
                          حذف الإعداد
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                  <form action={setSectionDisplayConfig} className="space-y-3">
                    <input type="hidden" name="section_key" value={section.section_key} />
                    <ConfigCheckboxes config={sectionCfg} />
                    <SubmitButton
                      pendingText="جاري الحفظ..."
                      className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                    >
                      حفظ إعداد القسم
                    </SubmitButton>
                  </form>
                </div>

                {/* ── أنشطة القسم ── */}
                {sectionCategories.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 border-t dark:border-surface-700 pt-4">
                      الأنشطة
                    </p>
                    {sectionCategories.map((cat) => {
                      const catCfg = (cat.product_display_config ?? null) as DisplayConfig | null;
                      return (
                        <div key={cat.id} className="rounded-xl border dark:border-surface-700 p-4 space-y-3 bg-surface-50 dark:bg-surface-800/50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-surface-800 dark:text-white text-sm">{cat.name}</span>
                              <ConfigBadge config={catCfg} />
                              {!catCfg && (
                                <span className="text-xs text-surface-400 dark:text-surface-500">← يرث إعداد القسم</span>
                              )}
                            </div>
                            {catCfg && (
                              <form action={clearCategoryDisplayConfig}>
                                <input type="hidden" name="category_id" value={cat.id} />
                                <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:text-rose-700 hover:underline">
                                  حذف الإعداد
                                </SubmitButton>
                              </form>
                            )}
                          </div>
                          <form action={setCategoryDisplayConfig} className="space-y-3">
                            <input type="hidden" name="category_id" value={cat.id} />
                            <ConfigCheckboxes config={catCfg} inherited={sectionCfg} />
                            <SubmitButton
                              pendingText="جاري الحفظ..."
                              className="rounded-xl border border-violet-300 dark:border-violet-700 px-4 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors"
                            >
                              حفظ إعداد هذا النشاط
                            </SubmitButton>
                          </form>
                        </div>
                      );
                    })}
                  </div>
                )}

                {sectionCategories.length === 0 && (
                  <p className="text-xs text-surface-400 dark:text-surface-500">لا توجد أنشطة في هذا القسم بعد.</p>
                )}
              </div>
            </details>
          );
        })}
      </div>

      {sections.length === 0 && (
        <div className="rounded-2xl border bg-white p-10 text-center text-surface-400 dark:bg-surface-900 dark:border-surface-800 dark:text-surface-500 text-sm">
          لا توجد أقسام. أضف أقساماً من صفحة زون أولاً.
        </div>
      )}

      {/* ── إعدادات منشأة محددة ── */}
      <div>
        <h2 className="text-lg font-bold text-surface-900 dark:text-white mb-1">إعداد خاص بمنشأة</h2>
        <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
          يُلغي إعداد القسم والنشاط — أعلى أولوية.
        </p>
        <div className="space-y-3">
          {businesses.map((biz) => {
            const bizCfg = ((biz.bot_settings ?? {}) as Record<string, unknown>).product_display_config as DisplayConfig | null ?? null;
            return (
              <details key={biz.id} className="group rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800">
                <summary className="flex cursor-pointer items-center justify-between px-5 py-4 select-none list-none">
                  <div className="flex items-center gap-3">
                    <span className="text-surface-400 transition-transform group-open:rotate-90">▶</span>
                    <span className="font-semibold text-surface-900 dark:text-white">{biz.name}</span>
                  </div>
                  <ConfigBadge config={bizCfg} />
                </summary>
                <div className="border-t dark:border-surface-800 px-5 py-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-surface-700 dark:text-surface-300">إعداد المنشأة</p>
                    {bizCfg && (
                      <form action={clearBusinessDisplayConfig}>
                        <input type="hidden" name="business_id" value={biz.id} />
                        <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:text-rose-700 hover:underline">
                          حذف الإعداد
                        </SubmitButton>
                      </form>
                    )}
                  </div>
                  <form action={setBusinessDisplayConfig} className="space-y-3">
                    <input type="hidden" name="business_id" value={biz.id} />
                    <ConfigCheckboxes config={bizCfg} />
                    <SubmitButton
                      pendingText="جاري الحفظ..."
                      className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
                    >
                      حفظ إعداد المنشأة
                    </SubmitButton>
                  </form>
                </div>
              </details>
            );
          })}
        </div>
      </div>
    </div>
  );
}
