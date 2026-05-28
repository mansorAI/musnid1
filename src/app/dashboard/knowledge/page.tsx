import { BookOpenText } from "lucide-react";
import { createKnowledgeArticle } from "@/app/dashboard/actions";
import { getKnowledgeArticles } from "@/lib/dashboard-data";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

export default async function KnowledgePage() {
  const articles = await getKnowledgeArticles();

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <section className="space-y-2 lg:col-span-2">
        <p className="text-sm text-surface-500 dark:text-surface-400">قاعدة المعرفة</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">المعلومات التي يعتمد عليها المساعد</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">المقالات</h2>
          <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center text-accent-600 dark:text-accent-400">
            <BookOpenText className="w-5 h-5" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {articles.map((article) => (
            <article key={article.id} className="rounded-xl border border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold text-surface-900 dark:text-white">{article.title}</h3>
                <span className={`rounded-lg px-2 py-0.5 text-xs font-medium ${article.enabled ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400" : "bg-surface-100 dark:bg-surface-800 text-surface-500"}`}>
                  {article.enabled ? "مفعلة" : "متوقفة"}
                </span>
              </div>
              <p className="mt-3 text-sm leading-7 text-surface-500 dark:text-surface-400">{article.content}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة معرفة</h2>
        </div>
        <div className="p-6">
          <form action={createKnowledgeArticle} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="title" className="block text-sm font-medium text-surface-700 dark:text-surface-300">العنوان</label>
              <input id="title" name="title" placeholder="مثال: ساعات العمل" className={inputClass} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="content" className="block text-sm font-medium text-surface-700 dark:text-surface-300">المحتوى</label>
              <textarea
                id="content"
                name="content"
                rows={5}
                className={`${inputClass} resize-none`}
                placeholder="اكتب إجابة واضحة ليستخدمها المساعد في الردود."
              />
            </div>
            <button type="submit" className="btn-primary w-full">حفظ</button>
          </form>
        </div>
      </div>
    </div>
  );
}
