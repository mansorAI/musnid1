import { MessageSquare } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: { title: "المنتج", links: [{ label: "المميزات", href: "#features" }, { label: "الأسعار", href: "#pricing" }, { label: "كيف يعمل", href: "#how-it-works" }, { label: "التكاملات", href: "#" }] },
  company: { title: "الشركة", links: [{ label: "عن مُسند", href: "#" }, { label: "المدونة", href: "#" }, { label: "فرص العمل", href: "#" }, { label: "تواصل معنا", href: "#contact" }] },
  support: { title: "الدعم", links: [{ label: "مركز المساعدة", href: "#" }, { label: "الأسئلة الشائعة", href: "#faq" }, { label: "الحالة", href: "#" }, { label: "التوثيق", href: "#" }] },
  legal: { title: "قانوني", links: [{ label: "سياسة الخصوصية", href: "/privacy" }, { label: "شروط الاستخدام", href: "#" }, { label: "الأمان", href: "#" }] },
};

export default function Footer() {
  return (
    <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300 relative overflow-hidden">
      <div className="h-1 gradient-bg" />
      <div className="container-max mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 md:py-16 border-b border-surface-800">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">ابدأ إدارة محادثاتك باحترافية اليوم</h2>
            <p className="text-surface-400 mb-6 text-sm md:text-base">انضم لأكثر من 2,000 عميل يثقون بمُسند لإدارة تواصلهم مع العملاء</p>
            <Link href="/sign-in" className="btn-primary inline-flex">ابدأ مجاناً - بدون بطاقة ائتمان</Link>
          </div>
        </div>
        <div className="py-10 md:py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">مُسند</span>
            </a>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs">منصة سحابية تساعد الأعمال في السعودية على إدارة محادثات واتساب باحترافية.</p>
          </div>
          {Object.values(footerLinks).map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-bold text-white mb-4">{group.title}</h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-surface-400 hover:text-primary-400 transition-colors">{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="py-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-surface-500">&copy; {new Date().getFullYear()} مُسند. جميع الحقوق محفوظة.</p>
          <span className="text-xs text-surface-500">صُنع بفخر في السعودية 🇸🇦</span>
        </div>
      </div>
    </footer>
  );
}
