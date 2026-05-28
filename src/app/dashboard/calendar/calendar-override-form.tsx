"use client";

import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { SubmitButton } from "@/components/ui/submit-button";
import { addCalendarOverride } from "./actions";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

export function CalendarOverrideForm({ error }: { error?: string }) {
  const [isClosed, setIsClosed] = useState(true);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
        <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة استثناء</h2>
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <PlusCircle className="w-5 h-5" />
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            تعذر حفظ الاستثناء. تأكد من اختيار تاريخ صحيح.
          </div>
        )}

        <form action={addCalendarOverride} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">التاريخ</label>
            <input name="date" type="date" className={inputClass} />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              name="is_closed"
              type="checkbox"
              checked={isClosed}
              onChange={(e) => setIsClosed(e.target.checked)}
              className="h-4 w-4 rounded border-surface-300 text-primary-600"
            />
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">يوم إغلاق استثنائي</span>
          </label>

          {!isClosed && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">يفتح</label>
                <input name="open_time" type="time" defaultValue="09:00" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-700 dark:text-surface-300">يغلق</label>
                <input name="close_time" type="time" defaultValue="17:00" className={inputClass} />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">ملاحظة (اختياري)</label>
            <input name="notes" className={inputClass} placeholder="مثال: إجازة رسمية" />
          </div>

          <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full">
            حفظ الاستثناء
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
