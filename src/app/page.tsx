import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CalendarCheck2,
  Check,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { plans } from "@/lib/demo-data";

const features = [
  {
    icon: MessageCircle,
    title: "WhatsApp كقناة أولى",
    description: "استقبال المحادثات وتصنيفها وتحويلها إلى طلب أو حجز أو تذكرة متابعة.",
  },
  {
    icon: Bot,
    title: "ردود ذكية قابلة للضبط",
    description: "مساعد يتعلم من قاعدة معرفة النشاط ويصعد الحالات الحساسة للموظف.",
  },
  {
    icon: CalendarCheck2,
    title: "حجوزات وطلبات",
    description: "تجهيز البنية للربط مع التقويم، الدفع، ومزودي الرسائل في المراحل القادمة.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageCircle className="size-5" />
            </span>
            مُسنِد
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#features">المزايا</a>
            <a href="#plans">الباقات</a>
            <Link href="/dashboard">لوحة التحكم</Link>
          </nav>
          <Button asChild>
            <Link href="/sign-in">دخول</Link>
          </Button>
        </div>
      </header>

      <section className="overflow-hidden border-b bg-muted/35">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-[1fr_520px] lg:py-20">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
              <Sparkles className="size-4 text-primary" />
              منصة عربية لإدارة محادثات العملاء على WhatsApp
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                مُسنِد يحوّل المحادثات إلى طلبات مفهومة وقابلة للمتابعة.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                لوحة SaaS سعودية لربط WhatsApp بالمساعد الذكي، قاعدة المعرفة،
                الحجوزات، والقياسات التشغيلية التي يحتاجها صاحب النشاط كل يوم.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-in">
                  ابدأ التجربة
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">معاينة لوحة التحكم</Link>
              </Button>
            </div>
          </div>

          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="rounded-md bg-primary p-4 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-85">مساعد WhatsApp</p>
                  <h2 className="mt-1 text-2xl font-bold">نشط الآن</h2>
                </div>
                <ShieldCheck className="size-8" />
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-md bg-white/12 p-3">
                  <p className="text-2xl font-bold">128</p>
                  <p className="text-xs opacity-85">محادثة</p>
                </div>
                <div className="rounded-md bg-white/12 p-3">
                  <p className="text-2xl font-bold">46</p>
                  <p className="text-xs opacity-85">طلب</p>
                </div>
                <div className="rounded-md bg-white/12 p-3">
                  <p className="text-2xl font-bold">22ث</p>
                  <p className="text-xs opacity-85">رد</p>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {["تم تأكيد حجز نورة", "استفسار فهد يحتاج مراجعة", "رد آلي على سياسة الإلغاء"].map(
                (item) => (
                  <div key={item} className="flex items-center gap-3 rounded-md border p-3">
                    <span className="flex size-8 items-center justify-center rounded-md bg-success/10 text-success">
                      <Check className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{item}</span>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-7xl gap-4 px-4 py-14 md:grid-cols-3">
        {features.map((feature) => (
          <article key={feature.title} className="rounded-lg border bg-card p-6">
            <feature.icon className="mb-5 size-7 text-primary" />
            <h2 className="text-xl font-semibold">{feature.title}</h2>
            <p className="mt-3 leading-7 text-muted-foreground">{feature.description}</p>
          </article>
        ))}
      </section>

      <section id="plans" className="border-t bg-muted/35">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold text-primary">الباقات الأولية</p>
            <h2 className="mt-2 text-3xl font-bold">تسعير واضح حسب حجم المحادثات.</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-lg border bg-card p-6">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="mt-3 min-h-14 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
                <div className="mt-5 flex items-end gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="pb-1 text-muted-foreground">ر.س / شهر</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="size-4 text-success" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
