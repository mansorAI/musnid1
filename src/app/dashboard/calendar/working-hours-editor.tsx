"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateWorkingHours } from "./actions";

const inputClass =
  "px-3 py-2 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

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

function defaultDay(): DayHours {
  return { closed: false, open: "09:00", close: "17:00", has_evening: false, evening_open: "17:00", evening_close: "22:00" };
}

export function WorkingHoursEditor({ workingHours }: { workingHours: WorkingHoursRaw | null }) {
  const [state, setState] = useState<Record<DayKey, DayHours>>(() => {
    const result = {} as Record<DayKey, DayHours>;
    for (const day of days) {
      const raw = workingHours?.[day.key];
      result[day.key] = {
        closed: raw?.closed ?? false,
        open: raw?.open ?? "09:00",
        close: raw?.close ?? "17:00",
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

  return (
    <form action={updateWorkingHours} className="space-y-3">
      {days.map(({ key, label }) => {
        const day = state[key];
        return (
          <div key={key} className="rounded-xl border border-surface-200/60 dark:border-surface-700/50 bg-surface-50/70 dark:bg-surface-800/30 p-3 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium text-surface-900 dark:text-white w-20 shrink-0">{label}</span>

              <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300 cursor-pointer">
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
                <div className="grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 text-xs text-surface-500">
                  <span>صباحاً</span>
                  <input name={`${key}_open`} type="time" value={day.open} onChange={(e) => update(key, "open", e.target.value)} className={inputClass} />
                  <span>—</span>
                  <input name={`${key}_close`} type="time" value={day.close} onChange={(e) => update(key, "close", e.target.value)} className={inputClass} />
                  <label className="flex items-center gap-1.5 cursor-pointer whitespace-nowrap text-primary-600 dark:text-primary-400">
                    <input
                      name={`${key}_has_evening`}
                      type="checkbox"
                      checked={day.has_evening}
                      onChange={(e) => update(key, "has_evening", e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-surface-300 text-primary-600"
                    />
                    + مسائي
                  </label>
                </div>

                {day.has_evening && (
                  <div className="grid grid-cols-[auto_1fr_auto_1fr] items-center gap-2 text-xs text-surface-500 pr-2">
                    <span>مساءً</span>
                    <input name={`${key}_evening_open`} type="time" value={day.evening_open} onChange={(e) => update(key, "evening_open", e.target.value)} className={inputClass} />
                    <span>—</span>
                    <input name={`${key}_evening_close`} type="time" value={day.evening_close} onChange={(e) => update(key, "evening_close", e.target.value)} className={inputClass} />
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full mt-2">
        حفظ ساعات العمل
      </SubmitButton>
    </form>
  );
}
