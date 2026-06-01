export type TaskContextTag = "general" | "calls" | "shopping" | "mail" | "errands";

export type PersonalTaskLike = {
  id: string;
  title: string;
  context_tag: TaskContextTag;
  base_weight: number;
  energy_required: number;
  days_delayed: number;
  suppression_factor?: number | null;
  time_windows?: { start_time: string; end_time: string }[];
};

export type TaskScoreContext = {
  currentHour: number;
  currentEnergy: number;
  lastCompletedTag?: TaskContextTag | null;
  lastCompletedAt?: Date | null;
};

export type ScoredTask<T extends PersonalTaskLike = PersonalTaskLike> = T & {
  score: number;
  threshold: number;
  breakdown: {
    context: number;
    energy: number;
    debt: number;
    momentum: number;
    suppression: number;
  };
  reason: string;
};

export const TAG_META: Record<TaskContextTag, { label: string; color: string; icon: string }> = {
  general: { label: "عام", color: "#64748b", icon: "Sparkles" },
  calls: { label: "مكالمات", color: "#8b5cf6", icon: "Phone" },
  shopping: { label: "مشتريات", color: "#2e90fa", icon: "ShoppingBag" },
  mail: { label: "بريد", color: "#15b79e", icon: "Mail" },
  errands: { label: "مشاوير", color: "#f59e0b", icon: "MapPin" },
};

export function computeDebt(task: Pick<PersonalTaskLike, "base_weight" | "days_delayed">) {
  return task.base_weight * (Math.pow(1.15, task.days_delayed) - 1);
}

export function computeMomentum(
  tag: TaskContextTag,
  lastTag?: TaskContextTag | null,
  lastAt?: Date | null,
  now = new Date(),
) {
  if (!lastTag || !lastAt || tag !== lastTag) return 0;
  const minutes = (now.getTime() - lastAt.getTime()) / 60_000;
  if (minutes < 0 || minutes > 15) return 0;
  return 1 - minutes / 15;
}

export function isWithinTimeWindow(task: PersonalTaskLike, hour: number) {
  if (!task.time_windows?.length) return true;
  return task.time_windows.some((window) => {
    const start = Number(window.start_time.slice(0, 2));
    const end = Number(window.end_time.slice(0, 2));
    return hour >= start && hour < end;
  });
}

export function computeAdaptiveThreshold(taskCount: number) {
  if (taskCount <= 3) return 0.55;
  return 0.55 * (1 + Math.log(taskCount / 3));
}

export function calculateSurfaceScore<T extends PersonalTaskLike>(
  task: T,
  ctx: TaskScoreContext,
  now = new Date(),
): ScoredTask<T> {
  const context = isWithinTimeWindow(task, ctx.currentHour) ? 1 : 0.35;
  const energy = Math.max(0.2, 1 - Math.abs(ctx.currentEnergy - task.energy_required));
  const debt = computeDebt(task);
  const momentum = computeMomentum(task.context_tag, ctx.lastCompletedTag, ctx.lastCompletedAt, now);
  const suppression = task.suppression_factor ?? 1;
  const score = context * energy * (1 + debt) * (1 + momentum) * suppression;
  const reasonParts = [
    context === 1 ? "ضمن نافذة الوقت" : "خارج نافذته المرنة",
    debt > 0.5 ? `متأخر ${task.days_delayed} أيام` : null,
    momentum > 0 ? "زخم من مهمة مشابهة" : null,
  ].filter(Boolean);

  return {
    ...task,
    score,
    threshold: 0,
    breakdown: { context, energy, debt, momentum, suppression },
    reason: reasonParts.join(" · ") || "جاهزة عند اللحظة المناسبة",
  };
}

export function scoreTasks<T extends PersonalTaskLike>(tasks: T[], ctx: TaskScoreContext) {
  const threshold = computeAdaptiveThreshold(tasks.length);
  const scored = tasks
    .map((task) => ({ ...calculateSurfaceScore(task, ctx), threshold }))
    .sort((a, b) => b.score - a.score);

  return {
    surfacing: scored.filter((task) => task.score >= threshold),
    hidden: scored.filter((task) => task.score < threshold),
  };
}

export function computeSuppressionDelta(outcome: "done" | "snoozed" | "ignored", factor = 1) {
  if (outcome === "done") return Math.min(1.4, factor + 0.08);
  if (outcome === "snoozed") return Math.max(0.35, factor - 0.08);
  return Math.max(0.25, factor - 0.15);
}

export function updateEnergyLevel(current: number, sampleCount: number, completed: boolean) {
  const signal = completed ? 0.75 : 0.25;
  return (current * sampleCount + signal) / (sampleCount + 1);
}

export function extractContextTag(text: string): TaskContextTag {
  if (/اتصل|مكالمة|كلم|هاتف|جوال/.test(text)) return "calls";
  if (/اشتر|شراء|مقاضي|سوبر|طلب/.test(text)) return "shopping";
  if (/بريد|ايميل|إيميل|رسالة/.test(text)) return "mail";
  if (/مشوار|بنك|دوام|استلام|توصيل|زيارة/.test(text)) return "errands";
  return "general";
}
