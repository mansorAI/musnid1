import { CalendarCheck, Clock, Phone, User } from "lucide-react";
import { getUpcomingAppointments } from "@/lib/dashboard-data";

const STATUS_AR: Record<string, string> = {
  pending:   "بانتظار التأكيد",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغى",
  no_show:   "لم يحضر",
};

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  confirmed: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  completed: "bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  no_show:   "bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-500",
};

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    weekday: "short", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function groupByDate(appointments: Awaited<ReturnType<typeof getUpcomingAppointments>>) {
  const today    = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

  const groups: { title: string; items: typeof appointments }[] = [
    { title: "اليوم", items: [] },
    { title: "غداً", items: [] },
    { title: "هذا الأسبوع", items: [] },
    { title: "لاحقاً", items: [] },
  ];

  for (const appt of appointments) {
    const d = new Date(appt.scheduled_at); d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime())    groups[0].items.push(appt);
    else if (d.getTime() === tomorrow.getTime()) groups[1].items.push(appt);
    else if (d < nextWeek)                  groups[2].items.push(appt);
    else                                    groups[3].items.push(appt);
  }

  return groups.filter((g) => g.items.length > 0);
}

export default async function AppointmentsPage() {
  const appointments = await getUpcomingAppointments();
  const groups = groupByDate(appointments);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-md">
          <CalendarCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">المواعيد</h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">المواعيد القادمة</p>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-6xl mb-4">📅</div>
          <p className="text-lg font-semibold text-surface-700 dark:text-surface-300">لا توجد مواعيد قادمة</p>
          <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">ستظهر المواعيد المحجوزة هنا</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-3 px-1">
                {group.title}
              </h2>
              <div className="space-y-3">
                {group.items.map((appt) => {
                  const customer = Array.isArray(appt.customers) ? appt.customers[0] : appt.customers;
                  const staff    = Array.isArray(appt.staff_members) ? appt.staff_members[0] : appt.staff_members;
                  const name     = appt.customer_name ?? customer?.name ?? "عميل";
                  const phone    = appt.customer_phone ?? customer?.phone ?? null;
                  const statusClass = STATUS_COLOR[appt.status] ?? STATUS_COLOR.completed;

                  return (
                    <div key={appt.id} className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-2xl p-5 flex flex-wrap gap-4 items-start justify-between shadow-sm">
                      <div className="space-y-1.5 text-right flex-1 min-w-0">
                        <div className="flex items-center gap-2 justify-end">
                          <p className="font-semibold text-surface-900 dark:text-white text-base">{name}</p>
                          <User className="w-4 h-4 text-surface-400 shrink-0" />
                        </div>
                        {phone && (
                          <div className="flex items-center gap-2 justify-end">
                            <p className="text-sm text-surface-500 dark:text-surface-400">{phone}</p>
                            <Phone className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                          </div>
                        )}
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-sm text-primary-600 dark:text-primary-400">{formatDateTime(appt.scheduled_at)}</p>
                          <Clock className="w-3.5 h-3.5 text-primary-500 shrink-0" />
                        </div>
                        {staff?.name && (
                          <p className="text-xs text-surface-400 dark:text-surface-500">
                            {staff.name} • {appt.duration_minutes} دقيقة
                          </p>
                        )}
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${statusClass}`}>
                        {STATUS_AR[appt.status] ?? appt.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
