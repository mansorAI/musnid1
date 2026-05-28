"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateWorkingHours } from "./actions";

const inputClass =
  "px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm w-full";

const days = [
  { key: "saturday",  label: "السبت" },
  { key: "sunday",    label: "الأحد" },
  { key: "monday",    label: "الإثنين" },
  { key: "tuesday",   label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday",  label: "الخميس" },
  { key: "friday",    label: "الجمعة" },
] as const;

type DayKey = typeof days[number]["key"];

type DayHours = {
  closed: boolean;
  open: string;
  close: string;
  has_evening: boolean;
  evening_open: string;
  evening_close: string;
};

type WorkingHoursRaw = Record<string, {
  closed?: boolean;
  open?: string;
  close?: string;
  has_evening?: boolean;
  evening_open?: string;
  evening_close?: string;
}>;

export function WorkingHoursEditor({ workingHours }: { workingHours: WorkingHoursRaw | null }) {
  const [state, setState] = useState<Record<DayKey, DayHours>>(() => {
    const result = {} as Record<DayKey, DayHours>;
    for (const day of days) {
      const raw = workingHours?.[day.key];
      result[day.key] = {
        closed: raw?.closed ?? false,
        open: raw?.open ?? "09:00",
        close: raw?.close ?? "22:00",
        has_evening: raw?.has_evening ?? false,
        evening_open: raw?.evening_open ?? "17:00",
        evening_close: raw?.evening_close ?? "22:00",
      };
    }
    return result;
  });

  function update(day: DayKey, field: keyof DayHours, value: boolean | string) {
    setState((prev) => ({ ...prev, [day]: { ...prev[day], [field]: value } }));
  }

  function addEvening(day: DayKey) {
    setState((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        has_evening: true,
        close: prev[day].close === "22:00" ? "14:00" : prev[day].close,
        evening_open: "17:00",
        evening_close: "22:00",
      },
    }));
  }

  function removeEvening(day: DayKey) {
    setState((prev) => ({
      ...prev,
      [day]: { ...prev[day], has_evening: false, close: "22:00" },
    }));
  }

  return (
    <form action={updateWorkingHours} className="space-y-2">
      {days.map(({ key }) => (
        <input key={key} type="hidden" name={`${key}_has_evening`} value={state[key].has_evening ? "on" : "off"} />
      ))}

      {days.map(({ key, label }) => {
        const day = state[key];
        return (
          <div key={key} className="rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-surface-50/70 dark:bg-surface-800/30 p-3 space-y-2">

            {/* رأس اليوم */}
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-surface-900 dark:text-white w-20 shrink-0">{label}</span>
              <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer select-none">
                <input
                  name={`${key}_closed`}
                  type="checkbox"
                  checked={day.closed}
                  onChange={(e) => update(key, "closed", e.target.checked)}
                  className="h-4 w-4 rounded border-surface-300 text-primary-600"
                />
                مغلق
              </label>
            </div>

            {!day.closed && (
              <>
                {day.has_evening ? (
                  /* فترتان */
                  <div className="space-y-2">
                    {/* فترة صباحية */}
                    <div className="grid grid-cols-[52px_1fr_12px_1fr] items-center gap-2">
                      <span className="text-xs font-medium text-primary-600 dark:text-primary-400">صباحي</span>
                      <input name={`${key}_open`} type="time" value={day.open} onChange={(e) => update(key, "open", e.target.value)} className={inputClass} />
                      <span className="text-xs text-center text-surface-400">—</span>
                      <input name={`${key}_close`} type="time" value={day.close} onChange={(e) => update(key, "close", e.target.value)} className={inputClass} />
                    </div>
                    {/* فترة مسائية */}
                    <div className="grid grid-cols-[52px_1fr_12px_1fr_32px] items-center gap-2">
                      <span className="text-xs font-medium text-accent-600 dark:text-accent-400">مسائي</span>
                      <input name={`${key}_evening_open`} type="time" value={day.evening_open} onChange={(e) => update(key, "evening_open", e.target.value)} className={inputClass} />
                      <span className="text-xs text-center text-surface-400">—</span>
                      <input name={`${key}_evening_close`} type="time" value={day.evening_close} onChange={(e) => update(key, "evening_close", e.target.value)} className={inputClass} />
                      <button
                        type="button"
                        onClick={() => removeEvening(key)}
                        title="حذف الفترة المسائية"
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* فترة واحدة */
                  <div className="grid grid-cols-[1fr_12px_1fr_auto] items-center gap-2">
                    <input name={`${key}_open`} type="time" value={day.open} onChange={(e) => update(key, "open", e.target.value)} className={inputClass} />
                    <span className="text-xs text-center text-surface-400">—</span>
                    <input name={`${key}_close`} type="time" value={day.close} onChange={(e) => update(key, "close", e.target.value)} className={inputClass} />
                    <button
                      type="button"
                      onClick={() => addEvening(key)}
                      title="إضافة فترة مسائية"
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-3 h-3" />
                      فترتان
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full mt-3">
        حفظ ساعات العمل
      </SubmitButton>
    </form>
  );
}
