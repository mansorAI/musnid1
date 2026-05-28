import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail, signUpWithEmail } from "./actions";

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

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;
  const detail = params.detail ? decodeURIComponent(params.detail) : null;
  const message = params.message ? infoMessages[params.message] : null;

  return (
    <main className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_420px]">
        <section className="space-y-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageCircle className="size-5" />
            </span>
            مُسنِد
          </Link>
          <div className="max-w-2xl space-y-5">
            <p className="text-sm font-semibold text-primary">دخول لوحة التحكم</p>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              تابع محادثات WhatsApp والطلبات من مكان واحد.
            </h1>
            <p className="text-lg leading-8 text-muted-foreground">
              سجل الدخول أو أنشئ حسابا جديدا لبدء إعداد نشاطك وربطه ببيانات Supabase الحقيقية.
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold">الدخول إلى مُسنِد</h2>
            <p className="text-sm text-muted-foreground">
              استخدم حسابك أو أنشئ حسابا جديدا ثم أكمل بيانات النشاط.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
              {detail && detail !== "unknown" ? (
                <p className="mt-2 text-xs font-mono opacity-80" dir="ltr">{detail}</p>
              ) : null}
            </div>
          ) : null}
          {message ? (
            <div className="mb-4 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
              {message}
            </div>
          ) : null}

          <form action={signInWithEmail} className="space-y-5">
            <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input id="email" name="email" type="email" placeholder="owner@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input id="password" name="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">
              دخول
            </Button>
          </form>

          <div className="my-6 h-px bg-border" />

          <form action={signUpWithEmail} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="signup-email">إنشاء حساب جديد</Label>
              <Input id="signup-email" name="email" type="email" placeholder="owner@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">كلمة المرور</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                placeholder="6 أحرف على الأقل"
              />
            </div>
            <Button type="submit" variant="outline" className="w-full">
              إنشاء حساب
            </Button>
          </form>
        </section>
      </div>
    </main>
  );
}
