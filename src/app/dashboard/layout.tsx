import Link from "next/link";
import {
  Bot, BookOpenText, CalendarCheck, CalendarDays, LayoutDashboard,
  MessageCircle, MessageSquareText, ReceiptText, Settings, UserCheck,
  UtensilsCrossed, Users, Wrench,
} from "lucide-react";
import { signOut } from "@/app/sign-in/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getCurrentBusiness, getBusinessFeatures } from "@/lib/dashboard-data";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [business, features] = await Promise.all([
    getCurrentBusiness(),
    getBusinessFeatures(),
  ]);

  const hasBot         = features.has("whatsapp_bot");
  const hasSales       = features.has("sales") || features.has("invoices");
  const hasStaff       = features.has("staff");
  const hasServices    = features.has("whatsapp_bot") || features.has("marketplace") || features.has("bookings");
  const hasMarketplace = features.has("marketplace");
  const hasCustomers   = hasBot || hasSales || hasMarketplace;

  const coreNav = [
    { href: "/dashboard",               label: "الرئيسية",  icon: LayoutDashboard,    show: true },
    { href: "/dashboard/conversations", label: "المحادثات", icon: MessageSquareText,   show: hasBot },
    { href: "/dashboard/customers",     label: "العملاء",   icon: Users,              show: hasCustomers },
    { href: "/dashboard/appointments",  label: "المواعيد",  icon: CalendarCheck,      show: hasBot },
    { href: "/dashboard/calendar",      label: "التقويم",   icon: CalendarDays,       show: hasBot },
    { href: "/dashboard/sales",         label: "المبيعات",  icon: ReceiptText,        show: hasSales },
  ];

  const typeExtras =
    business?.type === "restaurant" || business?.type === "cafe"
      ? [{ href: "/dashboard/menu",     label: "المنيو",    icon: UtensilsCrossed,    show: true }]
      : business?.type === "clinic" || business?.type === "salon"
        ? [
            { href: "/dashboard/staff",    label: "الفريق",    icon: UserCheck,        show: hasStaff },
            { href: "/dashboard/services", label: "الخدمات",   icon: Wrench,           show: hasServices },
          ]
        : [];

  const tailNav = [
    { href: "/dashboard/knowledge",  label: "المعرفة",  icon: BookOpenText, show: hasBot },
    { href: "/dashboard/automations",label: "الأتمتة",  icon: Bot,          show: hasBot },
    { href: "/dashboard/settings",   label: "الإعداد",  icon: Settings,     show: true },
  ];

  const navItems = [...coreNav, ...typeExtras, ...tailNav].filter((item) => item.show);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="sticky top-0 z-40 border-b shadow-sm transition-colors
        bg-white border-surface-200
        dark:bg-surface-900 dark:border-surface-800 dark:shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-surface-900 dark:text-white">مُسند</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-surface-800 dark:text-white">
                {business?.name ?? "وضع العرض التجريبي"}
              </p>
              <p className="text-xs text-surface-500 dark:text-surface-400">
                {business ? "متصل ببيانات Supabase" : "اربط Supabase لإنشاء بيانات حقيقية"}
              </p>
            </div>
            <ThemeToggle />
            <form action={signOut}>
              <SubmitButton pendingText="جاري الخروج..." className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                border-surface-300 text-surface-600 hover:bg-surface-100 hover:text-surface-900
                dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-white">
                خروج
              </SubmitButton>
            </form>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                text-surface-500 hover:text-surface-900 hover:bg-surface-100
                dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
