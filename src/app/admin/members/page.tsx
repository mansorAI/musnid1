import { getAllMembers, getAllBusinesses, getAllCategories } from "@/lib/admin-data";
import { updateMemberRole, updateBusinessCategory, toggleBusinessZoneVisibility } from "@/app/admin/actions";
import { SubmitButton } from "@/components/ui/submit-button";

const ROLE_LABELS: Record<string, string> = {
  admin: "أدمن",
  business: "منشأة",
  customer: "فرد",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400",
  business: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  customer: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string; tab?: string }>;
}) {
  const { role: roleFilter, tab = "individuals" } = await searchParams;
  const [members, businesses, categories] = await Promise.all([
    getAllMembers(),
    getAllBusinesses(),
    getAllCategories(),
  ]);

  const filteredMembers = roleFilter
    ? members.filter((m) => m.role === roleFilter)
    : members;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">الأعضاء</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {filteredMembers.length} عضو
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-200 dark:border-surface-800">
        {[
          { key: "individuals", label: "الأفراد والأعمال" },
          { key: "businesses", label: "تفاصيل المنشآت" },
        ].map((t) => (
          <a
            key={t.key}
            href={`/admin/members?tab=${t.key}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-violet-600 text-violet-600 dark:text-violet-400"
                : "border-transparent text-surface-500 hover:text-surface-900 dark:hover:text-white"
            }`}
          >
            {t.label}
          </a>
        ))}
      </div>

      {tab === "individuals" && (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800">
          {/* Filter buttons */}
          <div className="flex gap-2 p-4 border-b border-surface-100 dark:border-surface-800">
            {["", "business", "customer", "admin"].map((r) => (
              <a
                key={r}
                href={r ? `/admin/members?role=${r}` : "/admin/members"}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  roleFilter === r || (!roleFilter && r === "")
                    ? "bg-violet-600 text-white"
                    : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-300"
                }`}
              >
                {r ? ROLE_LABELS[r] : "الكل"}
              </a>
            ))}
          </div>

          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الاسم</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الإيميل</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">الدور</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">تاريخ التسجيل</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">تغيير الدور</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">
                    {member.full_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-surface-600 dark:text-surface-400 font-mono text-xs">
                    {member.email}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member.role]}`}>
                      {ROLE_LABELS[member.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-surface-500 dark:text-surface-400 text-xs">
                    {new Date(member.created_at).toLocaleDateString("ar-SA")}
                  </td>
                  <td className="px-4 py-3">
                    <form action={updateMemberRole} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={member.id} />
                      <select
                        name="role"
                        defaultValue={member.role}
                        className="text-xs rounded-lg border px-2 py-1 bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                      >
                        <option value="customer">فرد</option>
                        <option value="business">منشأة</option>
                        <option value="admin">أدمن</option>
                      </select>
                      <SubmitButton
                        pendingText="..."
                        className="text-xs px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                      >
                        حفظ
                      </SubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMembers.length === 0 && (
            <div className="py-12 text-center text-surface-500 dark:text-surface-400">
              لا يوجد أعضاء
            </div>
          )}
        </div>
      )}

      {tab === "businesses" && (
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <table className="w-full text-sm">
            <thead className="bg-surface-50 dark:bg-surface-800/50">
              <tr>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">المنشأة</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">المالك</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">المدينة</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">النشاط الحالي</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">تغيير النشاط</th>
                <th className="text-right px-4 py-3 text-surface-500 dark:text-surface-400 font-medium">ظهور في الزون</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {businesses.map((biz: any) => {
                const currentMapping = biz.business_category_mapping?.[0];
                const currentCategoryId = currentMapping?.category_id ?? "";
                const currentCategoryName = currentMapping?.store_categories?.name ?? "—";
                const isPublic = currentMapping?.is_public ?? false;
                return (
                  <tr key={biz.id} className="hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-surface-900 dark:text-white">
                      <div>{biz.name}</div>
                      <div className="text-xs text-surface-400">{biz.type}</div>
                    </td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-400 text-xs">
                      <div>{biz.owner?.full_name ?? "—"}</div>
                      <div className="font-mono">{biz.owner?.email}</div>
                    </td>
                    <td className="px-4 py-3 text-surface-600 dark:text-surface-400">{biz.city ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                        {currentCategoryName}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <form action={updateBusinessCategory} className="flex items-center gap-2">
                        <input type="hidden" name="businessId" value={biz.id} />
                        <select
                          name="categoryId"
                          defaultValue={currentCategoryId}
                          className="text-xs rounded-lg border px-2 py-1 bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                        >
                          <option value="">— بدون نشاط —</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <SubmitButton
                          pendingText="..."
                          className="text-xs px-3 py-1 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
                        >
                          حفظ
                        </SubmitButton>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      {currentMapping ? (
                        <form action={toggleBusinessZoneVisibility}>
                          <input type="hidden" name="businessId" value={biz.id} />
                          <input type="hidden" name="isPublic" value={isPublic ? "false" : "true"} />
                          <SubmitButton
                            pendingText="..."
                            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                              isPublic
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-surface-100 text-surface-500 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400"
                            }`}
                          >
                            {isPublic ? "✓ ظاهر" : "مخفي"}
                          </SubmitButton>
                        </form>
                      ) : (
                        <span className="text-xs text-surface-400">لا يوجد نشاط</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {businesses.length === 0 && (
            <div className="py-12 text-center text-surface-500 dark:text-surface-400">
              لا توجد منشآت
            </div>
          )}
        </div>
      )}
    </div>
  );
}
