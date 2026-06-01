import Link from "next/link";
import {
  AlertCircle, Banknote, FileText, Files, MessageSquareText, ReceiptText,
  Settings2, ShoppingBag, Users,
} from "lucide-react";
import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness, getDashboardStats, getSalesOverviewData } from "@/lib/dashboard-data";

type DashboardPageProps = {
  searchParams?: Promise<{ created_business?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const business = await getCurrentBusiness();
  if (hasSupabaseEnv() && !business) redirect("/onboarding");

  const params = await searchParams;
  const [liveStats, salesData] = await Promise.all([
    getDashboardStats(),
    getSalesOverviewData(),
  ]);

  /* ── WhatsApp stat cards ── */
  const waCards = liveStats
    ? [
        { label: "المحادثات النشطة",  value: String(liveStats.activeConversations),    color: "#7a5af8", Icon: MessageSquareText },
        { label: "تحتاج مراجعة",      value: String(liveStats.escalatedConversations),  color: "#f59e0b", Icon: AlertCircle },
        { label: "إجمالي العملاء",    value: String(liveStats.totalCustomers),           color: "#14b8a6", Icon: Users },
        { label: "إجمالي المحادثات",  value: String(liveStats.totalConversations),       color: "#0ea5e9", Icon: MessageSquareText },
      ]
    : null;

  /* ── Sales today ── */
  const today       = new Date().toISOString().split("T")[0];
  const todayInvs   = (salesData.invoices as { issued_at: string; total_amount: number | string; vat_amount: number | string }[])
    .filter((i) => i.issued_at.startsWith(today));
  const todayTotal = todayInvs.reduce((s, i) => s + Number(i.total_amount), 0);

  const salesCards = [
    { label: "مبيعات اليوم",    value: `${todayTotal.toFixed(0)} ر.س`, color: "#14b8a6", Icon: Banknote,    isButton: false, href: "" },
    { label: "الكاشير",         value: "فتح الكاشير",                   color: "#7a5af8", Icon: ShoppingBag, isButton: true,  href: "/dashboard/sales/products" },
    { label: "فواتير اليوم",    value: String(todayInvs.length),        color: "#f59e0b", Icon: ReceiptText,  isButton: false, href: "" },
    { label: "إجمالي الفواتير", value: String(salesData.invoiceCount),  color: "#0ea5e9", Icon: Files,        isButton: false, href: "" },
  ];

  /* ── Quick actions ── */
  const quickActions = [
    { label: "إصدار فاتورة",       sub: "فاتورة QR وضريبة ZATCA",  Icon: ReceiptText,       href: "/dashboard/sales/products", color: "#7a5af8" },
    { label: "قائمة الفواتير",     sub: "عرض الفواتير المحفوظة",    Icon: FileText,          href: "/dashboard/sales",          color: "#14b8a6" },
    { label: "استعراض المحادثات", sub: "عرض جميع محادثات العملاء",   Icon: MessageSquareText, href: "/dashboard/conversations",  color: "#7a5af8" },
    { label: "إعدادات الفوترة",   sub: "الضريبة وبيانات البائع",     Icon: Settings2,         href: "/dashboard/sales/settings", color: "#f59e0b" },
  ];

  return (
    <div className="grid gap-8">
      {params?.created_business ? (
        <div className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm font-medium text-accent-700 dark:border-accent-800/50 dark:bg-accent-900/20 dark:text-accent-300">
          تم إنشاء النشاط بنجاح. يمكنك الآن إدارة بياناتك وربط WhatsApp من الإعدادات.
        </div>
      ) : null}

      {/* ── Welcome hero ── */}
      <section className="relative overflow-hidden rounded-2xl px-6 py-5 border transition-colors
        bg-surface-100 border-surface-200
        dark:bg-[#13131e] dark:border-white/[0.07]">
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-primary-500 opacity-[0.08]" />
        <div className="pointer-events-none absolute -bottom-16 -left-5 h-40 w-40 rounded-full opacity-[0.05]" style={{ background: "#14b8a6" }} />
        <div className="relative flex items-center justify-between">
          <span className="text-sm text-surface-500 dark:text-surface-400">
            {business?.name ? `${business.name} · المبيعات والفوترة` : "مسند"}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-green-600 dark:text-green-400">مباشر</span>
          </span>
        </div>
        <h1 className="relative mt-3 text-right text-2xl font-extrabold text-surface-900 dark:text-white">
          مرحباً {business?.name ?? "بك"}
        </h1>
        <p className="relative mt-2 text-right text-sm text-surface-500 dark:text-surface-400">
          ملخص الفواتير والمبيعات اليوم
        </p>
      </section>

      {/* ── WhatsApp stats ── */}
      {waCards ? (
        <section>
          <p className="mb-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
            واتساب ذكي
          </p>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {waCards.map((card) => (
              <div
                key={card.label}
                className="rounded-2xl p-4 border transition-colors bg-white dark:bg-[#16161f] border-surface-200 dark:border-white/[0.07]"
                style={{ borderTop: `2px solid ${card.color}` }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] text-surface-400 dark:text-surface-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    مباشر
                  </span>
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: card.color + "26" }}
                  >
                    <card.Icon className="size-[18px]" style={{ color: card.color }} />
                  </div>
                </div>
                <p className="text-right text-3xl font-extrabold text-surface-900 dark:text-white">{card.value}</p>
                <p className="mt-1.5 text-right text-xs text-surface-500 dark:text-surface-400">{card.label}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ── Sales stats ── */}
      {!salesData.schemaMissing ? (
        <section>
          <p className="mb-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
            الإحصائيات
          </p>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            {salesCards.map((card) =>
              card.isButton ? (
                /* ── Cashier card ── */
                <Link
                  key={card.label}
                  href={card.href}
                  className="block rounded-2xl p-4 border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl
                    bg-white border-surface-200
                    dark:bg-[#16161f] dark:border-white/[0.07]"
                  style={{
                    borderTop: `2px solid ${card.color}`,
                    boxShadow: `0 4px 12px ${card.color}22`,
                  }}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-[10px] font-semibold" style={{ color: card.color }}>
                      افتح ←
                    </span>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: card.color + "26" }}
                    >
                      <card.Icon className="size-[18px]" style={{ color: card.color }} />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <span
                      className="rounded-xl px-3 py-2 text-sm font-black"
                      style={{
                        background: card.color + "33",
                        color: card.color,
                        border: `1px solid ${card.color}66`,
                      }}
                    >
                      فتح الكاشير
                    </span>
                  </div>
                  <p className="mt-3 text-right text-xs text-surface-500 dark:text-surface-400">{card.label}</p>
                </Link>
              ) : (
                /* ── Regular stat card ── */
                <div
                  key={card.label}
                  className="rounded-2xl p-4 border transition-colors bg-white dark:bg-[#16161f] border-surface-200 dark:border-white/[0.07]"
                  style={{
                    borderTop: `2px solid ${card.color}`,
                    boxShadow: `0 4px 12px ${card.color}22`,
                  }}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[10px] text-surface-400 dark:text-surface-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      مباشر
                    </span>
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: card.color + "26" }}
                    >
                      <card.Icon className="size-[18px]" style={{ color: card.color }} />
                    </div>
                  </div>
                  <p className="text-right text-3xl font-extrabold text-surface-900 dark:text-white">{card.value}</p>
                  <p className="mt-1.5 text-right text-xs text-surface-500 dark:text-surface-400">{card.label}</p>
                </div>
              ),
            )}
          </div>
        </section>
      ) : null}

      {/* ── Quick actions ── */}
      <section>
        <p className="mb-3 text-right text-xs font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">
          إجراءات سريعة
        </p>
        <div className="space-y-2.5">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center rounded-2xl px-4 py-3.5 border transition-colors
                bg-white border-surface-200 hover:bg-surface-50
                dark:bg-[#13131e] dark:border-white/[0.07] dark:hover:bg-[#16161f]"
            >
              {/* Chevron far left */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 shrink-0 text-surface-400 dark:text-surface-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              {/* Text + icon far right */}
              <div className="flex flex-1 items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{action.label}</p>
                  <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">{action.sub}</p>
                </div>
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ background: action.color + "26" }}
                >
                  <action.Icon className="size-5" style={{ color: action.color }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
