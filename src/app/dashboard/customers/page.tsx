import { Users } from "lucide-react";
import { getCustomers } from "@/lib/dashboard-data";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-surface-500 dark:text-surface-400">إدارة العملاء</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">سجل العملاء والمحادثات</h1>
      </section>

      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">العملاء</h2>
          <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-200/50 dark:border-surface-700/30 bg-surface-50/50 dark:bg-surface-800/30">
                <th className="text-right px-6 py-3 font-semibold text-surface-600 dark:text-surface-400">الاسم</th>
                <th className="text-right px-6 py-3 font-semibold text-surface-600 dark:text-surface-400">رقم الجوال</th>
                <th className="text-right px-6 py-3 font-semibold text-surface-600 dark:text-surface-400">الوسوم</th>
                <th className="text-right px-6 py-3 font-semibold text-surface-600 dark:text-surface-400">آخر ظهور</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-surface-200/30 dark:border-surface-700/20 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-surface-900 dark:text-white">{customer.name}</td>
                  <td className="px-6 py-4 text-surface-600 dark:text-surface-400" dir="ltr">{customer.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {customer.tags.map((tag) => (
                        <span key={tag} className="rounded-lg bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-surface-500 dark:text-surface-400">
                    {customer.last_seen_at ? "اليوم" : "غير متاح"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
