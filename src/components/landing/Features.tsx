"use client";

import { MessageSquareText, Bot, BookOpen, BarChart3, Users, Clock, ShieldCheck, Zap } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const features = [
  { icon: MessageSquareText, title: "إدارة المحادثات", desc: "تتبع جميع محادثات واتساب من مكان واحد. نظّم الرسائل حسب الأولوية والحالة والعميل.", color: "primary" },
  { icon: Bot, title: "أتمتة الردود", desc: "أنشئ ردوداً تلقائية ذكية للأسئلة الشائعة. وفّر وقت فريقك مع الحفاظ على جودة الرد.", color: "accent" },
  { icon: BookOpen, title: "قاعدة معرفية", desc: "ابنِ مكتبة معلومات شاملة عن خدماتك ومنتجاتك. ردّ بسرعة بدقة من معلومات محدّثة.", color: "primary" },
  { icon: BarChart3, title: "تقارير وتحليلات", desc: "راقب أداء فريقك، أوقات الرد، ورضا العملاء. قرارات مبنية على بيانات حقيقية.", color: "accent" },
  { icon: Users, title: "إدارة الفريق", desc: "خصّص الصلاحيات والمحادثات بين أعضاء الفريق. تعاون فعال بدون تداخل.", color: "primary" },
  { icon: Clock, title: "رد فوري 24/7", desc: "استجب لعملائك حتى خارج ساعات العمل. الردود التلقائية لا تنام أبداً.", color: "accent" },
  { icon: ShieldCheck, title: "أمان وخصوصية", desc: "بيانات مشفّرة بالكامل مع صلاحيات وصول محددة. نلتزم بأعلى معايير الأمان.", color: "primary" },
  { icon: Zap, title: "تكامل سريع", desc: "اربط واتساب في دقائق بدون تعقيدات تقنية. ابدأ فوراً بضغطة زر.", color: "accent" },
];

function FeatureCard({ feature, index }: { feature: (typeof features)[0]; index: number }) {
  const { ref, isInView } = useInView(0.1);
  const isPrimary = feature.color === "primary";
  return (
    <div
      ref={ref}
      className={`group glass-card p-6 md:p-7 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ${isInView ? "animate-fade-in-up" : "opacity-0"}`}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 ${isPrimary ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400" : "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"}`}>
        <feature.icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
      <p className="text-sm leading-relaxed text-surface-500 dark:text-surface-400">{feature.desc}</p>
    </div>
  );
}

export default function Features() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  return (
    <section id="features" className="section-padding gradient-bg-subtle relative">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">المميزات</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">كل ما تحتاجه لإدارة <span className="gradient-text">محادثاتك</span></h2>
          <p className="section-subtitle mx-auto">أدوات متكاملة تساعدك على تقديم خدمة عملاء استثنائية وبناء علاقات أقوى مع عملائك</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((feature, i) => <FeatureCard key={i} feature={feature} index={i} />)}
        </div>
      </div>
    </section>
  );
}
