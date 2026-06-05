import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { FileText, UserCheck, Ban, Cpu, AlertTriangle, Scale } from "lucide-react";

export const metadata = {
  title: "شروط الاستخدام | Terms of Service — مُسنِد",
  description: "شروط استخدام منصة مُسنِد — Musnid Terms of Service.",
};

const arSections = [
  {
    icon: UserCheck,
    title: "قبول الشروط وإنشاء الحساب",
    content: [
      { subtitle: "قبول الشروط", text: "باستخدامك لمنصة مُسنِد أو تسجيلك فيها، فإنك توافق على هذه الشروط والأحكام بشكل كامل. إذا كنت تستخدم المنصة نيابةً عن نشاط تجاري، فأنت تؤكد امتلاكك الصلاحية القانونية لقبول هذه الشروط باسم ذلك النشاط." },
      { subtitle: "أهلية الاستخدام", text: "يجب أن يكون عمرك 18 سنة أو أكثر لاستخدام المنصة. استخدام المنصة لأغراض تجارية يستلزم أن تكون النشاط التجاري مسجلاً رسمياً وفق الأنظمة المعمول بها." },
      { subtitle: "دقة المعلومات", text: "أنت مسؤول عن صحة المعلومات التي تقدمها عند التسجيل وتشغيل البوت، بما في ذلك بيانات النشاط التجاري وإعدادات الردود التلقائية." },
    ],
  },
  {
    icon: Cpu,
    title: "وصف الخدمة واستخدامها",
    content: [
      { subtitle: "ما تقدمه مُسنِد", text: "تُوفر مُسنِد منصة لإنشاء وإدارة بوتات واتساب الذكية للأعمال، تشمل: الردود التلقائية بالذكاء الاصطناعي، إدارة المواعيد والطلبات، قاعدة المعرفة، وربط واجهة برمجة واتساب عبر Meta وTwilio." },
      { subtitle: "حدود الخدمة", text: "الخدمة مقدمة 'كما هي'. نسعى لضمان الاستمرارية لكن لا نضمن توفر الخدمة بنسبة 100% في جميع الأوقات. قد تحدث انقطاعات مجدولة أو طارئة." },
      { subtitle: "التغييرات في الخدمة", text: "نحتفظ بالحق في تعديل أو إيقاف أي ميزة في الخدمة مع إشعار مسبق قدر الإمكان. التغييرات الجوهرية يُبلَّغ عنها عبر البريد الإلكتروني المسجل." },
    ],
  },
  {
    icon: Ban,
    title: "الاستخدام المقبول والمحظور",
    content: [
      { subtitle: "الاستخدام المقبول", text: "يُستخدم النظام حصراً للتواصل التجاري المشروع مع العملاء كتأكيدات الحجز، الردود على الاستفسارات، إشعارات الطلبات، والخدمات المرتبطة بنشاطك التجاري الرسمي." },
      { subtitle: "الاستخدام المحظور", text: "يُحظر استخدام المنصة لإرسال رسائل ترويجية غير مرغوب فيها (SPAM)، أو لأغراض احتيالية، أو لمضايقة العملاء، أو لنشر محتوى مخالف للأنظمة السعودية أو سياسات Meta/WhatsApp." },
      { subtitle: "المسؤولية عن المحتوى", text: "أنت المسؤول الكامل عن المحتوى الذي ترسله عبر البوت وعن إعدادات الردود التلقائية. مُسنِد غير مسؤولة عن أي محتوى مرسل بواسطة بوتات عملائها." },
    ],
  },
  {
    icon: FileText,
    title: "الملكية الفكرية والبيانات",
    content: [
      { subtitle: "ملكية المنصة", text: "مُسنِد تمتلك جميع حقوق الملكية الفكرية المتعلقة بالمنصة نفسها، بما في ذلك الكود البرمجي، التصاميم، الخوارزميات، وأي تحسينات مستقبلية." },
      { subtitle: "ملكية بياناتك", text: "بياناتك التجارية، بيانات عملائك، وإعدادات البوت تبقى ملكاً لك. أنت تمنحنا ترخيصاً محدوداً لمعالجة هذه البيانات بهدف تقديم الخدمة فقط." },
      { subtitle: "تحسين الخدمة", text: "قد نستخدم بيانات مجمّعة ومجهولة الهوية لتحسين جودة خدمتنا دون الكشف عن أي معلومات خاصة بك أو بعملائك." },
    ],
  },
  {
    icon: AlertTriangle,
    title: "إخلاء المسؤولية وحدود الضمان",
    content: [
      { subtitle: "إخلاء المسؤولية", text: "لا تتحمل مُسنِد المسؤولية عن أي خسائر مباشرة أو غير مباشرة ناتجة عن استخدام المنصة أو الاعتماد على ردود البوت في قرارات تجارية. أنت تستخدم المنصة على مسؤوليتك الخاصة." },
      { subtitle: "ردود الذكاء الاصطناعي", text: "ردود البوت مولَّدة بواسطة نموذج ذكاء اصطناعي وقد لا تكون دائماً دقيقة أو مناسبة. راجع إعدادات البوت بانتظام وأضف قاعدة معرفة واضحة لتحسين جودة الردود." },
      { subtitle: "خدمات الأطراف الثالثة", text: "لا نتحمل مسؤولية أي انقطاع أو تغيير في خدمات Twilio أو Meta WhatsApp API أو Supabase أو أي مزود خارجي آخر قد يؤثر على عمل منصتنا." },
    ],
  },
  {
    icon: Scale,
    title: "الإنهاء والقانون المطبق",
    content: [
      { subtitle: "إنهاء الحساب", text: "يمكنك إنهاء حسابك في أي وقت. في حالة مخالفة هذه الشروط، نحتفظ بالحق في تعليق أو إلغاء حسابك فوراً مع أو بدون إشعار مسبق." },
      { subtitle: "القانون المطبق", text: "تخضع هذه الشروط لأنظمة المملكة العربية السعودية. أي نزاع ينشأ عن استخدام المنصة يُحسم وفق الأنظمة والتشريعات السعودية النافذة." },
      { subtitle: "تعديل الشروط", text: "نحتفظ بحق تعديل هذه الشروط. سنُبلغك بأي تغييرات جوهرية عبر البريد الإلكتروني. استمرارك في استخدام المنصة بعد الإشعار يُعدّ قبولاً للشروط الجديدة." },
    ],
  },
];

const enSections = [
  {
    icon: UserCheck,
    title: "Acceptance of Terms & Account Creation",
    content: [
      { subtitle: "Acceptance", text: "By using or registering on the Musnid platform, you agree to these Terms of Service in full. If you are using the platform on behalf of a business, you confirm you have the legal authority to accept these terms on its behalf." },
      { subtitle: "Eligibility", text: "You must be at least 18 years old to use the platform. Using the platform for commercial purposes requires that your business be officially registered in accordance with applicable regulations." },
      { subtitle: "Accuracy of Information", text: "You are responsible for the accuracy of information you provide during registration and bot operation, including business data and automated response settings." },
    ],
  },
  {
    icon: Cpu,
    title: "Service Description & Use",
    content: [
      { subtitle: "What Musnid Provides", text: "Musnid provides a platform for creating and managing AI-powered WhatsApp bots for businesses, including: AI automated responses, appointment and order management, knowledge bases, and WhatsApp API integration via Meta and Twilio." },
      { subtitle: "Service Limitations", text: "The service is provided 'as is'. We strive for continuity but do not guarantee 100% uptime at all times. Scheduled or emergency interruptions may occur." },
      { subtitle: "Changes to the Service", text: "We reserve the right to modify or discontinue any feature of the service with as much prior notice as possible. Material changes will be communicated via your registered email." },
    ],
  },
  {
    icon: Ban,
    title: "Acceptable & Prohibited Use",
    content: [
      { subtitle: "Acceptable Use", text: "The platform is to be used exclusively for legitimate commercial communications with customers, such as booking confirmations, inquiry responses, order notifications, and services related to your officially registered business." },
      { subtitle: "Prohibited Use", text: "You may not use the platform to send unsolicited promotional messages (spam), for fraudulent purposes, to harass customers, or to distribute content that violates Saudi regulations or Meta/WhatsApp policies." },
      { subtitle: "Responsibility for Content", text: "You are fully responsible for all content sent through the bot and all automated response settings. Musnid is not responsible for any content sent by its clients' bots." },
    ],
  },
  {
    icon: FileText,
    title: "Intellectual Property & Data",
    content: [
      { subtitle: "Platform Ownership", text: "Musnid owns all intellectual property rights related to the platform itself, including its source code, designs, algorithms, and any future improvements." },
      { subtitle: "Ownership of Your Data", text: "Your business data, customer data, and bot settings remain your property. You grant us a limited license to process this data solely for the purpose of providing the service." },
      { subtitle: "Service Improvement", text: "We may use aggregated, anonymized data to improve service quality without disclosing any information specific to you or your customers." },
    ],
  },
  {
    icon: AlertTriangle,
    title: "Disclaimer & Limitation of Liability",
    content: [
      { subtitle: "Disclaimer", text: "Musnid is not liable for any direct or indirect losses resulting from the use of the platform or reliance on bot responses for business decisions. You use the platform at your own risk." },
      { subtitle: "AI-Generated Responses", text: "Bot responses are generated by an AI model and may not always be accurate or appropriate. Review bot settings regularly and provide a clear knowledge base to improve response quality." },
      { subtitle: "Third-Party Services", text: "We are not responsible for any interruption or change in Twilio, Meta WhatsApp API, Supabase, or any other third-party provider services that may affect the operation of our platform." },
    ],
  },
  {
    icon: Scale,
    title: "Termination & Governing Law",
    content: [
      { subtitle: "Account Termination", text: "You may terminate your account at any time. In case of violation of these terms, we reserve the right to suspend or cancel your account immediately with or without prior notice." },
      { subtitle: "Governing Law", text: "These terms are governed by the laws of the Kingdom of Saudi Arabia. Any dispute arising from the use of the platform shall be resolved in accordance with applicable Saudi laws and regulations." },
      { subtitle: "Modification of Terms", text: "We reserve the right to modify these terms. We will notify you of any material changes via email. Your continued use of the platform after notification constitutes acceptance of the new terms." },
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50/60 to-white dark:from-surface-900 dark:to-surface-950">
        <div className="container-max mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg shadow-lg shadow-primary-500/25 mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-surface-900 dark:text-white mb-3">
            شروط الاستخدام
          </h1>
          <p className="text-base font-semibold text-surface-400 dark:text-surface-500 tracking-wide mb-4">
            Terms of Service
          </p>
          <p className="text-surface-500 dark:text-surface-400 text-base max-w-xl mx-auto leading-relaxed">
            يرجى قراءة هذه الشروط بعناية قبل استخدام منصة مُسنِد.
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
              <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <p className="text-sm text-accent-800 dark:text-accent-300 leading-relaxed">
              باستخدامك لمنصة مُسنِد فإنك توافق على هذه الشروط. هذه الشروط تُنظّم العلاقة بينك وبين مُسنِد وتحدد حقوق كل طرف والتزاماته.
            </p>
          </div>

          <SectionBlock sections={arSections} dir="rtl" />

          <div className="mt-16 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-center">
            <h2 className="text-lg font-extrabold text-surface-900 dark:text-white mb-2">تواصل معنا</h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
              لأي استفسار حول شروط الاستخدام تواصل معنا مباشرة.
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
              <FileText className="w-5 h-5 text-accent-600 dark:text-accent-400" />
            </div>
            <p className="text-sm text-accent-800 dark:text-accent-300 leading-relaxed">
              By using the Musnid platform, you agree to these Terms. These terms govern the relationship between you and Musnid and define the rights and obligations of each party.
            </p>
          </div>

          <SectionBlock sections={enSections} dir="ltr" />

          <div className="mt-16 p-6 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/40 text-center">
            <h2 className="text-lg font-extrabold text-surface-900 dark:text-white mb-2">Contact Us</h2>
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-4 leading-relaxed">
              For any inquiries about these Terms of Service, contact us directly.
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
