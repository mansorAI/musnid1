import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithEmail } from "./actions";

type SignInPageProps = {
  searchParams: Promise<{
    error?: string;
    next?: string;
  }>;
};

const errorMessages: Record<string, string> = {
  missing: "أدخل البريد الإلكتروني وكلمة المرور.",
  invalid: "تعذر تسجيل الدخول. تحقق من البيانات أو إعدادات Supabase.",
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const error = params.error ? errorMessages[params.error] : null;

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
              بعد ربط Supabase ومزود WhatsApp ستعمل هذه الصفحة كبوابة دخول حقيقية
              لأصحاب الأنشطة وفِرق خدمة العملاء.
            </p>
          </div>
        </section>

        <section className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold">تسجيل الدخول</h2>
            <p className="text-sm text-muted-foreground">
              استخدم حساب Supabase Auth الخاص بك.
            </p>
          </div>

          {error ? (
            <div className="mb-4 rounded-md border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
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
        </section>
      </div>
    </main>
  );
}
