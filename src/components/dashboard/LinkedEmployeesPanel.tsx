"use client";

import { useState, useTransition, useEffect } from "react";
import {
  Shield, Trash2, UserPlus, ChevronLeft,
  Briefcase, CreditCard, X, AlertCircle,
} from "lucide-react";
import {
  searchProfileByEmail,
  linkEmployee,
  updateEmployeePermissions,
  removeEmployee,
  getEmployeeSessions,
  getEmployeeAuditLog,
  getEmployeeInvoices,
} from "@/app/dashboard/staff/actions";
import { ACTION_LABEL } from "@/app/dashboard/staff/employee-constants";
import type { BusinessEmployee, EmployeePermissions, EmployeeSession, EmployeeAuditLog } from "@/types/database";

type EmployeeInvoice = {
  id: string;
  invoice_number: string;
  total_amount: number;
  vat_amount: number;
  issued_at: string;
  status: string;
  payment_method: string;
  buyer_name: string | null;
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "مسودة", issued: "صادرة", reported: "مبلّغة",
  cleared: "معتمدة", rejected: "مرفوضة", cancelled: "ملغاة",
};
const PAYMENT_LABEL: Record<string, string> = {
  cash: "نقدي", card: "شبكة", bank_transfer: "تحويل", other: "أخرى",
};

// ── types ──────────────────────────────────────────────────────────────────────

type LinkedEmployee = BusinessEmployee & {
  profile: { full_name: string | null; email: string; phone: string | null } | null;
  permissions: EmployeePermissions | null;
};

type PermKey = "can_sales" | "can_invoice" | "can_manage_products" | "can_product_settings" | "can_read" | "can_update" | "can_delete";

const AREA_PERMS: { key: PermKey; label: string; desc: string }[] = [
  { key: "can_sales",           label: "مبيعات",         desc: "يدخل المنتجات، يضيف للسلة، يصدر فاتورة" },
  { key: "can_invoice",         label: "الفواتير",        desc: "يعرض قائمة الفواتير ويصدر فاتورة مباشرة" },
  { key: "can_manage_products", label: "إدارة المنتجات",  desc: "يضيف منتجاً جديداً في كاشير المنتجات" },
  { key: "can_product_settings", label: "إعداد المنتج",   desc: "يفتح إعدادات عرض كروت المنتجات" },
];

const ACTION_PERMS: { key: PermKey; label: string; desc: string }[] = [
  { key: "can_read",   label: "قراءة",  desc: "يعرض البيانات ضمن مجالاته" },
  { key: "can_update", label: "تعديل",  desc: "يعدّل بيانات ضمن مجالاته" },
  { key: "can_delete", label: "حذف",    desc: "يحذف بيانات ضمن مجالاته" },
];

const PERM_LABELS = [...AREA_PERMS, ...ACTION_PERMS];

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("ar-SA", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function fmtDuration(inAt: string, outAt: string | null) {
  if (!outAt) return "نشط";
  const ms = new Date(outAt).getTime() - new Date(inAt).getTime();
  const h  = Math.floor(ms / 3_600_000);
  const m  = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}س ${m}د` : `${m} دقيقة`;
}

// ── Add Employee Dialog ───────────────────────────────────────────────────────

function AddEmployeeDialog({ onClose }: { onClose: () => void }) {
  type Step = "search" | "type" | "staff_details" | "cashier_details";
  const [step, setStep]   = useState<Step>("search");
  const [email, setEmail] = useState("");
  const [found, setFound] = useState<{ id: string; full_name: string | null; email: string } | null>(null);
  const [, setRoleType] = useState<"staff" | "cashier" | null>(null);
  const [perms, setPerms] = useState({ can_sales: false, can_invoice: false, can_manage_products: false, can_product_settings: false, can_read: true, can_update: false, can_delete: false });
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    setError("");
    startTransition(async () => {
      const result = await searchProfileByEmail(email);
      if (!result) { setError("لم يُعثر على حساب بهذا الإيميل في مسنِد"); return; }
      setFound(result);
      setStep("type");
    });
  };

  const handleLink = (formData: FormData) => {
    setError("");
    startTransition(async () => {
      const result = await linkEmployee(formData);
      if (result?.error === "already_linked") { setError("هذا الموظف مرتبط بالمنشأة مسبقاً"); return; }
      if (result?.error) { setError(result.error); return; }
      onClose();
    });
  };

  const stepTitle = step === "search" ? "إضافة موظف" : step === "type" ? "نوع الموظف" : step === "staff_details" ? "بيانات الطاقم" : "صلاحيات الكاشير";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-md bg-white dark:bg-surface-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          {step !== "search" ? (
            <button onClick={() => setStep(step === "type" ? "search" : "type")} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
              <ChevronLeft className="w-4 h-4 rotate-180" />
            </button>
          ) : <div className="w-7" />}
          <h2 className="font-bold text-surface-900 dark:text-white">{stepTitle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/40 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* STEP 1: بحث */}
          {step === "search" && (
            <>
              <p className="text-sm text-surface-500 dark:text-surface-400">أدخل إيميل الموظف المسجّل في تطبيق مسنِد</p>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                type="email"
                placeholder="email@example.com"
                className="w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
              />
              <button
                onClick={handleSearch}
                disabled={isPending || !email.trim()}
                className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "جاري البحث..." : "بحث"}
              </button>
            </>
          )}

          {/* STEP 2: اختيار النوع */}
          {step === "type" && found && (
            <>
              <div className="rounded-xl border border-teal-200 dark:border-teal-800/50 bg-teal-50 dark:bg-teal-900/20 px-4 py-3 text-right">
                <p className="font-bold text-surface-900 dark:text-white text-sm">{found.full_name ?? "بدون اسم"}</p>
                <p className="text-xs text-surface-500 mt-0.5">{found.email}</p>
              </div>
              <p className="text-sm text-surface-500 dark:text-surface-400">اختر نوع الموظف</p>
              <button
                onClick={() => { setRoleType("staff"); setStep("staff_details"); }}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-primary-200 dark:border-primary-800/50 hover:border-primary-400 dark:hover:border-primary-600 transition-colors text-right"
              >
                <ChevronLeft className="w-4 h-4 text-surface-400" />
                <div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-bold text-surface-900 dark:text-white">طاقم عمل</span>
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">يظهر في البوت وزون — اسم، مسمى، تخصص</p>
                </div>
              </button>
              <button
                onClick={() => { setRoleType("cashier"); setStep("cashier_details"); }}
                className="w-full flex items-center justify-between p-4 rounded-xl border-2 border-teal-200 dark:border-teal-800/50 hover:border-teal-400 dark:hover:border-teal-600 transition-colors text-right"
              >
                <ChevronLeft className="w-4 h-4 text-surface-400" />
                <div>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="font-bold text-surface-900 dark:text-white">كاشير</span>
                    <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    </div>
                  </div>
                  <p className="text-xs text-surface-500 mt-0.5">يصدر فواتير — تحدد صلاحياته</p>
                </div>
              </button>
            </>
          )}

          {/* STEP 3a: بيانات طاقم عمل */}
          {step === "staff_details" && found && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                fd.set("profile_id", found.id);
                fd.set("role_type", "staff");
                handleLink(fd);
              }}
              className="space-y-3"
            >
              {[
                { name: "name",      label: "الاسم الكامل *",   placeholder: "د. أحمد الشمري", required: true },
                { name: "title",     label: "المسمى الوظيفي",  placeholder: "طبيب أسنان" },
                { name: "specialty", label: "التخصص",           placeholder: "تقويم الأسنان" },
                { name: "bio",       label: "نبذة تعريفية",     placeholder: "خبرة 10 سنوات..." },
              ].map((f) => (
                <div key={f.name} className="space-y-1">
                  <label className="text-xs font-medium text-surface-600 dark:text-surface-400">{f.label}</label>
                  <input
                    name={f.name}
                    required={f.required}
                    placeholder={f.placeholder}
                    defaultValue={f.name === "name" ? (found.full_name ?? "") : ""}
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 outline-none focus:ring-2 focus:ring-primary-500/30 text-sm"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {isPending ? "جاري الإضافة..." : "إضافة طاقم عمل"}
              </button>
            </form>
          )}

          {/* STEP 3b: صلاحيات كاشير */}
          {step === "cashier_details" && found && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData();
                fd.set("profile_id", found.id);
                fd.set("role_type", "cashier");
                PERM_LABELS.forEach((p) => fd.set(p.key, String(perms[p.key])));
                handleLink(fd);
              }}
              className="space-y-3"
            >
              <p className="text-xs font-bold text-surface-500 dark:text-surface-400 text-right">المجالات</p>
              {AREA_PERMS.map((p) => (
                <label key={p.key} className="flex items-start justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 gap-3">
                  <input type="checkbox" checked={perms[p.key]} onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))} className="w-4 h-4 rounded accent-teal-500 mt-0.5 shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{p.label}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{p.desc}</p>
                  </div>
                </label>
              ))}
              <p className="text-xs font-bold text-surface-500 dark:text-surface-400 text-right pt-1">الإجراءات</p>
              {ACTION_PERMS.map((p) => (
                <label key={p.key} className="flex items-start justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 gap-3">
                  <input type="checkbox" checked={perms[p.key]} onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))} className="w-4 h-4 rounded accent-teal-500 mt-0.5 shrink-0" />
                  <div className="text-right flex-1">
                    <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{p.label}</p>
                    <p className="text-xs text-surface-400 mt-0.5">{p.desc}</p>
                  </div>
                </label>
              ))}
              <button type="submit" disabled={isPending} className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors">
                {isPending ? "جاري الإضافة..." : "إضافة كاشير"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Permissions Dialog ────────────────────────────────────────────────────────

function PermissionsDialog({ emp, onClose }: { emp: LinkedEmployee; onClose: () => void }) {
  const [perms, setPerms] = useState({
    can_sales:           emp.permissions?.can_sales           ?? false,
    can_invoice:         emp.permissions?.can_invoice         ?? false,
    can_manage_products: emp.permissions?.can_manage_products ?? false,
    can_product_settings: emp.permissions?.can_product_settings ?? false,
    can_read:            emp.permissions?.can_read            ?? true,
    can_update:          emp.permissions?.can_update          ?? false,
    can_delete:          emp.permissions?.can_delete          ?? false,
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSave = () => {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("employee_id", emp.id);
      PERM_LABELS.forEach((p) => fd.set(p.key, String(perms[p.key])));
      const result = await updateEmployeePermissions(fd);
      if (result?.error) { setError(result.error); return; }
      onClose();
    });
  };

  const name = emp.profile?.full_name ?? emp.profile?.email ?? "موظف";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white dark:bg-surface-900 rounded-t-2xl sm:rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} dir="rtl">
        <div className="flex items-center justify-between p-5 border-b border-surface-200 dark:border-surface-700">
          <div className="w-7" />
          <div className="text-center">
            <h2 className="font-bold text-surface-900 dark:text-white">صلاحيات الكاشير</h2>
            <p className="text-xs text-surface-500 mt-0.5">{name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="text-xs font-bold text-surface-500 dark:text-surface-400 text-right">المجالات</p>
          {AREA_PERMS.map((p) => (
            <label key={p.key} className="flex items-start justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 gap-3">
              <input type="checkbox" checked={perms[p.key]} onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))} className="w-4 h-4 rounded accent-teal-500 mt-0.5 shrink-0" />
              <div className="text-right flex-1">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{p.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{p.desc}</p>
              </div>
            </label>
          ))}
          <p className="text-xs font-bold text-surface-500 dark:text-surface-400 text-right pt-1">الإجراءات</p>
          {ACTION_PERMS.map((p) => (
            <label key={p.key} className="flex items-start justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/50 gap-3">
              <input type="checkbox" checked={perms[p.key]} onChange={(e) => setPerms((prev) => ({ ...prev, [p.key]: e.target.checked }))} className="w-4 h-4 rounded accent-teal-500 mt-0.5 shrink-0" />
              <div className="text-right flex-1">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200">{p.label}</p>
                <p className="text-xs text-surface-400 mt-0.5">{p.desc}</p>
              </div>
            </label>
          ))}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="w-full py-3 rounded-xl bg-teal-600 text-white font-bold text-sm hover:bg-teal-700 disabled:opacity-50 transition-colors mt-2"
          >
            {isPending ? "جاري الحفظ..." : "حفظ الصلاحيات"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Employee Detail Dialog (3 tabs) ──────────────────────────────────────────

function EmployeeDetailDialog({ emp, onClose }: { emp: LinkedEmployee; onClose: () => void }) {
  const [tab, setTab] = useState<"sessions" | "invoices" | "log">("sessions");
  const [sessions,  setSessions]  = useState<EmployeeSession[]    | null>(null);
  const [invoices,  setInvoices]  = useState<EmployeeInvoice[]    | null>(null);
  const [logs,      setLogs]      = useState<EmployeeAuditLog[]   | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const data = await getEmployeeSessions(emp.id);
      setSessions(data as EmployeeSession[]);
    });
  }, [emp.id]);

  const loadInvoices = () => {
    if (invoices !== null) return;
    startTransition(async () => {
      const data = await getEmployeeInvoices(emp.profile_id);
      setInvoices(data as EmployeeInvoice[]);
    });
  };

  const loadLogs = () => {
    if (logs !== null) return;
    startTransition(async () => {
      const data = await getEmployeeAuditLog(emp.id);
      setLogs(data as EmployeeAuditLog[]);
    });
  };

  const name    = emp.profile?.full_name ?? emp.profile?.email ?? "موظف";
  const email   = emp.profile?.email ?? "";
  const avatar  = (emp.profile?.full_name ?? email).charAt(0).toUpperCase();
  const isCashier = emp.role_type === "cashier";

  const TABS = [
    { key: "sessions" as const,  label: "الدخول والخروج" },
    { key: "invoices" as const,  label: "الفواتير" },
    { key: "log"      as const,  label: "التعديلات" },
  ];

  const handleTabClick = (t: "sessions" | "invoices" | "log") => {
    setTab(t);
    if (t === "invoices") loadInvoices();
    if (t === "log")      loadLogs();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-surface-900 rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-surface-200 dark:border-surface-700 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500">
              <X className="w-4 h-4" />
            </button>
            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isCashier ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                              : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                  }`}>
                    {isCashier ? "كاشير" : "طاقم عمل"}
                  </span>
                  <p className="font-bold text-surface-900 dark:text-white">{name}</p>
                </div>
                <p className="text-xs text-surface-400 mt-0.5">{email}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                isCashier ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                          : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
              }`}>
                {avatar}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => handleTabClick(t.key)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  tab === t.key
                    ? "bg-white dark:bg-surface-700 text-surface-900 dark:text-white shadow-sm"
                    : "text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-4 space-y-2.5">
          {isPending && (
            <p className="text-sm text-surface-400 text-center py-8">جاري التحميل...</p>
          )}

          {/* ── جلسات الدخول والخروج ── */}
          {tab === "sessions" && !isPending && (sessions ?? []).length === 0 && (
            <p className="text-sm text-surface-400 text-center py-8">لا توجد جلسات بعد</p>
          )}
          {tab === "sessions" && (sessions ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                s.clocked_out_at
                  ? "bg-surface-100 dark:bg-surface-800 text-surface-500"
                  : "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
              }`}>
                {fmtDuration(s.clocked_in_at, s.clocked_out_at)}
              </span>
              <div className="text-right">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  دخول: {fmtDate(s.clocked_in_at)}
                </p>
                {s.clocked_out_at && (
                  <p className="text-xs text-surface-400 mt-0.5">خروج: {fmtDate(s.clocked_out_at)}</p>
                )}
              </div>
            </div>
          ))}

          {/* ── الفواتير ── */}
          {tab === "invoices" && !isPending && (invoices ?? []).length === 0 && (
            <p className="text-sm text-surface-400 text-center py-8">لم يُصدر هذا الموظف أي فاتورة بعد</p>
          )}
          {tab === "invoices" && (invoices ?? []).map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-surface-900 dark:text-white">
                  {Number(inv.total_amount).toFixed(2)}
                  <span className="text-xs font-normal text-surface-400 mr-1">ر.س</span>
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  inv.status === "issued"   ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" :
                  inv.status === "reported" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                  inv.status === "cancelled"? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" :
                  "bg-surface-100 dark:bg-surface-800 text-surface-500"
                }`}>
                  {INVOICE_STATUS_LABEL[inv.status] ?? inv.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">{inv.invoice_number}</p>
                <p className="text-xs text-surface-400 mt-0.5">
                  {fmtDate(inv.issued_at)}
                  {inv.buyer_name ? ` · ${inv.buyer_name}` : ""}
                  {" · "}{PAYMENT_LABEL[inv.payment_method] ?? inv.payment_method}
                </p>
              </div>
            </div>
          ))}

          {/* ── التعديلات ── */}
          {tab === "log" && !isPending && (logs ?? []).length === 0 && (
            <p className="text-sm text-surface-400 text-center py-8">لا توجد إجراءات بعد</p>
          )}
          {tab === "log" && !isPending && (logs ?? []).filter((l) =>
            !["clock_in", "clock_out", "invoice_created"].includes(l.action_type)
          ).length === 0 && (
            <p className="text-sm text-surface-400 text-center py-8">لا توجد تعديلات بعد</p>
          )}
          {tab === "log" && (logs ?? [])
            .filter((l) => !["clock_in", "clock_out", "invoice_created"].includes(l.action_type))
            .map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl border border-surface-200 dark:border-surface-700">
                <span className="text-xs text-surface-400 shrink-0">{fmtDate(l.created_at)}</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">
                    {ACTION_LABEL[l.action_type] ?? l.action_type}
                  </p>
                  {l.description && <p className="text-xs text-surface-400 mt-0.5">{l.description}</p>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}


// ── Employee Card ─────────────────────────────────────────────────────────────

function EmployeeCard({
  emp,
  onOpenDetail,
  onOpenPerms,
}: {
  emp: LinkedEmployee;
  onOpenDetail: () => void;
  onOpenPerms: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  const isCashier = emp.role_type === "cashier";
  const name      = emp.profile?.full_name ?? "بدون اسم";
  const email     = emp.profile?.email ?? "";
  const avatar    = (emp.profile?.full_name ?? email).charAt(0).toUpperCase();

  const handleRemove = () => {
    if (!confirm(`هل تريد إزالة ${name}؟`)) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("employee_id", emp.id);
      await removeEmployee(fd);
    });
  };

  return (
    <div
      className="flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800/40 transition-colors"
      onClick={onOpenDetail}
    >
      {/* أزرار الإجراءات */}
      <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleRemove}
          disabled={isPending}
          title="إزالة"
          className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        {isCashier && (
          <button
            onClick={onOpenPerms}
            title="الصلاحيات"
            className="p-1.5 rounded-lg text-surface-400 hover:text-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
          >
            <Shield className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* المعلومات */}
      <div className="flex items-center gap-3 flex-1 justify-end">
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isCashier
                ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300"
                : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
            }`}>
              {isCashier ? "كاشير" : "طاقم عمل"}
            </span>
            <p className="font-bold text-surface-900 dark:text-white text-sm">{name}</p>
          </div>
          <p className="text-xs text-surface-400 mt-0.5">{email}</p>
        </div>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
          isCashier ? "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
        }`}>
          {avatar}
        </div>
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export function LinkedEmployeesPanel({ employees }: { employees: LinkedEmployee[] }) {
  const [showAdd,    setShowAdd]    = useState(false);
  const [detailEmp,  setDetailEmp]  = useState<LinkedEmployee | null>(null);
  const [permsEmp,   setPermsEmp]   = useState<LinkedEmployee | null>(null);

  return (
    <>
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-surface-200/50 dark:border-surface-700/30">
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300 text-sm font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            إضافة موظف
          </button>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">الموظفون</h2>
        </div>

        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center mb-3">
              <Briefcase className="w-6 h-6 text-surface-400" />
            </div>
            <p className="font-semibold text-surface-900 dark:text-white text-sm">لا يوجد موظفون بعد</p>
            <p className="text-xs text-surface-400 mt-1">اضغط "إضافة موظف" وأدخل إيميل الموظف في مسنِد</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-200/30 dark:divide-surface-700/20">
            {employees.map((emp) => (
              <EmployeeCard
                key={emp.id}
                emp={emp}
                onOpenDetail={() => setDetailEmp(emp)}
                onOpenPerms={() => setPermsEmp(emp)}
              />
            ))}
          </div>
        )}
      </div>

      {/* الـ dialogs خارج glass-card لتجنب stacking context */}
      {showAdd   && <AddEmployeeDialog    onClose={() => setShowAdd(false)} />}
      {detailEmp && <EmployeeDetailDialog emp={detailEmp} onClose={() => setDetailEmp(null)} />}
      {permsEmp  && <PermissionsDialog    emp={permsEmp}  onClose={() => setPermsEmp(null)} />}
    </>
  );
}
