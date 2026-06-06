import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import type { StoreCategory, ZoneSection } from "@/types/database";
import {
  createSection, updateSection, toggleSection, deleteSection,
  createCategory, updateCategory, toggleCategory, deleteCategory, moveCategorySection,
} from "./actions";

async function getZoneData() {
  const supabase = await createClient();
  const [sectionsResult, categoriesResult] = await Promise.all([
    supabase.from("zone_sections").select("*").order("sort_order", { ascending: true }),
    supabase.from("store_categories").select("*").order("sort_order", { ascending: true }),
  ]);
  return {
    sections: (sectionsResult.data ?? []) as ZoneSection[],
    categories: (categoriesResult.data ?? []) as StoreCategory[],
  };
}

export default async function ZonePage() {
  const { sections, categories } = await getZoneData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">إدارة زون</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          أقسام زون والأنشطة المعروضة للعملاء
        </p>
      </div>

      {/* ── Sections ─────────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">الأقسام</h2>

        {/* Add section form */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <p className="mb-3 text-sm font-medium text-surface-700 dark:text-surface-300">إضافة قسم جديد</p>
          <form action={createSection} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">الاسم</label>
              <input
                name="name"
                required
                placeholder="مثال: شباب"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">المفتاح (بالإنجليزية)</label>
              <input
                name="section_key"
                required
                placeholder="youth"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-28"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">الترتيب</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={sections.length}
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-20"
              />
            </div>
            <SubmitButton
              pendingText="جاري الإضافة..."
              className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              إضافة قسم
            </SubmitButton>
          </form>
        </div>

        {/* Sections table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">المفتاح</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الترتيب</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الحالة</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {sections.map((section) => (
                <tr key={section.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <form action={updateSection} className="flex items-center gap-2 flex-wrap">
                      <input type="hidden" name="id" value={section.id} />
                      <input
                        name="name"
                        defaultValue={section.name}
                        className="font-medium text-surface-900 dark:text-white bg-transparent border-b border-transparent hover:border-surface-300 dark:hover:border-surface-600 focus:border-violet-500 outline-none w-28"
                      />
                      <input type="hidden" name="sort_order" value={section.sort_order} />
                      <div className="flex items-center gap-1" title="لون البداية للخلفية">
                        <input
                          type="color"
                          name="bg_color_start"
                          defaultValue={section.bg_color_start ?? "#1a5c3a"}
                          className="w-7 h-7 rounded cursor-pointer border border-surface-200 dark:border-surface-700"
                        />
                        <input
                          type="color"
                          name="bg_color_end"
                          defaultValue={section.bg_color_end ?? "#2d9e6b"}
                          className="w-7 h-7 rounded cursor-pointer border border-surface-200 dark:border-surface-700"
                        />
                      </div>
                      <SubmitButton pendingText="..." className="text-xs text-violet-600 hover:underline">حفظ</SubmitButton>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs rounded bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-surface-600 dark:text-surface-400">
                      {section.section_key}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-surface-500 dark:text-surface-400">{section.sort_order}</td>
                  <td className="px-4 py-3">
                    <form action={toggleSection}>
                      <input type="hidden" name="id" value={section.id} />
                      <input type="hidden" name="is_active" value={String(section.is_active)} />
                      <SubmitButton
                        pendingText="..."
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          section.is_active
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-surface-100 text-surface-500 dark:bg-surface-800"
                        }`}
                      >
                        {section.is_active ? "نشط" : "معطّل"}
                      </SubmitButton>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteSection}>
                      <input type="hidden" name="id" value={section.id} />
                      <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:text-rose-700 hover:underline">
                        حذف
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sections.length === 0 && (
            <div className="py-10 text-center text-surface-500 dark:text-surface-400 text-sm">لا توجد أقسام بعد</div>
          )}
        </div>
      </div>

      {/* ── Store Categories ──────────────────────────────────────────────────── */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-surface-900 dark:text-white">الأنشطة</h2>

        {/* Add category form */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <p className="mb-3 text-sm font-medium text-surface-700 dark:text-surface-300">إضافة نشاط جديد</p>
          <form action={createCategory} className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">الاسم</label>
              <input
                name="name"
                required
                placeholder="مثال: صيدليات"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-36"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">الأيقونة (Ionicons)</label>
              <input
                name="icon"
                placeholder="flask-outline"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-40"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">القسم</label>
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
              <label className="text-xs text-surface-500 dark:text-surface-400">نوع التفاعل</label>
              <select
                name="action_type"
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
              >
                <option value="order">طلب</option>
                <option value="booking">حجز</option>
                <option value="inquiry">استفسار</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-surface-500 dark:text-surface-400">الترتيب</label>
              <input
                name="sort_order"
                type="number"
                defaultValue={categories.length}
                className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-20"
              />
            </div>
            <SubmitButton
              pendingText="جاري الإضافة..."
              className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
            >
              إضافة نشاط
            </SubmitButton>
          </form>
        </div>

        {/* Categories table */}
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الأيقونة</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">القسم</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">النوع</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الحالة</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <form action={updateCategory} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={cat.id} />
                      <input
                        name="name"
                        defaultValue={cat.name}
                        className="font-medium text-surface-900 dark:text-white bg-transparent border-b border-transparent hover:border-surface-300 dark:hover:border-surface-600 focus:border-violet-500 outline-none w-28"
                      />
                      <input type="hidden" name="icon" value={cat.icon} />
                      <input type="hidden" name="section_key" value={cat.section_key} />
                      <input type="hidden" name="action_type" value={cat.action_type} />
                      <input type="hidden" name="sort_order" value={cat.sort_order} />
                      <SubmitButton pendingText="..." className="text-xs text-violet-600 hover:underline">حفظ</SubmitButton>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs rounded bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-surface-600 dark:text-surface-400">
                      {cat.icon}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {sections.map((s) => (
                        <form key={s.section_key} action={moveCategorySection}>
                          <input type="hidden" name="id" value={cat.id} />
                          <input type="hidden" name="section_key" value={s.section_key} />
                          <SubmitButton
                            pendingText="..."
                            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                              cat.section_key === s.section_key
                                ? "bg-violet-600 text-white border-violet-600"
                                : "text-surface-500 border-surface-300 hover:border-violet-400 hover:text-violet-600 dark:border-surface-600 dark:text-surface-400 dark:hover:text-violet-400"
                            }`}
                          >
                            {s.name}
                          </SubmitButton>
                        </form>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-surface-500 dark:text-surface-400">
                      {cat.action_type === "order" ? "طلب" : cat.action_type === "booking" ? "حجز" : "استفسار"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <input type="hidden" name="is_active" value={String(cat.is_active)} />
                      <SubmitButton
                        pendingText="..."
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                          cat.is_active
                            ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-surface-100 text-surface-500 dark:bg-surface-800"
                        }`}
                      >
                        {cat.is_active ? "نشط" : "معطّل"}
                      </SubmitButton>
                    </form>
                  </td>
                  <td className="px-4 py-3">
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:text-rose-700 hover:underline">
                        حذف
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 && (
            <div className="py-10 text-center text-surface-500 dark:text-surface-400 text-sm">لا توجد أنشطة بعد</div>
          )}
        </div>
      </div>
    </div>
  );
}
