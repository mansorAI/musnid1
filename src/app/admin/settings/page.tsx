import { createServiceClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveApiKeys } from "./actions";
import { KeyRound, Bot } from "lucide-react";

async function getSettings() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("app_settings")
    .select("key, value, updated_at");
  const map: Record<string, string | null> = {};
  for (const row of data ?? []) map[row.key] = row.value;
  return map;
}

function maskKey(val: string | null) {
  if (!val) return null;
  return val.slice(0, 8) + "••••••••" + val.slice(-4);
}

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">إعدادات API</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          مفاتيح الذكاء الاصطناعي لتفعيل أدوات الدراسة في التطبيق
        </p>
      </div>

      <form action={saveApiKeys} className="space-y-6 max-w-xl">
        {/* Claude */}
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-surface-900 dark:text-white">Claude (Anthropic)</p>
              {settings.claude_api_key ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {maskKey(settings.claude_api_key)}
                </p>
              ) : (
                <p className="text-xs text-surface-400">غير مضبوط</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              مفتاح Claude API
            </label>
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="password"
                name="claude_api_key"
                placeholder="sk-ant-..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                  bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-surface-400 font-mono"
              />
            </div>
            <p className="text-xs text-surface-400">اتركه فارغاً لإبقاء القيمة الحالية. احذف المحتوى واحفظ لإزالة المفتاح.</p>
          </div>
        </div>

        {/* Gemini */}
        <div className="rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-surface-900 dark:text-white">Gemini (Google)</p>
              {settings.gemini_api_key ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {maskKey(settings.gemini_api_key)}
                </p>
              ) : (
                <p className="text-xs text-surface-400">غير مضبوط</p>
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-surface-700 dark:text-surface-300">
              مفتاح Gemini API
            </label>
            <div className="relative">
              <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input
                type="password"
                name="gemini_api_key"
                placeholder="AIza..."
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700
                  bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-surface-400 font-mono"
              />
            </div>
            <p className="text-xs text-surface-400">اتركه فارغاً لإبقاء القيمة الحالية. احذف المحتوى واحفظ لإزالة المفتاح.</p>
          </div>
        </div>

        <SubmitButton
          pendingText="جاري الحفظ..."
          className="px-6 py-2.5 rounded-xl bg-surface-900 dark:bg-white text-white dark:text-surface-900
            text-sm font-bold hover:opacity-90 transition-opacity"
        >
          حفظ المفاتيح
        </SubmitButton>
      </form>

      <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/10 p-5 max-w-xl">
        <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-2">ملاحظة مهمة</p>
        <ul className="text-xs text-amber-700 dark:text-amber-500 space-y-1 list-disc list-inside">
          <li>المفاتيح مشفّرة ولا تُرسل إلى التطبيق أبداً — تبقى على السيرفر فقط.</li>
          <li>أي تغيير يُطبَّق فوراً على جميع الأجهزة بدون تحديث.</li>
          <li>يكفي مفتاح واحد لتفعيل الخصائص — Claude أو Gemini.</li>
        </ul>
      </div>
    </div>
  );
}
