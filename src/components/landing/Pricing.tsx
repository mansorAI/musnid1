"use client";

import { Check } from "lucide-react";
import { useInView } from "@/hooks/useInView";
import Link from "next/link";

const plans = [
  {
    name: "مجاني", price: "0", period: "", desc: "للتجربة والبدء",
    features: ["ربط واتساب واحد", "عضو فريق واحد", "50 محادثة شهرياً", "ردود تلقائية أساسية", "قاعدة معرفية محدودة"],
    highlight: false,
  },
  {
    name: "أساسي", price: "99", period: "/شهرياً", desc: "للأعمال النامية",
    features: ["ربط واتساب واحد", "5 أعضاء فريق", "محادثات غير محدودة", "ردود تلقائية متقدمة", "قاعدة معرفية كاملة", "تقارير أساسية", "دعم بالبريد"],
    highlight: true,
  },
  {
    name: "احترافي", price: "249", period: "/شهرياً", desc: "للفرق المحترفة",
    features: ["3 أرقام واتساب", "20 عضو فريق", "محادثات غير محدودة", "أتمتة ذكية بالذكاء الاصطناعي", "قاعدة معرفية متقدمة", "تقارير وتحليلات شاملة", "صلاحيات مخصصة", "دعم أولوية 24/7", "API مفتوح"],
    highlight: false,
  },
];

function PricingCard({ plan, index }: { plan: (typeof plans)[0]; index: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`relative rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 ${plan.highlight ? "gradient-bg text-white shadow-2xl scale-[1.02] md:scale-105 z-10" : "glass-card hover:shadow-xl"} ${isInView ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${index * 150}ms` }}>
      {plan.highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-accent-500 text-white text-xs font-bold shadow-lg">الأكثر طلباً</div>
      )}
      <div className="mb-6">
        <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? "text-white" : "text-surface-900 dark:text-white"}`}>{plan.name}</h3>
        <p className={`text-sm ${plan.highlight ? "text-white/70" : "text-surface-500 dark:text-surface-400"}`}>{plan.desc}</p>
      </div>
      <div className="mb-6">
        <span className={`text-4xl md:text-5xl font-extrabold ${plan.highlight ? "text-white" : "text-surface-900 dark:text-white"}`}>{plan.price}</span>
        <span className={`text-sm ${plan.highlight ? "text-white/70" : "text-surface-500 dark:text-surface-400"}`}>{plan.period ? `ر.س${plan.period}` : "ر.س"}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-accent-300" : "text-accent-500 dark:text-accent-400"}`} />
            <span className={`text-sm ${plan.highlight ? "text-white/90" : "text-surface-600 dark:text-surface-300"}`}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href="/sign-in" className={`block text-center w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 hover:-translate-y-0.5 ${plan.highlight ? "bg-white text-primary-700 hover:shadow-lg" : "btn-primary !w-full"}`}>
        {plan.price === "0" ? "ابدأ مجاناً" : "ابدأ الآن"}
      </Link>
    </div>
  );
}

export default function Pricing() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  return (
    <section id="pricing" className="section-padding bg-white dark:bg-surface-900 relative overflow-hidden">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">الأسعار</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">خطط تناسب <span className="gradient-text">جميع احتياجاتك</span></h2>
          <p className="section-subtitle mx-auto">ابدأ مجاناً وقسّم عند الحاجة. بدون رسوم مخفية أو عقود طويلة.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto items-stretch">
          {plans.map((plan, i) => <PricingCard key={i} plan={plan} index={i} />)}
        </div>
      </div>
    </section>
  );
}
