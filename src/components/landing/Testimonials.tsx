"use client";

import { Star, Quote } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const testimonials = [
  { name: "محمد العتيبي", role: "صاحب مطعم البيت السعودي", text: "مسند غيّر طريقة تعاملنا مع العملاء بالكامل. الآن نرد على حجوزات واتساب في ثوانٍ بدل ساعات. عملاؤنا سعداء ونحن أكثر إنتاجية.", rating: 5 },
  { name: "سارة الدوسري", role: "مديرة عيادة نور الطبية", text: "الردود التلقائية وفّرت على فريقنا وقتاً كبيراً. المرضى يحصلون على ردود فورية حتى خارج ساعات العمل. أنصح بها بشدة.", rating: 5 },
  { name: "خالد الشمري", role: "مؤسس متجر أناقة", text: "منصة سهلة الاستخدام وتقاريرها ممتازة. نعرف بالضبط كم محادثة، وقت الرد، ورضا العملاء. إدارة احترافية بضغطة زر.", rating: 5 },
];

function TestimonialCard({ testimonial, index }: { testimonial: (typeof testimonials)[0]; index: number }) {
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`glass-card p-6 md:p-7 relative hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isInView ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${index * 150}ms` }}>
      <Quote className="absolute top-5 left-5 w-8 h-8 text-primary-100 dark:text-primary-900/40 rotate-180" />
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="text-sm leading-relaxed text-surface-600 dark:text-surface-300 mb-6 relative z-10">{testimonial.text}</p>
      <div className="flex items-center gap-3 pt-4 border-t border-surface-200/50 dark:border-surface-700/30">
        <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">{testimonial.name[0]}</div>
        <div>
          <div className="text-sm font-bold text-surface-900 dark:text-white">{testimonial.name}</div>
          <div className="text-xs text-surface-500 dark:text-surface-400">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  return (
    <section className="section-padding bg-white dark:bg-surface-900 relative overflow-hidden">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">آراء العملاء</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">عملاؤنا <span className="gradient-text">يثقون بمسند</span></h2>
          <p className="section-subtitle mx-auto">أكثر من 2,000 عميل يعتمدون على مسند لإدارة محادثاتهم اليومية</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => <TestimonialCard key={i} testimonial={t} index={i} />)}
        </div>
      </div>
    </section>
  );
}
