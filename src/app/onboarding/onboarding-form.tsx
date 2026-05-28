"use client";

import { useMemo, useRef, useState } from "react";
import { Bot, Building2, CheckCircle2, Clock3, Loader2, PhoneCall } from "lucide-react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { completeOnboarding } from "./actions";
import type { BusinessType } from "@/types";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

const steps = [
  { title: "بيانات النشاط", icon: Building2 },
  { title: "التواصل", icon: PhoneCall },
  { title: "ساعات العمل", icon: Clock3 },
  { title: "إعدادات البوت", icon: Bot },
] as const;

const businessTypes: { value: BusinessType; label: string }[] = [
  { value: "restaurant", label: "مطعم" },
  { value: "cafe", label: "مقهى" },
  { value: "clinic", label: "عيادة" },
  { value: "salon", label: "صالون" },
  { value: "retail", label: "متجر" },
  { value: "real_estate", label: "عقار" },
  { value: "services", label: "خدمات" },
  { value: "other", label: "نشاط آخر" },
];

const days = [
  { key: "saturday", label: "السبت" },
  { key: "sunday", label: "الأحد" },
  { key: "monday", label: "الإثنين" },
  { key: "tuesday", label: "الثلاثاء" },
  { key: "wednesday", label: "الأربعاء" },
  { key: "thursday", label: "الخميس" },
  { key: "friday", label: "الجمعة" },
] as const;

const requiredFieldsByStep = [
  ["name", "business_type", "city"],
  ["contact_phone", "contact_email", "whatsapp_number"],
  [],
  ["bot_personality", "bot_dialect", "bot_greeting"],
] as const;

type OnboardingFormProps = Readonly<{
  error?: string;
}>;

function FinalSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" disabled={pending} className="btn-primary min-w-44 disabled:cursor-not-allowed disabled:opacity-75">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري إنشاء النشاط...
        </>
      ) : (
        <>
          <CheckCircle2 className="h-4 w-4" />
          إنشاء النشاط
        </>
      )}
    </button>
  );
}

export function OnboardingForm({ error }: OnboardingFormProps) {
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function validateCurrentStep() {
    const form = formRef.current;
    if (!form) return false;

    const formData = new FormData(form);
    const missingField = requiredFieldsByStep[step].find((field) => !String(formData.get(field) ?? "").trim());

    if (missingField) {
      toast.error("أكمل الحقول المطلوبة قبل الانتقال للخطوة التالية.");
      return false;
    }

    return true;
  }

  function goNext() {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  return (
    <form ref={formRef} action={completeOnboarding} className="glass-card overflow-hidden">
      <div className="border-b border-surface-200/60 p-6 dark:border-surface-700/40">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-surface-500 dark:text-surface-400">الخطوة {step + 1} من {steps.length}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-surface-900 dark:text-white">{steps[step].title}</h2>
          </div>
          <div className="rounded-2xl bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
            {(() => {
              const Icon = steps[step].icon;
              return <Icon className="h-6 w-6" />;
            })()}
          </div>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
          <div className="h-full rounded-full gradient-bg transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const active = index === step;
            const done = index < step;
            return (
              <button
                key={item.title}
                type="button"
                onClick={() => {
                  if (index <= step || validateCurrentStep()) setStep(index);
                }}
                className={[
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors",
                  active
                    ? "border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-700 dark:bg-primary-900/30 dark:text-primary-200"
                    : done
                      ? "border-accent-200 bg-accent-50 text-accent-700 dark:border-accent-800 dark:bg-accent-900/20 dark:text-accent-300"
                      : "border-surface-200 text-surface-500 dark:border-surface-700 dark:text-surface-400",
                ].join(" ")}
              >
                {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {error ? (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-7 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        ) : null}

        <div hidden={step !== 0} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">اسم النشاط</span>
            <input name="name" className={inputClass} placeholder="مثال: عيادة النخبة" />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">نوع النشاط</span>
            <select name="business_type" defaultValue="services" className={inputClass}>
              {businessTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">المدينة</span>
            <input name="city" className={inputClass} placeholder="الرياض" />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">وصف مختصر</span>
            <textarea name="description" rows={4} className={`${inputClass} resize-none`} placeholder="اكتب وصفا قصيرا يساعد البوت على فهم نشاطك." />
          </label>
        </div>

        <div hidden={step !== 1} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">رقم الجوال</span>
            <input name="contact_phone" dir="ltr" className={inputClass} placeholder="+9665..." />
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">البريد الإلكتروني</span>
            <input name="contact_email" type="email" dir="ltr" className={inputClass} placeholder="owner@example.com" />
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">رقم WhatsApp</span>
            <input name="whatsapp_number" dir="ltr" className={inputClass} placeholder="+9665..." />
          </label>
        </div>

        <div hidden={step !== 2} className="space-y-3">
          {days.map((day) => (
            <div key={day.key} className="grid items-center gap-3 rounded-xl border border-surface-200/60 bg-surface-50/70 p-3 dark:border-surface-700/50 dark:bg-surface-800/30 md:grid-cols-[120px_1fr_1fr_auto]">
              <p className="font-medium text-surface-900 dark:text-white">{day.label}</p>
              <label className="space-y-1">
                <span className="text-xs text-surface-500">يفتح</span>
                <input name={`${day.key}_open`} type="time" defaultValue="09:00" className={inputClass} />
              </label>
              <label className="space-y-1">
                <span className="text-xs text-surface-500">يغلق</span>
                <input name={`${day.key}_close`} type="time" defaultValue="17:00" className={inputClass} />
              </label>
              <label className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                <input name={`${day.key}_closed`} type="checkbox" className="h-4 w-4 rounded border-surface-300 text-primary-600" />
                مغلق
              </label>
            </div>
          ))}
        </div>

        <div hidden={step !== 3} className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">شخصية البوت</span>
            <select name="bot_personality" defaultValue="friendly" className={inputClass}>
              <option value="friendly">ودود</option>
              <option value="professional">مهني</option>
              <option value="concise">مختصر</option>
            </select>
          </label>
          <label className="space-y-1.5">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">اللهجة</span>
            <select name="bot_dialect" defaultValue="saudi" className={inputClass}>
              <option value="saudi">سعودية</option>
              <option value="najdi">نجدية</option>
              <option value="hijazi">حجازية</option>
              <option value="formal_arabic">عربية فصحى مبسطة</option>
            </select>
          </label>
          <label className="space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">رسالة الترحيب</span>
            <textarea
              name="bot_greeting"
              rows={4}
              defaultValue="حياك الله، معك مساعد النشاط الذكي. كيف أقدر أخدمك اليوم؟"
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-200/60 p-6 dark:border-surface-700/40">
        <button type="button" onClick={goBack} disabled={step === 0} className="btn-secondary disabled:cursor-not-allowed disabled:opacity-50">
          السابق
        </button>
        {step < steps.length - 1 ? (
          <button type="button" onClick={goNext} className="btn-primary min-w-32">
            التالي
          </button>
        ) : (
          <FinalSubmitButton />
        )}
      </div>
    </form>
  );
}
