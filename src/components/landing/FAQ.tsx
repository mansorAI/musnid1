"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useInView } from "@/hooks/useInView";

const faqs = [
  { q: "كيف أربط واتساب بمُسند؟", a: "عملية الربط سهلة وسريعة. سجّل في مُسند، اختر 'ربط واتساب'، امسح رمز QR من تطبيق واتساب أعمال، وسيتم الربط تلقائياً في أقل من 5 دقائق." },
  { q: "هل يمكنني تجربة مُسند مجاناً؟", a: "نعم! نوفر خطة مجانية تتيح لك تجربة الميزات الأساسية بدون بطاقة ائتمان. يمكنك الترقية في أي وقت عند حاجتك لميزات إضافية." },
  { q: "هل بياناتي آمنة على مُسند؟", a: "أمان بياناتك أولويتنا القصوى. نستخدم تشفير AES-256، نلتزم بمعايير GDPR، وجميع البيانات مخزّنة على خوادم آمنة مع نسخ احتياطي يومي." },
  { q: "كم عدد أعضاء الفريق الذين يمكنني إضافتهم؟", a: "يعتمد على الخطة المختارة. الخطة المجانية تتيح عضواً واحداً، الخطة الأساسية حتى 5 أعضاء، والخطة الاحترافية حتى 20 عضواً مع صلاحيات مخصصة." },
  { q: "هل يعمل مُسند مع واتساب العادي أم أعمال فقط؟", a: "مُسند يعمل مع واتساب أعمال API الذي يوفر ميزات متقدمة مثل الرسائل التلقائية والقوائم. يمكنك الترقية من واتساب العادي إلى أعمال بسهولة." },
  { q: "هل يمكنني إنشاء ردود تلقائية مخصصة؟", a: "بالتأكيد! يمكنك إنشاء ردود تلقائية بناءً على كلمات مفتاحية، أوقات محددة، أو حالات المحادثة. كما يمكنك ربطها بقاعدتك المعرفية لردود أذكى." },
];

function FAQItem({ faq, index }: { faq: { q: string; a: string }; index: number }) {
  const [isOpen, setIsOpen] = useState(index === 0);
  const { ref, isInView } = useInView(0.1);
  return (
    <div ref={ref} className={`glass-card overflow-hidden transition-all duration-300 ${isOpen ? "shadow-lg" : ""} ${isInView ? "animate-fade-in-up" : "opacity-0"}`} style={{ animationDelay: `${index * 80}ms` }}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between p-5 md:p-6 text-right">
        <span className="text-base font-bold text-surface-900 dark:text-white pl-4">{faq.q}</span>
        <ChevronDown className={`w-5 h-5 text-surface-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`transition-all duration-300 ${isOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm leading-relaxed text-surface-500 dark:text-surface-400 border-t border-surface-200/30 dark:border-surface-700/20 pt-4">{faq.a}</div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  return (
    <section id="faq" className="section-padding gradient-bg-subtle relative overflow-hidden">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-4">أسئلة شائعة</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">إجابات على <span className="gradient-text">أسئلتك</span></h2>
          <p className="section-subtitle mx-auto">إليك أكثر الأسئلة شيوعاً عن مُسند. لم تجد إجابتك؟ تواصل معنا مباشرة.</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
        </div>
      </div>
    </section>
  );
}
