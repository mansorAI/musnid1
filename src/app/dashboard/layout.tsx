import Link from "next/link";
import {
  Bot, BookOpenText, CalendarDays, CheckSquare, LayoutDashboard, MessageCircle,
  MessageSquareText, ReceiptText, Settings, UserCheck, UtensilsCrossed, Users, Wrench,
} from "lucide-react";
import { signOut } from "@/app/sign-in/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getCurrentBusiness } from "@/lib/dashboard-data";

const coreNavItems = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/conversations", label: "المحادثات", icon: MessageSquareText },
  { href: "/dashboard/customers", label: "العملاء", icon: Users },
  { href: "/dashboard/calendar", label: "التقويم", icon: CalendarDays },
  { href: "/dashboard/sales", label: "المبيعات", icon: ReceiptText },
  { href: "/dashboard/tasks", label: "المهام", icon: CheckSquare },
  { href: "/dashboard/knowledge", label: "المعرفة", icon: BookOpenText },
  { href: "/dashboard/automations", label: "الأتمتة", icon: Bot },
  { href: "/dashboard/settings", label: "الإعداد", icon: Settings },
];

const menuNavItem = { href: "/dashboard/menu", label: "المنيو", icon: UtensilsCrossed };
const staffNavItems = [
  { href: "/dashboard/staff", label: "الفريق", icon: UserCheck },
  { href: "/dashboard/services", label: "الخدمات", icon: Wrench },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const business = await getCurrentBusiness();

  const extraNav =
    business?.type === "restaurant" || business?.type === "cafe"
      ? [menuNavItem]
      : business?.type === "clinic" || business?.type === "salon"
        ? staffNavItems
        : [];

  const navItems = [...coreNavItems.slice(0, 5), ...extraNav, ...coreNavItems.slice(5)];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="sticky top-0 z-40 bg-surface-900 dark:bg-surface-950 border-b border-surface-800 shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-md">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">مسند</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-white">
                {business?.name ?? "وضع العرض التجريبي"}
              </p>
              <p className="text-xs text-surface-400">
                {business ? "متصل ببيانات Supabase" : "اربط Supabase لإنشاء بيانات حقيقية"}
              </p>
            </div>
            <form action={signOut}>
              <SubmitButton pendingText="جاري الخروج..." className="px-4 py-2 rounded-xl text-sm font-medium border border-surface-700 text-surface-300 hover:bg-surface-800 hover:text-white transition-colors">
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
              className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800 transition-all duration-200"
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
