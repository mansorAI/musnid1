import { Bot, CheckCircle2, Clock3, MessageSquareText, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";
import { dashboardStats } from "@/lib/demo-data";
import { hasSupabaseEnv } from "@/lib/env";
import { getAutomations, getConversations, getCurrentOrganization } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const organization = await getCurrentOrganization();
  if (hasSupabaseEnv() && !organization) {
    redirect("/dashboard/settings?missing_org=1");
  }

  const automations = await getAutomations();
  const conversations = await getConversations();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-surface-500 dark:text-surface-400">لوحة تحكم مسند</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">نظرة تشغيلية مباشرة</h1>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.label} className="glass-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{stat.label}</p>
            <div className="flex items-end justify-between mt-3">
              <span className="text-3xl font-extrabold text-surface-900 dark:text-white">{stat.value}</span>
              <span className="rounded-lg bg-accent-100 dark:bg-accent-900/30 px-2 py-1 text-sm font-medium text-accent-600 dark:text-accent-400">
                {stat.delta}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">آخر المحادثات</h2>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">نماذج بيانات مؤقتة حتى ربط جداول Supabase.</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <MessageSquareText className="w-5 h-5" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {conversations.length ? (
              conversations.map((conversation) => (
                <article
                  key={"id" in conversation ? conversation.id : conversation.phone}
                  className="grid gap-3 rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-surface-900 dark:text-white">{conversation.name}</h3>
                      <span className="rounded-lg bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 text-xs text-primary-700 dark:text-primary-300">
                        {conversation.status}
                      </span>
                    </div>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{conversation.phone}</p>
                    <p className="text-sm leading-6 text-surface-700 dark:text-surface-300">{conversation.summary}</p>
                  </div>
                  <span className="text-sm text-surface-400">{conversation.time}</span>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-surface-300 dark:border-surface-700 p-6 text-center text-sm text-surface-500">
                لا توجد محادثات بعد. ستظهر هنا بعد ربط WhatsApp واستقبال أول رسالة.
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">حالة المساعد</h2>
              <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl gradient-bg px-4 py-5 text-white">
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <Sparkles className="w-4 h-4" />
                  جاهز لاستقبال المحادثات
                </div>
                <p className="mt-3 text-3xl font-extrabold">87%</p>
                <p className="mt-1 text-sm opacity-80">من الردود عولجت آليًا اليوم.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 p-3 bg-surface-50/50 dark:bg-surface-800/30">
                  <Clock3 className="mb-2 w-4 h-4 text-amber-500" />
                  <p className="font-medium text-surface-700 dark:text-surface-300">6 محادثات بانتظار مراجعة</p>
                </div>
                <div className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 p-3 bg-surface-50/50 dark:bg-surface-800/30">
                  <CheckCircle2 className="mb-2 w-4 h-4 text-accent-500" />
                  <p className="font-medium text-surface-700 dark:text-surface-300">42 ردًا مؤكدًا</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">الأتمتة</h2>
            </div>
            <div className="p-6 space-y-3">
              {automations.map((rule) => (
                <div key={rule.name} className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-surface-900 dark:text-white">{rule.name}</p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">{rule.trigger}</p>
                  </div>
                  <span className={rule.enabled
                    ? "rounded-lg bg-accent-100 dark:bg-accent-900/30 px-2 py-1 text-xs font-medium text-accent-600 dark:text-accent-400"
                    : "rounded-lg bg-surface-100 dark:bg-surface-800 px-2 py-1 text-xs font-medium text-surface-500"
                  }>
                    {rule.enabled ? "مفعلة" : "متوقفة"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
