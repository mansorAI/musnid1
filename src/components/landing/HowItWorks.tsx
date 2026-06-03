"use client";

import { Smartphone, Settings, Rocket, Headphones } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const steps = [
  { icon: Smartphone, step: "01", title: "اربط واتساب", desc: "اربط رقم واتساب أعمالك بمنصة مُسند بخطوات بسيطة في أقل من 5 دقائق." },
  { icon: Settings, step: "02", title: "خصّص الإعدادات", desc: "أنشئ ردوداً تلقائية، أضف فريقك، وابنِ قاعدتك المعرفية حسب احتياجاتك." },
  { icon: Rocket, step: "03", title: "ابدأ الإدارة", desc: "أدر محادثاتك من لوحة تحكم واحدة. تتبع، ردّ، وتابع بسهولة وفعالية." },
  { icon: Headphones, step: "04", title: "طوّر باستمرار", desc: "حلّل أداءك، حسّن ردودك، وطوّر خدمة عملائك مع تقارير ورؤى ذكية." },
];

function StepCard({ step, index }: { step: (typeof steps)[0]; index: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`text-center relative ${isInView ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${index * 150}ms` }}>
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center shadow-lg relative z-10">
          <step.icon className="w-7 h-7 text-white" />
        </div>
        <span className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-accent-500 text-white text-xs font-bold flex items-center justify-center shadow-md z-20">{step.step}</span>
      </div>
      <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{step.title}</h3>
      <p className="text-sm leading-relaxed text-surface-500 dark:text-surface-400 max-w-xs mx-auto">{step.desc}</p>
    </div>
  );
}

export default function HowItWorks() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  return (
    <section id="how-it-works" className="section-padding bg-white dark:bg-surface-900 relative">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">كيف يعمل</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">ابدأ في <span className="gradient-text">4 خطوات بسيطة</span></h2>
          <p className="section-subtitle mx-auto">إعداد سريع وسهل يضمن لك البدء في إدارة محادثاتك بأقل وقت وجهد</p>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-24 right-[12.5%] left-[12.5%] h-0.5 bg-gradient-to-l from-primary-300 via-accent-300 to-primary-300 dark:from-primary-700 dark:via-accent-700 dark:to-primary-700" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step, i) => <StepCard key={i} step={step} index={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
