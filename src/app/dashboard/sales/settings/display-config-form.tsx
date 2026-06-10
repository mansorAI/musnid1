"use client";

import { useState } from "react";
import { saveProductDisplayConfig } from "../actions";
import type { ProductDisplayConfig } from "@/lib/dashboard-data";

const TOGGLE_OPTIONS: {
  key: keyof ProductDisplayConfig;
  label: string;
  desc: string;
  exclusive?: boolean;
}[] = [
  { key: "showImage",          label: "عرض الصورة",       desc: "صورة المنتج في الكارت" },
  { key: "showPrice",          label: "عرض السعر",        desc: "سعر المنتج والتسعيرة" },
  { key: "showDescription",    label: "وصف المنتج",       desc: "يُعطّل رابط الموقع عند تفعيله", exclusive: true },
  { key: "showLocation",       label: "رابط الموقع",      desc: "رابط الخريطة — يُعطَّل عند تفعيل الوصف" },
  { key: "showQtyControls",    label: "أزرار الكمية",     desc: "إضافة وإزالة الكمية + و −" },
  { key: "bookingButton",      label: "زر حجز",           desc: "يستبدل أزرار الكمية بزر حجز واحد" },
  { key: "showDateButton",     label: "زر التاريخ",       desc: "تقويم لاختيار يوم الحجز" },
  { key: "showTimeButton",     label: "زر الوقت",         desc: "منتقي الأوقات المتاحة" },
  { key: "showImageGallery",   label: "تصفح الصور",       desc: "أيقونة صور على الكارت تفتح معرض الصور" },
];

const DAYS = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];

export function DisplayConfigForm({
  config,
  constraints,
  saved,
}: {
  config: ProductDisplayConfig;
  constraints: Partial<ProductDisplayConfig> | null;
  saved?: boolean;
}) {
  const [cfg, setCfg] = useState<ProductDisplayConfig>(() => {
    const applied = { ...config };
    if (constraints) {
      for (const [k, v] of Object.entries(constraints)) {
        if (v === false) (applied as Record<string, unknown>)[k] = false;
      }
    }
    return applied;
  });

  function toggleBool(key: keyof ProductDisplayConfig) {
    setCfg((prev) => {
      const next = { ...prev, [key]: !(prev[key] as boolean) };
      if (key === "showDescription" && next.showDescription) {
        next.showLocation = false;
      }
      return next;
    });
  }

  function isDisabled(key: string): boolean {
    if (constraints && key in constraints && constraints[key as keyof typeof constraints] === false) return true;
    if (key === "showLocation" && cfg.showDescription) return true;
    return false;
  }

  function toggleDay(i: number) {
    setCfg((prev) => ({
      ...prev,
      bookingAvailableDays: prev.bookingAvailableDays.includes(i)
        ? prev.bookingAvailableDays.filter((d) => d !== i)
        : [...prev.bookingAvailableDays, i].sort((a, b) => a - b),
    }));
  }

  return (
    <form action={saveProductDisplayConfig} className="space-y-5" dir="rtl">
      {/* Hidden state carriers */}
      {TOGGLE_OPTIONS.map((opt) => (
        <input
          key={opt.key}
          type="hidden"
          name={opt.key}
          value={(cfg[opt.key] as boolean) ? "on" : ""}
        />
      ))}
      <input type="hidden" name="cardLayout"    value={cfg.cardLayout} />
      <input type="hidden" name="showGridLayout" value={cfg.showGridLayout ? "on" : ""} />
      <input type="hidden" name="showListLayout" value={cfg.showListLayout ? "on" : ""} />
      <input type="hidden" name="bookingDateMode" value={cfg.bookingDateMode} />
      <input type="hidden" name="allowRepeatedDateBookings" value={cfg.allowRepeatedDateBookings ? "on" : ""} />
      <input type="hidden" name="allowRepeatedTimeBookings" value={cfg.allowRepeatedTimeBookings ? "on" : ""} />
      <input type="hidden" name="paymentTimeoutMinutes" value={cfg.paymentTimeoutMinutes} />
      {[0,1,2,3,4,5,6].map((i) => (
        <input key={i} type="hidden" name={`day_${i}`} value={cfg.bookingAvailableDays.includes(i) ? "on" : ""} />
      ))}

      {saved && (
        <div className="rounded-xl border border-accent-200 bg-accent-50 p-3 text-sm text-accent-700 dark:border-accent-800 dark:bg-accent-900/20 dark:text-accent-300">
          تم حفظ إعدادات العرض.
        </div>
      )}

      {/* ── شكل الكارت ── */}
      <div className="glass-card p-5">
        <h3 className="mb-3 text-sm font-bold text-surface-900 dark:text-white">شكل الكارت</h3>
        <div className="flex gap-3">
          {(["grid", "list"] as const).map((layout) => {
            const active = cfg.cardLayout === layout;
            const constrained = layout === "grid"
              ? constraints?.showGridLayout === false
              : constraints?.showListLayout === false;
            return (
              <button
                key={layout}
                type="button"
                disabled={constrained}
                onClick={() => setCfg((prev) => ({ ...prev, cardLayout: layout }))}
                className={`flex-1 rounded-xl border-2 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  active
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400"
                    : "border-surface-200 text-surface-500 hover:border-surface-300 dark:border-surface-700 dark:text-surface-400"
                }`}
              >
                {layout === "grid" ? "⊞ مربع" : "☰ مستطيل"}
                {constrained && <span className="mt-0.5 block text-[10px] font-normal opacity-70">محدد من الأدمن</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── خيارات عرض الكارت ── */}
      <div className="glass-card p-5">
        <h3 className="mb-4 text-sm font-bold text-surface-900 dark:text-white">خيارات عرض الكارت</h3>
        <div className="divide-y divide-surface-100 dark:divide-surface-800">
          {TOGGLE_OPTIONS.map((opt) => {
            const val = cfg[opt.key] as boolean;
            const disabled = isDisabled(opt.key);
            return (
              <div
                key={opt.key}
                className={`flex items-center justify-between py-3 ${disabled ? "opacity-40" : ""}`}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={val && !disabled}
                  disabled={disabled}
                  onClick={() => !disabled && toggleBool(opt.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed ${
                    val && !disabled ? "bg-primary-500" : "bg-surface-200 dark:bg-surface-700"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      val && !disabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <div className="mr-3 flex-1 text-right">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{opt.label}</p>
                  <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{opt.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── إعداد التواريخ ── */}
      {cfg.showDateButton && (
        <div className="glass-card space-y-4 p-5">
          <h3 className="text-sm font-bold text-surface-900 dark:text-white">إعداد التواريخ المتاحة</h3>

          {/* طريقة التواريخ */}
          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              {constraints?.allowRepeatedDateBookings !== false && (
                <button
                  type="button"
                  role="switch"
                  aria-checked={cfg.allowRepeatedDateBookings}
                  onClick={() => toggleBool("allowRepeatedDateBookings")}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                    cfg.allowRepeatedDateBookings
                      ? "border-teal-500 bg-teal-500 text-white"
                      : "border-surface-200 text-surface-500 dark:border-surface-700 dark:text-surface-400"
                  }`}
                >
                  حجز متكرر
                </button>
              )}
              <p className="text-xs text-surface-500 dark:text-surface-400">طريقة إتاحة التواريخ</p>
            </div>
            <div className="flex gap-2">
              {([
                ["open",     "مفتوح"],
                ["selected", "تواريخ محددة"],
                ["range",    "نطاق تاريخ"],
              ] as const).map(([mode, label]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCfg((prev) => ({ ...prev, bookingDateMode: mode, bookingOpenCalendar: mode === "open" }))}
                  className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-colors ${
                    cfg.bookingDateMode === mode
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-surface-200 text-surface-500 hover:border-surface-300 dark:border-surface-700 dark:text-surface-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* أيام الأسبوع */}
          <div>
            <p className="mb-2 text-xs text-surface-500 dark:text-surface-400">أيام الأسبوع المتاحة (فارغ = كل الأيام)</p>
            <div className="flex flex-wrap justify-end gap-2">
              {DAYS.map((day, i) => {
                const active = cfg.bookingAvailableDays.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                      active
                        ? "border-teal-500 bg-teal-500 text-white"
                        : "border-surface-200 text-surface-500 dark:border-surface-700 dark:text-surface-400"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* تواريخ محددة */}
          {cfg.bookingDateMode === "selected" && (
            <div>
              <p className="mb-1.5 text-xs text-surface-500 dark:text-surface-400">التواريخ المتاحة — كل سطر تاريخ (مثال: 2026-06-15)</p>
              <textarea
                name="bookingSelectedDates"
                defaultValue={cfg.bookingSelectedDates.join("\n")}
                rows={3}
                dir="ltr"
                placeholder={"2026-06-15\n2026-06-16"}
                className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-sm dark:border-surface-700 dark:bg-surface-800/50"
              />
            </div>
          )}

          {/* نطاق تاريخ */}
          {cfg.bookingDateMode === "range" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1.5 text-xs text-surface-500 dark:text-surface-400">تاريخ النهاية</p>
                <input
                  type="date"
                  name="bookingRangeEnd"
                  defaultValue={cfg.bookingRangeEnd ?? ""}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm dark:border-surface-700 dark:bg-surface-800/50"
                />
              </div>
              <div>
                <p className="mb-1.5 text-xs text-surface-500 dark:text-surface-400">تاريخ البداية</p>
                <input
                  type="date"
                  name="bookingRangeStart"
                  defaultValue={cfg.bookingRangeStart ?? ""}
                  className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-2.5 text-sm dark:border-surface-700 dark:bg-surface-800/50"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── أوقات الحجز ── */}
      {cfg.showTimeButton && (
        <div className="glass-card space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            {constraints?.allowRepeatedTimeBookings !== false && (
              <button
                type="button"
                role="switch"
                aria-checked={cfg.allowRepeatedTimeBookings}
                onClick={() => toggleBool("allowRepeatedTimeBookings")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                  cfg.allowRepeatedTimeBookings
                    ? "border-teal-500 bg-teal-500 text-white"
                    : "border-surface-200 text-surface-500 dark:border-surface-700 dark:text-surface-400"
                }`}
              >
                حجز متكرر
              </button>
            )}
            <h3 className="text-sm font-bold text-surface-900 dark:text-white">أوقات الحجز المتاحة</h3>
          </div>
          <p className="text-xs text-surface-500 dark:text-surface-400">كل سطر وقت بصيغة 24 ساعة — مثال: 09:00</p>
          <textarea
            name="bookingTimeSlots"
            defaultValue={cfg.bookingTimeSlots.join("\n")}
            rows={4}
            dir="ltr"
            placeholder={"09:00\n10:00\n11:00\n14:00"}
            className="w-full rounded-xl border border-surface-200 bg-surface-50 px-4 py-3 font-mono text-sm dark:border-surface-700 dark:bg-surface-800/50"
          />
        </div>
      )}

      <div className="glass-card space-y-3 p-5">
        <h3 className="text-sm font-bold text-surface-900 dark:text-white">مهلة دفع الطلب</h3>
        <p className="text-xs text-surface-500 dark:text-surface-400">بعد انتهاء المهلة يُلغى الطلب ويُحرر الموعد تلقائياً.</p>
        <div className="flex flex-wrap gap-2">
          {[15, 30, 60, 120].map((minutes) => (
            <button
              key={minutes}
              type="button"
              onClick={() => setCfg((prev) => ({ ...prev, paymentTimeoutMinutes: minutes }))}
              className={`rounded-xl border px-4 py-2 text-xs font-bold ${
                cfg.paymentTimeoutMinutes === minutes
                  ? "border-primary-500 bg-primary-500 text-white"
                  : "border-surface-200 text-surface-500 dark:border-surface-700 dark:text-surface-400"
              }`}
            >
              {minutes >= 60 ? `${minutes / 60} ساعة` : `${minutes} دقيقة`}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="btn-primary w-full">
        حفظ إعدادات العرض
      </button>
    </form>
  );
}
