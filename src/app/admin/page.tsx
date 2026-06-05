import Link from "next/link";
import { Users, Building2, Package, UserCheck } from "lucide-react";
import { getAdminStats } from "@/lib/admin-data";

export default async function AdminPage() {
  const stats = await getAdminStats();

  const cards = [
    {
      label: "إجمالي المستخدمين",
      value: stats.totalUsers,
      icon: Users,
      color: "text-violet-600 bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400",
      href: "/admin/members",
    },
    {
      label: "حسابات الأعمال",
      value: stats.totalBusinesses,
      icon: Building2,
      color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
      href: "/admin/members?role=business",
    },
    {
      label: "المستخدمون الأفراد",
      value: stats.totalCustomers,
      icon: UserCheck,
      color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
      href: "/admin/members?role=customer",
    },
    {
      label: "الباقات النشطة",
      value: stats.totalPlans,
      icon: Package,
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
      href: "/admin/packages",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">نظرة عامة</h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">إحصائيات المنصة الكاملة</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md
              dark:bg-surface-900 dark:border-surface-800"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-surface-500 dark:text-surface-400">{card.label}</p>
                <p className="mt-2 text-4xl font-bold text-surface-900 dark:text-white">
                  {card.value.toLocaleString("ar-SA")}
                </p>
              </div>
              <div className={`rounded-xl p-3 ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <QuickLink href="/admin/members" label="إدارة الأعضاء" desc="عرض وتحرير بيانات الأعضاء وتغيير أدوارهم" />
        <QuickLink href="/admin/packages" label="إدارة الباقات" desc="إنشاء وتعديل باقات الاشتراك ومميزاتها" />
        <QuickLink href="/admin/features" label="إدارة الخصائص" desc="تعريف مفاتيح الخصائص وإسنادها للباقات" />
        <QuickLink href="/admin/zone" label="إدارة زون" desc="أضف وعدّل أقسام زون والأنشطة المعروضة للعملاء" />
        <QuickLink href="/admin/banners" label="البنرات الإعلانية" desc="أضف وعدّل البنرات المتحركة في واجهة زون" />
      </div>
    </div>
  );
}

function QuickLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md
        dark:bg-surface-900 dark:border-surface-800"
    >
      <h3 className="font-semibold text-surface-900 dark:text-white">{label}</h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{desc}</p>
    </Link>
  );
}
