import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveAppTheme } from "./actions";

async function getTheme() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("platform_settings")
    .select("*")
    .eq("id", "default")
    .single();
  return data ?? { bg_color_start: "#ffffff", bg_color_end: "#ffffff", card_color: "#ffffff" };
}

export default async function AppThemePage() {
  const theme = await getTheme();

  const isGradient = theme.bg_color_start !== theme.bg_color_end;
  const bgPreview = isGradient
    ? `linear-gradient(135deg, ${theme.bg_color_start}, ${theme.bg_color_end})`
    : theme.bg_color_start;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">مظهر التطبيق</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          تحكّم في خلفية التطبيق ولون الكروت — يُطبَّق فوراً على جميع شاشات تطبيق الجوال.
        </p>
      </div>

      {/* Live Preview */}
      <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-surface-900 dark:border-surface-800">
        <p className="mb-4 text-sm font-medium text-surface-700 dark:text-surface-300">معاينة مباشرة</p>
        <div
          className="rounded-2xl p-5 flex flex-col gap-3"
          style={{ background: bgPreview, minHeight: 180 }}
        >
          {/* Fake header */}
          <div className="flex justify-between items-center">
            <div className="w-8 h-8 rounded-xl bg-white/20 border border-white/30" />
            <div className="text-right">
              <div className="text-white font-black text-base">مساء الخير</div>
              <div className="text-white/70 text-xs">اسم المستخدم</div>
            </div>
          </div>
          {/* Fake card */}
          <div
            className="rounded-2xl p-4 shadow-lg"
            style={{ backgroundColor: theme.card_color }}
          >
            <div className="text-sm font-bold text-right" style={{ color: "#0d0d14" }}>
              كرت نموذجي — هذا هو شكل الكروت
            </div>
            <div className="text-xs mt-1 text-right" style={{ color: "#8080a0" }}>
              مطعم · الرياض · وصف المتجر
            </div>
          </div>
          {/* Fake chips */}
          <div className="flex gap-2 justify-end">
            {["مطاعم", "كوفيهات", "صالونات"].map((label) => (
              <div key={label} className="bg-white rounded-full px-3 py-1 text-xs font-bold shadow" style={{ color: theme.bg_color_start || "#1a5c3a" }}>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <form action={saveAppTheme} className="space-y-6">
        {/* Background Section */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-4">خلفية التطبيق</h2>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">لون البداية</p>
                <p className="text-xs text-surface-400 mt-0.5">اللون العلوي للخلفية</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="bg_color_start_text"
                  defaultValue={theme.bg_color_start}
                  className="w-24 rounded-xl border px-3 py-2 text-sm font-mono bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                  readOnly
                />
                <input
                  type="color"
                  name="bg_color_start"
                  defaultValue={theme.bg_color_start}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-surface-200 dark:border-surface-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">لون النهاية</p>
                <p className="text-xs text-surface-400 mt-0.5">اللون السفلي للخلفية (نفس البداية = لون صلب)</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  name="bg_color_end_text"
                  defaultValue={theme.bg_color_end}
                  className="w-24 rounded-xl border px-3 py-2 text-sm font-mono bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                  readOnly
                />
                <input
                  type="color"
                  name="bg_color_end"
                  defaultValue={theme.bg_color_end}
                  className="w-12 h-10 rounded-xl cursor-pointer border border-surface-200 dark:border-surface-700"
                />
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-3 text-xs text-surface-500 dark:text-surface-400 text-right">
              💡 اختر نفس اللون للبداية والنهاية للحصول على خلفية صلبة. اختر لونين مختلفين للحصول على تدرج.
            </div>
          </div>
        </div>

        {/* Card Color Section */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-4">لون الكروت</h2>

          <div className="flex items-center gap-3">
            <div className="flex-1 text-right">
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">لون خلفية الكرت</p>
              <p className="text-xs text-surface-400 mt-0.5">يؤثر على جميع الكروت في التطبيق</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                name="card_color_text"
                defaultValue={theme.card_color}
                className="w-24 rounded-xl border px-3 py-2 text-sm font-mono bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                readOnly
              />
              <input
                type="color"
                name="card_color"
                defaultValue={theme.card_color}
                className="w-12 h-10 rounded-xl cursor-pointer border border-surface-200 dark:border-surface-700"
              />
            </div>
          </div>

          <div className="mt-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl p-3 text-xs text-surface-500 dark:text-surface-400 text-right">
            💡 الأبيض (#ffffff) هو الافتراضي ويناسب جميع ألوان الخلفية.
          </div>
        </div>

        {/* Quick Presets */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-4">إعدادات سريعة</h2>
          <p className="text-xs text-surface-400 dark:text-surface-500 mb-4 text-right">
            انسخ القيم وضعها يدوياً في الحقول أعلاه:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "أبيض (افتراضي)", start: "#ffffff", end: "#ffffff", card: "#ffffff" },
              { label: "أخضر مسنِد", start: "#1a5c3a", end: "#2d9e6b", card: "#ffffff" },
              { label: "رمادي فاتح", start: "#f0f0f5", end: "#e8e8f0", card: "#ffffff" },
              { label: "كحلي راقي", start: "#0a1628", end: "#1a2f52", card: "#ffffff" },
              { label: "بنفسجي", start: "#3b1fa8", end: "#5b35d4", card: "#ffffff" },
              { label: "ذهبي فاخر", start: "#7a5a1a", end: "#c49a2e", card: "#fffbf0" },
            ].map((preset) => (
              <div
                key={preset.label}
                className="rounded-xl p-3 border border-surface-200 dark:border-surface-700"
                style={{ background: preset.start === preset.end ? preset.start : `linear-gradient(135deg, ${preset.start}, ${preset.end})` }}
              >
                <div
                  className="rounded-lg p-2 text-xs font-bold text-right shadow-sm mb-1.5"
                  style={{ backgroundColor: preset.card, color: "#0d0d14" }}
                >
                  {preset.label}
                </div>
                <div className="flex gap-1 justify-end flex-wrap">
                  <code className="text-xs bg-black/20 text-white rounded px-1">{preset.start}</code>
                  {preset.start !== preset.end && (
                    <code className="text-xs bg-black/20 text-white rounded px-1">{preset.end}</code>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <SubmitButton
          pendingText="جاري الحفظ..."
          className="w-full rounded-2xl bg-violet-600 py-3.5 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
        >
          حفظ وتطبيق على التطبيق
        </SubmitButton>
      </form>
    </div>
  );
}
