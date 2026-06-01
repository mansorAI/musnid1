import {
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Sparkles,
  TimerReset,
  X,
} from "lucide-react";
import { getTasksData } from "@/lib/dashboard-data";
import { TAG_META, type ScoredTask, type TaskContextTag } from "@/lib/task-engine";
import {
  addPersonalTask,
  completePersonalTask,
  ignorePersonalTask,
  snoozePersonalTask,
} from "./actions";

const iconMap = {
  Sparkles,
  Phone,
  ShoppingBag,
  Mail,
  MapPin,
};

const toAr = (n: number | string) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

function formatSlotTime(hour: number) {
  const normalized = ((hour % 24) + 24) % 24;
  const label = normalized < 12 ? "ص" : "م";
  const display = normalized % 12 || 12;
  return `${toAr(display)} ${label}`;
}

function getPredictedHour(task: ScoredTask, index: number) {
  const start = task.time_windows?.[0]?.start_time;
  if (start) return Number(start.slice(0, 2));
  return Math.min(21, 9 + index * 2);
}

function getEnergyMeta(energy: number) {
  if (energy >= 0.65) return { label: "طاقة عالية", color: "bg-accent-500" };
  if (energy >= 0.4) return { label: "متوسطة", color: "bg-primary-500" };
  if (energy >= 0.2) return { label: "هبوط", color: "bg-amber-500" };
  return { label: "صعود تدريجي", color: "bg-rose-500" };
}

function ContextTagOption({ tag }: { tag: TaskContextTag }) {
  const meta = TAG_META[tag];
  return (
    <label
      className="flex cursor-pointer items-center gap-2 rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700 transition-colors has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50 dark:border-surface-700 dark:bg-surface-800/40 dark:text-surface-200 dark:has-[:checked]:border-primary-700 dark:has-[:checked]:bg-primary-900/20"
      style={{ borderTopColor: meta.color, borderTopWidth: 2 }}
    >
      <input type="radio" name="context_tag" value={tag} className="sr-only" />
      <span className="size-2 rounded-full" style={{ backgroundColor: meta.color }} />
      {meta.label}
    </label>
  );
}

function TaskCard({ task, index }: { task: ScoredTask; index: number }) {
  const meta = TAG_META[task.context_tag];
  const Icon = iconMap[meta.icon as keyof typeof iconMap] ?? Sparkles;
  const hour = getPredictedHour(task, index);
  const inWindow = task.breakdown.context === 1;
  const hasDebt = task.breakdown.debt > 0.5;

  return (
    <div className="grid grid-cols-[42px_1fr_62px] items-stretch gap-3">
      <div className="flex h-[62px] items-start justify-center pt-2 text-xs font-bold text-surface-400">
        {formatSlotTime(hour)}
      </div>

      <article
        className={`flex h-[62px] items-center gap-3 rounded-xl border bg-white/85 px-3 shadow-sm dark:bg-surface-900/70 ${
          inWindow
            ? "border-accent-300 shadow-accent-500/10 dark:border-accent-700"
            : "border-surface-200 dark:border-surface-700/50"
        }`}
      >
        <form action={ignorePersonalTask} className="shrink-0">
          <input type="hidden" name="task_id" value={task.id} />
          <button
            type="submit"
            className="rounded-lg p-1.5 text-surface-400 transition-colors hover:bg-surface-100 hover:text-rose-500 dark:hover:bg-surface-800"
            title="تجاهل"
          >
            <X className="size-4" />
          </button>
        </form>

        <div className="min-w-0 flex-1 text-right">
          <div className="flex items-center justify-end gap-2">
            {hasDebt ? (
              <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                دَيْن
              </span>
            ) : null}
            <h3 className="truncate text-sm font-extrabold text-surface-900 dark:text-white">
              {task.title}
            </h3>
          </div>
          <p className="mt-1 truncate text-xs text-surface-500 dark:text-surface-400">{task.reason}</p>
        </div>

        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${meta.color}1a` }}>
          <Icon className="size-5" style={{ color: meta.color }} />
          <span
            className={`absolute -bottom-0.5 -left-0.5 size-3 rounded-full border-2 border-white dark:border-surface-900 ${
              inWindow ? "bg-accent-500" : hasDebt ? "bg-amber-500" : "bg-surface-400"
            }`}
          />
        </div>
      </article>

      <div className="relative h-[62px] overflow-hidden rounded-xl border border-surface-200 bg-surface-50 dark:border-surface-700 dark:bg-surface-900">
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent-500 to-primary-400" style={{ height: `${Math.max(14, task.breakdown.energy * 100)}%` }} />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white [text-shadow:0_1px_3px_rgba(0,0,0,.35)]">
          {toAr(Math.round(task.score * 100))}
        </div>
      </div>
    </div>
  );
}

export default async function TasksPage() {
  const data = await getTasksData();
  const energy = getEnergyMeta(data.currentEnergy);
  const allContextTasks = [...data.surfacing, ...data.hidden].filter((task) => task.context_tag !== "general");

  return (
    <div className="grid gap-6">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-surface-500 dark:text-surface-400">المهام الذكية</p>
          <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">اللحظة المثالية</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-surface-200 bg-white px-3 py-2 text-xs font-bold text-surface-600 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300">
          <span className={`size-2 rounded-full ${energy.color}`} />
          {energy.label}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-surface-200/50 p-6 dark:border-surface-700/30">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة مهمة</h2>
            <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
              اكتبها كما هي، والمحرك يلتقط سياقها تلقائياً.
            </p>
          </div>
          <form action={addPersonalTask} className="space-y-4 p-6">
            <textarea
              name="title"
              required
              rows={3}
              placeholder="مثال: اتصل على المورد بعد الظهر"
              className="w-full resize-none rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 text-sm text-surface-900 outline-none transition-all placeholder:text-surface-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20 dark:border-surface-700 dark:bg-surface-800/50 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TAG_META) as TaskContextTag[]).map((tag) => (
                <ContextTagOption key={tag} tag={tag} />
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1.5 text-sm text-surface-600 dark:text-surface-300">
                الثقل
                <select name="base_weight" defaultValue="1" className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800">
                  <option value="0.7">خفيفة</option>
                  <option value="1">متوسطة</option>
                  <option value="1.3">ثقيلة</option>
                </select>
              </label>
              <label className="space-y-1.5 text-sm text-surface-600 dark:text-surface-300">
                الطاقة
                <select name="energy_required" defaultValue="0.5" className="w-full rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800">
                  <option value="0.3">منخفضة</option>
                  <option value="0.5">متوسطة</option>
                  <option value="0.75">عالية</option>
                </select>
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input name="start_time" type="time" className="rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800" />
              <input name="end_time" type="time" className="rounded-xl border border-surface-200 bg-surface-50 px-3 py-2 text-sm dark:border-surface-700 dark:bg-surface-800" />
            </div>

            <button type="submit" className="btn-primary w-full">
              إضافة للمحرك
            </button>
          </form>
        </div>

        <div className="grid gap-4">
          {allContextTasks.length ? (
            <div className="rounded-xl border border-primary-200 bg-primary-50/80 p-4 dark:border-primary-800/40 dark:bg-primary-900/10">
              <div className="flex items-center gap-2 text-sm font-bold text-primary-700 dark:text-primary-300">
                <Sparkles className="size-4" />
                المحرك فهم وربط تلقائياً
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(new Set(allContextTasks.map((task) => task.context_tag))).map((tag) => (
                  <span key={tag} className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: TAG_META[tag].color }}>
                    {TAG_META[tag].label}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <div className="glass-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-surface-200/50 p-6 dark:border-surface-700/30">
              <div>
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">الآن</h2>
                <p className="text-sm text-surface-500 dark:text-surface-400">بطاقات مرتبة حسب SurfaceScore</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-accent-100 text-lg font-extrabold text-accent-700 dark:bg-accent-900/30 dark:text-accent-300">
                {toAr(data.surfacing.length)}
              </div>
            </div>

            <div className="space-y-3 p-4">
              {data.surfacing.length ? (
                data.surfacing.map((task, index) => (
                  <div key={task.id} className="space-y-2">
                    <TaskCard task={task} index={index} />
                    <div className="flex justify-end gap-2 pe-[74px]">
                      <form action={snoozePersonalTask}>
                        <input type="hidden" name="task_id" value={task.id} />
                        <button className="inline-flex items-center gap-1 rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-bold text-surface-600 hover:bg-surface-50 dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800">
                          <TimerReset className="size-3.5" />
                          لاحقاً
                        </button>
                      </form>
                      <form action={completePersonalTask}>
                        <input type="hidden" name="task_id" value={task.id} />
                        <button className="inline-flex items-center gap-1 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-700">
                          <CheckCircle2 className="size-3.5" />
                          تم
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-surface-300 p-8 text-center text-sm text-surface-500 dark:border-surface-700">
                  المحرك يراقب الإشارات. أضف مهمة أو انتظر ارتفاع أولويتها.
                </div>
              )}
            </div>
          </div>

          <details className="glass-card overflow-hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-bold text-surface-700 dark:text-surface-200">
              تنتظر لحظتها · {toAr(data.hidden.length)} مهمة
              <Clock3 className="size-4 text-surface-400" />
            </summary>
            <div className="space-y-3 border-t border-surface-200/50 p-4 dark:border-surface-700/30">
              {data.hidden.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index + data.surfacing.length} />
              ))}
            </div>
          </details>

          <div className="flex flex-wrap gap-3 text-xs text-surface-500 dark:text-surface-400">
            <span className="inline-flex items-center gap-2"><span className="h-0.5 w-8 bg-accent-500" />متوقع مؤكد</span>
            <span className="inline-flex items-center gap-2"><span className="h-0.5 w-8 border-t border-dashed border-surface-400" />نافذة مرنة</span>
          </div>
        </div>
      </section>
    </div>
  );
}
