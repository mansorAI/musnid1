import { BookOpenText, Trash2 } from "lucide-react";
import { getCurrentBusiness } from "@/lib/dashboard-data";
import { SubmitButton } from "@/components/ui/submit-button";
import { addKnowledgeArticle, toggleKnowledgeArticle, deleteKnowledgeArticle } from "./actions";
import type { KnowledgeArticle } from "./actions";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

type KnowledgePageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const params = await searchParams;
  const business = await getCurrentBusiness();

  const botSettings = (business?.bot_settings as Record<string, unknown>) ?? {};
  const articles: KnowledgeArticle[] = Array.isArray(botSettings.knowledge)
    ? (botSettings.knowledge as KnowledgeArticle[])
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-2 lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">قاعدة المعرفة</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">المعلومات التي يعتمد عليها المساعد</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">المقالات</h2>
            <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
              {articles.length > 0 ? `${articles.filter((a) => a.enabled).length} مفعّلة من ${articles.length}` : "لا توجد مقالات بعد"}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
            <BookOpenText className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {articles.length > 0 ? (
            articles.map((article) => (
              <article key={article.id} className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold text-surface-900 dark:text-white">{article.title}</h3>
                  <div className="flex items-center gap-2 shrink-0">
                    <form action={toggleKnowledgeArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <button
                        type="submit"
                        className={`rounded-lg px-2 py-0.5 text-xs font-medium transition-colors ${
                          article.enabled
                            ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400 hover:bg-accent-200"
                            : "bg-surface-100 dark:bg-surface-800 text-surface-500 hover:bg-surface-200"
                        }`}
                      >
                        {article.enabled ? "مفعّلة" : "متوقفة"}
                      </button>
                    </form>
                    <form action={deleteKnowledgeArticle}>
                      <input type="hidden" name="id" value={article.id} />
                      <button
                        type="submit"
                        className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
                <p className="mt-2 text-sm leading-7 text-surface-500 dark:text-surface-400">{article.content}</p>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-surface-300 dark:border-surface-700 p-6 text-center text-sm text-surface-500 dark:text-surface-400">
              أضف معلومات عن نشاطك ليستخدمها المساعد عند الرد على العملاء.
            </div>
          )}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة معرفة</h2>
        </div>
        <div className="p-6">
          {params?.error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              أدخل العنوان والمحتوى.
            </div>
          )}
          {business ? (
            <form action={addKnowledgeArticle} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">العنوان *</label>
                <input name="title" className={inputClass} placeholder="مثال: سياسة الإلغاء" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">المحتوى *</label>
                <textarea
                  name="content"
                  rows={5}
                  className={`${inputClass} resize-none`}
                  placeholder="مثال: يمكن إلغاء الموعد قبل 6 ساعات من وقت الحجز بدون رسوم. الإلغاء بعد ذلك يستلزم رسوم 50%."
                />
              </div>
              <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full">
                إضافة للمعرفة
              </SubmitButton>
            </form>
          ) : (
            <div className="rounded-xl border border-primary-200/50 dark:border-primary-800/30 bg-primary-50/50 dark:bg-primary-900/10 p-4 text-sm text-primary-700 dark:text-primary-300 leading-7">
              سجّل دخولك وأنشئ نشاطاً لإدارة قاعدة المعرفة.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
