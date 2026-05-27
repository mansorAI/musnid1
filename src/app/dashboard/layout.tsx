import Link from "next/link";
import { Bot, BookOpenText, LayoutDashboard, MessageCircle, Settings, Users } from "lucide-react";
import { signOut } from "@/app/sign-in/actions";
import { Button } from "@/components/ui/button";
import { getCurrentOrganization } from "@/lib/dashboard-data";

const navItems = [
  { href: "/dashboard", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "العملاء", icon: Users },
  { href: "/dashboard/knowledge", label: "المعرفة", icon: BookOpenText },
  { href: "/dashboard/automations", label: "الأتمتة", icon: Bot },
  { href: "/dashboard/settings", label: "الإعداد", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const organization = await getCurrentOrganization();

  return (
    <main className="min-h-screen bg-muted/35">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MessageCircle className="size-5" />
            </span>
            مُسنِد
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">
                {organization?.name ?? "وضع العرض التجريبي"}
              </p>
              <p className="text-xs text-muted-foreground">
                {organization ? "متصل ببيانات Supabase" : "اربط Supabase لإنشاء بيانات حقيقية"}
              </p>
            </div>
            <form action={signOut}>
              <Button variant="outline" type="submit">
                خروج
              </Button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost" className="shrink-0">
              <Link href={item.href}>
                <item.icon className="size-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
    </main>
  );
}
