import { Bot } from "lucide-react";
import { createAutomation } from "@/app/dashboard/actions";
import { getAutomations } from "@/lib/dashboard-data";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

export default async function AutomationsPage() {
  const automations = await getAutomations();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-2 lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">الأتمتة</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">قواعد الرد والتصعيد</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">القواعد الحالية</h2>
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Bot className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {automations.map((automation) => (
            <article key={automation.id} className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-surface-900 dark:text-white">{automation.name}</h3>
                <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${automation.enabled ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400" : "bg-surface-100 dark:bg-surface-800 text-surface-500"}`}>
                  {automation.enabled ? "مفعلة" : "متوقفة"}
                </span>
              </div>
              <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{automation.trigger}</p>
              <p className="mt-3 text-sm leading-7 text-surface-700 dark:text-surface-300">{automation.response}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة قاعدة</h2>
        </div>
        <div className="p-6">
          <form action={createAutomation} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-sm font-medium text-surface-700 dark:text-surface-300">اسم القاعدة</label>
              <input id="name" name="name" placeholder="مثال: تأكيد الحجز" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="trigger" className="block text-sm font-medium text-surface-700 dark:text-surface-300">المحفز</label>
              <input id="trigger" name="trigger" placeholder="مثال: عند اختيار موعد" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="response" className="block text-sm font-medium text-surface-700 dark:text-surface-300">الرد</label>
              <textarea id="response" name="response" rows={4} className={`${inputClass} resize-none`} placeholder="اكتب نص الرد أو تعليمات المساعد." />
            </div>
            <button type="submit" className="btn-primary w-full">حفظ القاعدة</button>
          </form>
        </div>
      </div>
    </div>
  );
}
