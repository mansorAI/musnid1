import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard, Users, Package, Settings, Shield, LogOut, Layers, Image,
} from "lucide-react";
import { signOut } from "@/app/sign-in/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminUser } from "@/lib/admin-data";
import { ThemeToggle } from "@/components/theme-toggle";

const adminNav = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { href: "/admin/members", label: "الأعضاء", icon: Users },
  { href: "/admin/packages", label: "الباقات", icon: Package },
  { href: "/admin/features", label: "الخصائص", icon: Settings },
  { href: "/admin/zone", label: "زون", icon: Layers },
  { href: "/admin/banners", label: "البنرات", icon: Image },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getAdminUser();
  if (!user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      <header className="sticky top-0 z-40 border-b shadow-sm transition-colors
        bg-white border-surface-200
        dark:bg-surface-900 dark:border-surface-800 dark:shadow-lg">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center shadow-md">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-surface-900 dark:text-white">مُسند</span>
              <span className="mr-2 text-xs font-semibold text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 px-2 py-0.5 rounded-full">
                أدمن
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white transition-colors"
            >
              ← لوحة الأعمال
            </Link>
            <ThemeToggle />
            <form action={signOut}>
              <SubmitButton
                pendingText="جاري الخروج..."
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors
                  border-surface-300 text-surface-600 hover:bg-surface-100 hover:text-surface-900
                  dark:border-surface-700 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-white"
              >
                خروج
              </SubmitButton>
            </form>
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-3">
          {adminNav.map((item) => (
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
