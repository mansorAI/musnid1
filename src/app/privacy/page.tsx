import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Shield, Database, MessageSquare, Lock, Users, AlertCircle } from "lucide-react";

export const metadata = {
  title: "سياسة الخصوصية | Privacy Policy — مُسنِد",
  description: "سياسة الخصوصية لمنصة مُسنِد — Musnid Privacy Policy.",
};

const arSections = [
  {
    icon: Database,
    title: "البيانات التي نجمعها",
    content: [
      { subtitle: "أرقام واتساب", text: "نجمع أرقام واتساب الخاصة بعملاء الأعمال التي تستخدم منصتنا. يتم ذلك بشكل مباشر عند تسجيل العملاء أو خلال تفاعلهم مع البوت الخاص بنشاطك التجاري." },
      { subtitle: "بيانات الأعمال", text: "نجمع معلومات الأعمال كاسم النشاط التجاري، بيانات الاتصال، إعدادات البوت، سجلات المحادثات، وبيانات الطلبات والحجوزات المرتبطة بنشاطك." },
      { subtitle: "بيانات الاستخدام", text: "نسجّل سجلات النشاط، إحصاءات المحادثات، وأداء الردود التلقائية بهدف تحسين جودة الخدمة." },
    ],
  },
  {
    icon: MessageSquare,
    title: "كيف نستخدم بياناتك",
    content: [
      { subtitle: "إرسال الرسائل التجارية", text: "نستخدم أرقام واتساب المُجمَّعة لإرسال رسائل تجارية نيابةً عن الأعمال المشتركة في المنصة، كتأكيدات الحجز، إشعارات الطلبات، والردود التلقائية على استفسارات العملاء." },
      { subtitle: "تشغيل وتحسين الخدمة", text: "نستخدم البيانات لتشغيل البوت الخاص بنشاطك، تحليل الأداء، واكتشاف الأخطاء وإصلاحها." },
      { subtitle: "الدعم الفني", text: "قد يصل فريق الدعم لدينا إلى بيانات ضرورية لحل مشكلات تقنية بناءً على طلبك." },
    ],
  },
  {
    icon: Lock,
    title: "حماية البيانات وعدم بيعها",
    content: [
      { subtitle: "لا نبيع بياناتك", text: "نلتزم بشكل قاطع بعدم بيع أي بيانات شخصية أو بيانات عملاء لأطراف ثالثة تحت أي ظرف. بياناتك ملكٌ لك." },
      { subtitle: "التشفير والأمان", text: "تُخزَّن جميع البيانات بتشفير كامل. نتبع أفضل ممارسات الأمان لحماية المعلومات الحساسة من الوصول غير المصرح به." },
      { subtitle: "الاحتفاظ بالبيانات", text: "نحتفظ بالبيانات طالما كان حسابك نشطاً. عند إلغاء الاشتراك يمكنك طلب حذف بياناتك بالكامل." },
    ],
  },
  {
    icon: Users,
    title: "الشركاء التقنيون",
    content: [
      { subtitle: "Twilio", text: "نستخدم Twilio كمزوّد لخدمات الرسائل والاتصالات. يتعامل Twilio مع إرسال واستقبال رسائل واتساب واتصالات SMS وفق سياسة خصوصيتهم الخاصة." },
      { subtitle: "Meta WhatsApp Business API", text: "تُرسَل الرسائل عبر Meta WhatsApp Business API الرسمية. يخضع استخدامنا لهذه الخدمة لشروط استخدام Meta وسياسات WhatsApp Business." },
      { subtitle: "Supabase", text: "تُخزَّن بياناتك بأمان على خوادم Supabase بالبنية التحتية لـ AWS مع تشفير كامل للبيانات أثناء النقل والتخزين." },
    ],
  },
  {
    icon: AlertCircle,
    title: "حقوقك",
    content: [
      { subtitle: "الوصول والتعديل", text: "يحق لك في أي وقت طلب الاطلاع على بياناتك أو تصحيحها أو تحديثها عبر التواصل معنا مباشرة." },
      { subtitle: "الحذف", text: "يمكنك طلب حذف جميع بياناتك من أنظمتنا. سنُنجز الطلب خلال 30 يوم عمل وفق الالتزامات القانونية المعمول بها." },
      { subtitle: "الاعتراض", text: "يحق لك الاعتراض على أي معالجة لبياناتك. تواصل معنا وسنتعامل مع طلبك خلال 5 أيام عمل." },
    ],
  },
];

const enSections = [
  {
    icon: Database,
    title: "Data We Collect",
    content: [
      { subtitle: "WhatsApp Numbers", text: "We collect WhatsApp numbers of customers who interact with businesses using our platform. This happens directly when customers register or interact with your business bot." },
      { subtitle: "Business Data", text: "We collect business information such as business name, contact details, bot configurations, conversation logs, and order or booking data associated with your account." },
      { subtitle: "Usage Data", text: "We log activity records, conversation statistics, and automated response performance in order to improve service quality." },
    ],
  },
  {
    icon: MessageSquare,
    title: "How We Use Your Data",
    content: [
      { subtitle: "Sending Commercial Messages", text: "We use collected WhatsApp numbers to send commercial messages on behalf of businesses subscribed to our platform, including booking confirmations, order notifications, and automated replies to customer inquiries." },
      { subtitle: "Operating & Improving the Service", text: "We use data to operate your business bot, analyze performance, and detect and fix issues." },
      { subtitle: "Technical Support", text: "Our support team may access necessary data to resolve technical issues upon your request." },
    ],
  },
  {
    icon: Lock,
    title: "Data Protection & No Selling",
    content: [
      { subtitle: "We Never Sell Your Data", text: "We are strictly committed to never selling any personal data or customer data to third parties under any circumstances. Your data belongs to you." },
      { subtitle: "Encryption & Security", text: "All data is stored with full encryption. We follow industry best practices to protect sensitive information from unauthorized access." },
      { subtitle: "Data Retention", text: "We retain data as long as your account is active. Upon cancellation, you may request complete deletion of your data." },
    ],
  },
  {
    icon: Users,
    title: "Technology Partners",
    content: [
      { subtitle: "Twilio", text: "We use Twilio as our messaging and communications provider. Twilio handles sending and receiving WhatsApp messages and SMS communications under their own privacy policy." },
      { subtitle: "Meta WhatsApp Business API", text: "Messages are sent through the official Meta WhatsApp Business API. Our use of this service is subject to Meta's Terms of Service and WhatsApp Business policies." },
      { subtitle: "Supabase", text: "Your data is securely stored on Supabase servers built on AWS infrastructure with full encryption in transit and at rest." },
    ],
  },
  {
    icon: AlertCircle,
    title: "Your Rights",
    content: [
      { subtitle: "Access & Correction", text: "You may request to view, correct, or update your data at any time by contacting us directly." },
      { subtitle: "Deletion", text: "You may request deletion of all your data from our systems. We will fulfill the request within 30 business days in accordance with applicable legal obligations." },
      { subtitle: "Objection", text: "You have the right to object to any processing of your data. Contact us and we will address your request within 5 business days." },
    ],
  },
];

function SectionBlock({ sections, dir }: { sections: typeof arSections; dir: "rtl" | "ltr" }) {
  const isRtl = dir === "rtl";
  return (
    <div className="space-y-14" dir={dir}>
      {sections.map((section, i) => {
        const Icon = section.icon;
        return (
          <div key={i}>
            <div className={`flex items-center gap-3 mb-6 ${isRtl ? "" : "flex-row"}`}>
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-sm shadow-primary-500/20 shrink-0">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-extrabold text-surface-900 dark:text-white">
                {section.title}
              </h2>
            </div>
            <div className={`space-y-5 ${isRtl ? "pr-2" : "pl-2"}`}>
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
  );
}

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white mb-3">
            سياسة الخصوصية
          </h1>
          <p className="text-base font-semibold text-surface-400 dark:text-surface-500 tracking-wide mb-4">
            Privacy Policy
          </p>
          <p className="text-surface-500 dark:text-surface-400 text-base max-w-xl mx-auto leading-relaxed">
            نحن نأخذ خصوصيتك وخصوصية عملائك على محمل الجد.
          </p>
          <p className="mt-1 text-sm text-surface-400 dark:text-surface-500">
            آخر تحديث: يونيو 2025 — Last updated: June 2025
          </p>
        </div>
      </section>

      {/* ── Arabic Section ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" dir="rtl">
        <div className="container-max mx-auto max-w-3xl">

          <div className="mb-10 p-5 rounded-2xl bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/40 flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <p className="text-sm text-accent-800 dark:text-accent-300 leading-relaxed">
              بتسجيلك في مُسنِد واستخدامك لخدماتنا، فإنك توافق على هذه السياسة. إذا كنت تستخدم المنصة نيابةً عن نشاط تجاري فأنت تؤكد صلاحيتك لقبول هذه الشروط.
            </p>
          </div>

          <SectionBlock sections={arSections} dir="rtl" />

          <div className="mt-16 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-center">
            <h2 className="text-lg font-extrabold text-surface-900 dark:text-white mb-2">تواصل معنا</h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
              إذا كانت لديك أي أسئلة حول سياسة الخصوصية أو بيانات حسابك، تواصل معنا مباشرة.
            </p>
            <a href="mailto:info@musnid.com" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              info@musnid.com
            </a>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="container-max mx-auto max-w-3xl">
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
            <span className="text-xs font-semibold text-surface-400 dark:text-surface-500 tracking-widest uppercase px-2">English Version</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
          </div>
        </div>
      </div>

      {/* ── English Section ── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" dir="ltr">
        <div className="container-max mx-auto max-w-3xl">

          <div className="mb-10 p-5 rounded-2xl bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800/40 flex gap-4">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-accent-100 dark:bg-accent-900/50 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <p className="text-sm text-accent-800 dark:text-accent-300 leading-relaxed">
              By registering with Musnid and using our services, you agree to this policy. If you are using the platform on behalf of a business, you confirm your authority to accept these terms.
            </p>
          </div>

          <SectionBlock sections={enSections} dir="ltr" />

          <div className="mt-16 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-center">
            <h2 className="text-lg font-extrabold text-surface-900 dark:text-white mb-2">Contact Us</h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
              If you have any questions about this Privacy Policy or your account data, contact us directly.
            </p>
            <a href="mailto:info@musnid.com" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
              info@musnid.com
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
