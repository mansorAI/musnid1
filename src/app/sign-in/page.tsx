import Link from "next/link";
import { MessageSquare, Sparkles } from "lucide-react";
import { signInWithEmail, signUpWithEmail } from "./actions";
import { SubmitButton } from "@/components/ui/submit-button";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    detail?: string;
    message?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  missing: "أدخل البريد الإلكتروني وكلمة المرور.",
  invalid: "بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور.",
  password: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
  signup: "تعذر إنشاء الحساب. تأكد من صحة بيانات Supabase في Vercel وأن مشروع Supabase نشط.",
  signup_disabled: "إنشاء الحسابات غير مفعّل في Supabase Auth. فعّله من Dashboard → Authentication → Providers.",
  email_auth: "تعذر إرسال بريد التأكيد. تحقق من إعداد Email Provider في Supabase Auth.",
  redirect_url: "رابط إعادة التوجيه غير مسموح به. أضف https://musnid1.vercel.app/** في Supabase → Auth → URL Configuration.",
  account_exists: "هذا البريد مسجل مسبقًا. سجل الدخول بدل إنشاء حساب جديد.",
};

const infoMessages: Record<string, string> = {
  "check-email": "تم إرسال رابط التأكيد إلى بريدك إذا كان تأكيد البريد مفعلا.",
  "account_created": "تم إنشاء حسابك بنجاح! سجّل دخولك الآن.",
};

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;
  const detail = params.detail ? decodeURIComponent(params.detail) : null;
  const message = params.message ? infoMessages[params.message] : null;

  return (
    <main className="min-h-screen gradient-bg-subtle relative overflow-hidden flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent-400/10 rounded-full blur-3xl animate-float delay-300" />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-[1fr_460px] gap-12 items-center">

        <section className="hidden lg:block space-y-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-surface-900 dark:text-white">مسند</span>
          </Link>

          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700/40 text-primary-700 dark:text-primary-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              دخول لوحة التحكم
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-surface-900 dark:text-white">
              أدِر محادثات<br />
              <span className="gradient-text">واتساب</span> باحترافية.
            </h1>
            <p className="text-lg leading-8 text-surface-500 dark:text-surface-400 max-w-md">
              سجل الدخول أو أنشئ حسابًا جديدًا لبدء إعداد نشاطك وإدارة محادثاتك مع العملاء.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { value: "+2,000", label: "عميل نشط" },
              { value: "60%", label: "توفير في الوقت" },
              { value: "24/7", label: "توفر مستمر" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card px-5 py-4 text-center">
                <div className="text-2xl font-extrabold gradient-text">{stat.value}</div>
                <div className="text-xs text-surface-500 dark:text-surface-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card p-7 shadow-2xl">
          <div className="flex items-center gap-3 mb-7 lg:hidden">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-surface-900 dark:text-white">مسند</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-surface-900 dark:text-white">الدخول إلى مسند</h2>
            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
              استخدم حسابك أو أنشئ حسابًا جديدًا.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/40 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              {error}
              {detail && detail !== "unknown" && (
                <p className="mt-2 text-xs font-mono opacity-80" dir="ltr">{detail}</p>
              )}
            </div>
          )}
          {message && (
            <div className="mb-5 rounded-xl border border-accent-200 bg-accent-50 dark:bg-accent-900/20 dark:border-accent-800/40 px-4 py-3 text-sm text-accent-700 dark:text-accent-300">
              {message}
            </div>
          )}

          <form action={signInWithEmail} className="space-y-4">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">البريد الإلكتروني</label>
              <input id="email" name="email" type="email" placeholder="owner@example.com" className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">كلمة المرور</label>
              <input id="password" name="password" type="password" placeholder="••••••••" className={inputClass} />
            </div>
            <SubmitButton pendingText="جاري تسجيل الدخول..." className="btn-primary w-full mt-2">
              دخول
            </SubmitButton>
          </form>

          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
            <span className="text-xs text-surface-400">أو</span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          </div>

          <form action={signUpWithEmail} className="space-y-4">
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">إنشاء حساب جديد — البريد الإلكتروني</label>
              <input id="signup-email" name="email" type="email" placeholder="owner@example.com" className={inputClass} />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">كلمة المرور</label>
              <input id="signup-password" name="password" type="password" placeholder="6 أحرف على الأقل" className={inputClass} />
            </div>
            <SubmitButton pendingText="جاري إنشاء الحساب..." className="btn-secondary w-full mt-2">
              إنشاء حساب
            </SubmitButton>
          </form>
        </section>
      </div>
    </main>
  );
}
