import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { OnboardingForm } from "./onboarding-form";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness } from "@/lib/dashboard-data";

type OnboardingPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in?next=/onboarding");
    }

    const business = await getCurrentBusiness();
    if (business) {
      redirect("/dashboard");
    }
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-surface-50 px-4 py-8 dark:bg-surface-950">
      <div className="mx-auto grid max-w-6xl gap-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-bg shadow-md">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-surface-900 dark:text-white">مسند</span>
          </Link>
          <span className="rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200">
            إعداد النشاط
          </span>
        </header>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
          <div className="space-y-5 pt-2">
            <p className="text-sm font-medium text-primary-600 dark:text-primary-300">مرحلة الإعداد الأولى</p>
            <h1 className="text-3xl font-extrabold leading-tight text-surface-900 dark:text-white md:text-5xl">
              جهز نشاطك ليستقبل العملاء عبر WhatsApp.
            </h1>
            <p className="max-w-xl text-base leading-8 text-surface-500 dark:text-surface-400">
              أكمل البيانات الأساسية، ساعات العمل، وإعدادات المساعد. بعد الحفظ ستنتقل مباشرة إلى لوحة التحكم.
            </p>
            <div className="grid gap-3 text-sm text-surface-600 dark:text-surface-300">
              {["يرتبط النشاط بحسابك الحالي", "يتم حفظ ساعات العمل في working_hours", "تنتقل إعدادات المساعد إلى bot_settings"].map((item) => (
                <div key={item} className="rounded-xl border border-surface-200 bg-white/70 px-4 py-3 dark:border-surface-800 dark:bg-surface-900/60">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <OnboardingForm error={params.error ? decodeURIComponent(params.error) : undefined} />
        </section>
      </div>
    </main>
  );
}
