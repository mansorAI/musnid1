"use client";

import { TrendingUp, Clock, HeartHandshake, Award, Target } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const benefits = [
  { icon: Clock, title: "وفّر 60% من وقتك", desc: "الأتمتة والتنظيم الذكي يقللان الوقت المهدر في إدارة المحادثات المتكررة." },
  { icon: TrendingUp, title: "زِد رضا العملاء", desc: "ردود أسرع وأدق تعني عملاء أسعد. سرعة الاستجابة مفتاح الولاء." },
  { icon: HeartHandshake, title: "بنِ علاقات أقوى", desc: "تواصل شخصي ومنظم يبني ثقة طويلة الأمد مع كل عميل يتفاعل معك." },
  { icon: Award, title: "خدمة احترافية", desc: "قدّم مستوى خدمة يضاهي الشركات الكبرى بأدوات بسيطة ومتاحة." },
  { icon: Target, title: "قرارات مبنية على بيانات", desc: "تقارير دقيقة تكشف أداء فريقك وتساعدك على التحسين المستمر." },
];

const stats = [
  { value: "60%", label: "توفير في الوقت" },
  { value: "3x", label: "سرعة الرد" },
  { value: "95%", label: "رضا العملاء" },
  { value: "24/7", label: "توفر مستمر" },
];

function BenefitCard({ benefit, index }: { benefit: (typeof benefits)[0]; index: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`glass-card p-6 flex gap-4 items-start hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${isInView ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${index * 100}ms` }}>
      <div className="w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/30 flex items-center justify-center shrink-0 text-accent-600 dark:text-accent-400">
        <benefit.icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1">{benefit.title}</h3>
        <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{benefit.desc}</p>
      </div>
    </div>
  );
}

export default function Benefits() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  const { ref: statsRef, isInView: statsVisible } = useInView();
  return (
    <section id="benefits" className="section-padding gradient-bg-subtle relative overflow-hidden">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">لماذا مسند</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">منصة صُممت لتجعل <span className="gradient-text">عملك أسهل</span></h2>
          <p className="section-subtitle mx-auto">فوائد ملموسة تُحسّن طريقة تواصلك مع عملائك وتُرتقي بجودة خدمتك</p>
        </div>
        <div ref={statsRef} className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-14 md:mb-20 ${statsVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          {stats.map((stat, i) => (
            <div key={i} className="glass-card text-center p-6 hover:shadow-lg transition-shadow" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">{stat.value}</div>
              <div className="text-sm text-surface-500 dark:text-surface-400">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-4xl mx-auto">
          {benefits.map((benefit, i) => <BenefitCard key={i} benefit={benefit} index={i} />)}
        </div>
      </div>
    </section>
  );
}
