"use client";

import { useState } from "react";
import { Loader2, Send, Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { useInView } from "@/hooks/useInView";

export default function Contact() {
  const { ref: titleRef, isInView: titleVisible } = useInView();
  const { ref: formRef, isInView: formVisible } = useInView();
  const [formData, setFormData] = useState({ name: "", email: "", business: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: "", email: "", business: "", message: "" });
      toast.success("تم استلام رسالتك. سنتواصل معك قريبا.");
    }, 600);
  };

  return (
    <section id="contact" className="section-padding gradient-bg-subtle relative overflow-hidden">
      <div className="container-max relative z-10">
        <div ref={titleRef} className={`text-center mb-14 md:mb-20 ${titleVisible ? "animate-fade-in-up" : "opacity-0"}`}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 text-sm font-medium mb-4">تواصل معنا</span>
          <h2 className="section-title mb-4 text-surface-900 dark:text-white">جاهز لبدء <span className="gradient-text">رحلتك مع مُسند</span></h2>
          <p className="section-subtitle mx-auto">تواصل معنا وسنساعدك على اختيار الخطة المناسبة والبدء بأسرع وقت</p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 max-w-5xl mx-auto">
          <div className="lg:col-span-2 space-y-6">
            <div className={`glass-card p-6 ${formVisible ? "animate-fade-in-up" : "opacity-0"}`}>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-4">معلومات التواصل</h3>
              <div className="space-y-4">
                {[
                  { icon: Mail, label: "البريد الإلكتروني", value: "hello@musnid.sa" },
                  { icon: Phone, label: "الهاتف", value: "+966 50 123 4567" },
                  { icon: MapPin, label: "الموقع", value: "الرياض، المملكة العربية السعودية" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-surface-500 dark:text-surface-400">{item.label}</div>
                      <div className="text-sm font-medium text-surface-900 dark:text-white">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`glass-card p-6 ${formVisible ? "animate-fade-in-up delay-200" : "opacity-0"}`}>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">هل تحتاج مساعدة؟</h3>
              <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">فريقنا جاهز لمساعدتك في اختيار الخطة المناسبة وإعداد حسابك. نرد خلال ساعات.</p>
            </div>
          </div>

          <div ref={formRef} className={`lg:col-span-3 glass-card p-6 md:p-8 ${formVisible ? "animate-fade-in-up delay-100" : "opacity-0"}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">الاسم</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm" placeholder="اسمك الكامل" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">البريد الإلكتروني</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm" placeholder="email@example.com" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">اسم النشاط التجاري</label>
                <input type="text" value={formData.business} onChange={(e) => setFormData({ ...formData, business: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm" placeholder="اسم نشاطك أو شركتك" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">رسالتك</label>
                <textarea rows={4} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm resize-none" placeholder="أخبرنا كيف يمكننا مساعدتك..." />
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-75">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? "جاري الإرسال..." : "أرسل رسالتك"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
