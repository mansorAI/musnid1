import { UserCheck, UserX } from "lucide-react";
import { getStaffData } from "@/lib/dashboard-data";
import { SubmitButton } from "@/components/ui/submit-button";
import { addStaffMember, toggleStaffActive, getLinkedEmployees } from "./actions";
import { LinkedEmployeesPanel } from "@/components/dashboard/LinkedEmployeesPanel";

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

type StaffPageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function StaffPage({ searchParams }: StaffPageProps) {
  const params  = await searchParams;
  const { staff: rawStaff, businessId } = await getStaffData();
  const linked  = await getLinkedEmployees();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm text-surface-500 dark:text-surface-400">الفريق</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">فريق العمل</h1>
      </section>

      {/* ── الموظفون المرتبطون بالتطبيق ── */}
      <LinkedEmployeesPanel employees={linked as any} />

      {/* ── دليل فريق العمل (staff_members) ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="glass-card overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">دليل الفريق</h2>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">يظهر في البوت وزون</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {rawStaff.length === 0 ? (
            <div className="p-8 text-center text-sm text-surface-400">
              لا يوجد أعضاء في الدليل بعد — أضف "طاقم عمل" من القسم أعلاه
            </div>
          ) : (
            <div className="divide-y divide-surface-200/30 dark:divide-surface-700/20">
              {rawStaff.map((member) => (
                <div key={member.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="font-bold text-surface-900 dark:text-white">{member.name}</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {member.title && (
                        <span className="rounded-lg bg-primary-100 dark:bg-primary-900/30 px-2 py-0.5 text-xs text-primary-700 dark:text-primary-300">
                          {member.title}
                        </span>
                      )}
                      {member.specialty && (
                        <span className="rounded-lg bg-surface-100 dark:bg-surface-800 px-2 py-0.5 text-xs text-surface-500">
                          {member.specialty}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`rounded-lg px-2 py-1 text-xs font-medium ${
                      member.is_active
                        ? "bg-accent-100 dark:bg-accent-900/30 text-accent-600 dark:text-accent-400"
                        : "bg-surface-100 dark:bg-surface-800 text-surface-500"
                    }`}>
                      {member.is_active ? "نشط" : "موقوف"}
                    </span>
                    {businessId && (
                      <form action={toggleStaffActive}>
                        <input type="hidden" name="id"        value={member.id} />
                        <input type="hidden" name="is_active" value={String(member.is_active)} />
                        <button
                          type="submit"
                          title={member.is_active ? "إيقاف" : "تفعيل"}
                          className="p-2 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-colors"
                        >
                          {member.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* إضافة يدوية للدليل فقط */}
        <div className="glass-card overflow-hidden">
          <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة للدليل</h2>
            <p className="text-xs text-surface-500 mt-1">للظهور في البوت فقط بدون حساب تطبيق</p>
          </div>
          <div className="p-6">
            {params?.error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                تعذر الإضافة. تأكد من إدخال الاسم.
              </div>
            )}
            {businessId ? (
              <form action={addStaffMember} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">الاسم *</label>
                  <input name="name"      className={inputClass} placeholder="د. محمد العتيبي" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">المسمى الوظيفي</label>
                  <input name="title"     className={inputClass} placeholder="طبيب أسنان" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-surface-700 dark:text-surface-300">التخصص</label>
                  <input name="specialty" className={inputClass} placeholder="تقويم الأسنان" />
                </div>
                <SubmitButton pendingText="جاري الإضافة..." className="btn-primary w-full">
                  إضافة للدليل
                </SubmitButton>
              </form>
            ) : (
              <div className="rounded-xl border border-primary-200/50 dark:border-primary-800/30 bg-primary-50/50 dark:bg-primary-900/10 p-4 text-sm text-primary-700 dark:text-primary-300 leading-7">
                سجّل دخولك وأنشئ نشاطاً لإضافة أعضاء فريق حقيقيين.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
