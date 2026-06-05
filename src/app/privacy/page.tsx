import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Database, MessageSquare, Lock, Users, AlertCircle } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية | مُسنِد",
  description: "سياسة الخصوصية لمنصة مُسنِد — كيف نجمع بياناتك ونحميها.",
};

const sections = [
  {
    icon: Database,
    title: "البيانات التي نجمعها",
    content: [
      {
        subtitle: "أرقام واتساب",
        text: "نجمع أرقام واتساب الخاصة بعملاء الأعمال التي تستخدم منصتنا. يتم ذلك بشكل مباشر عند تسجيل العملاء أو خلال تفاعلهم مع البوت الخاص بنشاطك التجاري.",
      },
      {
        subtitle: "بيانات الأعمال",
        text: "نجمع معلومات الأعمال كاسم النشاط التجاري، بيانات الاتصال، إعدادات البوت، سجلات المحادثات، وبيانات الطلبات والحجوزات المرتبطة بنشاطك.",
      },
      {
        subtitle: "بيانات الاستخدام",
        text: "نسجّل سجلات النشاط، إحصاءات المحادثات، وأداء الردود التلقائية بهدف تحسين جودة الخدمة.",
      },
    ],
  },
  {
    icon: MessageSquare,
    title: "كيف نستخدم بياناتك",
    content: [
      {
        subtitle: "إرسال الرسائل التجارية",
        text: "نستخدم أرقام واتساب المُجمَّعة لإرسال رسائل تجارية نيابةً عن الأعمال المشتركة في المنصة، كتأكيدات الحجز، إشعارات الطلبات، والردود التلقائية على استفسارات العملاء.",
      },
      {
        subtitle: "تشغيل وتحسين الخدمة",
        text: "نستخدم البيانات لتشغيل البوت الخاص بنشاطك، تحليل الأداء، واكتشاف الأخطاء وإصلاحها.",
      },
      {
        subtitle: "الدعم الفني",
        text: "قد يصل فريق الدعم لدينا إلى بيانات ضرورية لحل مشكلات تقنية بناءً على طلبك.",
      },
    ],
  },
  {
    icon: Lock,
    title: "حماية البيانات وعدم بيعها",
    content: [
      {
        subtitle: "لا نبيع بياناتك",
        text: "نلتزم بشكل قاطع بعدم بيع أي بيانات شخصية أو بيانات عملاء لأطراف ثالثة تحت أي ظرف. بياناتك ملكٌ لك.",
      },
      {
        subtitle: "التشفير والأمان",
        text: "تُخزَّن جميع البيانات بتشفير كامل. نتبع أفضل ممارسات الأمان لحماية المعلومات الحساسة من الوصول غير المصرح به.",
      },
      {
        subtitle: "الاحتفاظ بالبيانات",
        text: "نحتفظ بالبيانات طالما كان حسابك نشطاً. عند إلغاء الاشتراك يمكنك طلب حذف بياناتك بالكامل.",
      },
    ],
  },
  {
    icon: Users,
    title: "الشركاء التقنيون",
    content: [
      {
        subtitle: "Twilio",
        text: "نستخدم Twilio كمزوّد لخدمات الرسائل والاتصالات. يتعامل Twilio مع إرسال واستقبال رسائل واتساب واتصالات SMS وفق سياسة خصوصيتهم الخاصة.",
      },
      {
        subtitle: "Meta WhatsApp Business API",
        text: "تُرسَل الرسائل عبر Meta WhatsApp Business API الرسمية. يخضع استخدامنا لهذه الخدمة لشروط استخدام Meta وسياسات WhatsApp Business.",
      },
      {
        subtitle: "Supabase",
        text: "تُخزَّن بياناتك بأمان على خوادم Supabase بالبنية التحتية لـ AWS مع تشفير كامل للبيانات أثناء النقل والتخزين.",
      },
    ],
  },
  {
    icon: AlertCircle,
    title: "حقوقك",
    content: [
      {
        subtitle: "الوصول والتعديل",
        text: "يحق لك في أي وقت طلب الاطلاع على بياناتك أو تصحيحها أو تحديثها عبر التواصل معنا مباشرة.",
      },
      {
        subtitle: "الحذف",
        text: "يمكنك طلب حذف جميع بياناتك من أنظمتنا. سنُنجز الطلب خلال 30 يوم عمل وفق الالتزامات القانونية المعمول بها.",
      },
      {
        subtitle: "الاعتراض",
        text: "يحق لك الاعتراض على أي معالجة لبياناتك. تواصل معنا وسنتعامل مع طلبك خلال 5 أيام عمل.",
      },
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/60 to-white dark:from-surface-900 dark:to-surface-950">
        <div className="container-max mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-lg shadow-primary-500/25 mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white mb-4">
            سياسة الخصوصية
          </h1>
          <p className="text-surface-500 dark:text-surface-400 text-lg max-w-xl mx-auto leading-relaxed">
            نحن نأخذ خصوصيتك وخصوصية عملائك على محمل الجد. هذه الوثيقة توضّح كيف نجمع بياناتك ونستخدمها ونحميها.
          </p>
          <p className="mt-4 text-sm text-surface-400 dark:text-surface-500">
            آخر تحديث: يونيو 2025
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container-max mx-auto max-w-3xl">

          {/* Intro notice */}
          <div className="mb-12 p-5 rounded-2xl bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/40 flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <p className="text-sm text-accent-800 dark:text-accent-300 leading-relaxed">
              بتسجيلك في مُسنِد واستخدامك لخدماتنا، فإنك توافق على هذه السياسة. إذا كنت تستخدم المنصة نيابةً عن نشاط تجاري فأنت تؤكد صلاحيتك لقبول هذه الشروط.
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-14">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-sm shadow-primary-500/20">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-extrabold text-surface-900 dark:text-white">
                      {section.title}
                    </h2>
                  </div>
                  <div className="space-y-5 pr-2">
                    {section.content.map((item, j) => (
                      <div key={j} className="p-5 rounded-xl bg-surface-50 dark:bg-surface-900/60 border border-surface-100 dark:border-surface-800/50">
                        <h3 className="text-sm font-bold text-surface-800 dark:text-surface-200 mb-2">
                          {item.subtitle}
                        </h3>
                        <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact */}
          <div className="mt-16 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-center">
            <h2 className="text-lg font-extrabold text-surface-900 dark:text-white mb-2">
              تواصل معنا
            </h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
              إذا كانت لديك أي أسئلة أو استفسارات حول سياسة الخصوصية أو بيانات حسابك، تواصل معنا مباشرة.
            </p>
            <a
              href="mailto:privacy@musnid.com"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              privacy@musnid.com
            </a>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}
