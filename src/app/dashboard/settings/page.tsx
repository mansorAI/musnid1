import Link from "next/link";
import {
  Building2, Check, Compass, Eye, EyeOff, Plus, Settings, Users,
} from "lucide-react";
import {
  createBusiness, setMarketplaceVisibility, setStaffZoneVisibility,
  switchBusiness, updateBusinessInfo,
} from "@/app/dashboard/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import { ThemeSelector } from "@/components/theme-selector";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { businessTypeLabels } from "@/lib/demo-data";
import {
  getCurrentBusiness, getAllBusinesses, getMarketplaceVisibility,
  getBusinessFeatures, getZoneMappingData,
} from "@/lib/dashboard-data";
import type { BusinessType } from "@/types";
import { WhatsAppConnectWidget } from "@/components/dashboard/WhatsAppConnectWidget";

type BotSettings = Record<string, unknown>;

const businessTypes = Object.entries(businessTypeLabels) as [BusinessType, string][];

const inputClass =
  "w-full px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder:text-surface-400 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 outline-none transition-all text-sm";

const PERSONALITY_OPTIONS = [
  { value: "ودود ومهني ومختصر", label: "ودود ومهني" },
  { value: "رسمي ومحترف",       label: "رسمي ومحترف" },
  { value: "حماسي وإيجابي",     label: "حماسي وإيجابي" },
  { value: "هادئ ومتأني",       label: "هادئ ومتأني" },
  { value: "مرح وخفيف الظل",    label: "مرح وخفيف الظل" },
  { value: "موجز ومباشر",       label: "موجز ومباشر" },
];

const DIALECT_OPTIONS = [
  { value: "خليجي", label: "خليجي" },
  { value: "مصري",  label: "مصري" },
  { value: "شامي",  label: "شامي" },
  { value: "مغربي", label: "مغربي" },
  { value: "فصحى",  label: "فصحى" },
];

type SettingsPageProps = {
  searchParams?: Promise<{ tab?: string; error?: string; zone?: string; whatsapp?: string; saved?: string; staff_zone?: string }>;
};

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams;
  const activeTab = params?.tab === "info" ? "info" : "settings";

  const [business, businesses, marketplace, features, zoneMapping] = await Promise.all([
    getCurrentBusiness(),
    getAllBusinesses(),
    getMarketplaceVisibility(),
    getBusinessFeatures(),
    getZoneMappingData(),
  ]);

  const hasBot         = features.has("whatsapp_bot");
  const hasMarketplace = features.has("marketplace");
  const hasAddBiz      = features.has("add_business");

  const botSettings = (business?.bot_settings ?? {}) as BotSettings;

  const tabClass = (tab: string) =>
    `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
      activeTab === tab
        ? "bg-white dark:bg-surface-800 text-surface-900 dark:text-white shadow-sm border border-surface-200 dark:border-surface-700"
        : "text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
    }`;

  return (
    <div className="space-y-6">

      {/* ── Tabs ── */}
      <div className="flex items-center gap-1 rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-900 p-1 w-fit">
        <Link href="/dashboard/settings" className={tabClass("settings")}>
          <span className="flex items-center gap-2"><Settings className="w-4 h-4" />الإعداد</span>
        </Link>
        <Link href="/dashboard/settings?tab=info" className={tabClass("info")}>
          <span className="flex items-center gap-2"><Building2 className="w-4 h-4" />معلومات المنشأة</span>
        </Link>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* TAB: الإعداد                                  */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">

          {/* ─── الأنشطة ─── */}
          <div className="glass-card overflow-hidden lg:col-span-2">
            <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">الأنشطة</h2>
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                <Building2 className="w-5 h-5" />
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {businesses.map((biz) => {
                  const isActive = biz.id === business?.id;
                  const typeLabel = businessTypeLabels[biz.type as keyof typeof businessTypeLabels] ?? biz.type;
                  return (
                    <form key={biz.id} action={switchBusiness}>
                      <input type="hidden" name="biz_id" value={biz.id} />
                      <button type="submit" disabled={isActive}
                        className={`w-full text-right rounded-xl border p-4 transition-all ${
                          isActive
                            ? "border-primary-400 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500/50 cursor-default"
                            : "border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/30 hover:border-primary-300 hover:bg-primary-50/30 cursor-pointer"
                        }`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="mt-0.5 shrink-0">
                            {isActive ? <Check className="w-4 h-4 text-primary-500" /> : <div className="w-4 h-4 rounded-full border-2 border-surface-300 dark:border-surface-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`font-bold truncate ${isActive ? "text-primary-700 dark:text-primary-300" : "text-surface-900 dark:text-white"}`}>{biz.name}</p>
                            <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400 truncate">{typeLabel}{biz.city ? ` · ${biz.city}` : ""}</p>
                          </div>
                        </div>
                        {!isActive && <p className="mt-2 text-xs text-primary-600 dark:text-primary-400 font-medium">اضغط للتبديل</p>}
                      </button>
                    </form>
                  );
                })}
                {hasAddBiz ? (
                  <a href="#add-business" className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 p-4 text-surface-400 hover:border-primary-400 hover:text-primary-500 transition-colors min-h-[80px]">
                    <Plus className="w-5 h-5" />
                    <span className="text-sm font-semibold">إضافة نشاط</span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>

          {/* ─── المظهر ─── */}
          <div className="glass-card overflow-hidden">
            <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">المظهر</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">اختر الوضع الذي يناسب شاشة العمل الحالية.</p>
            </div>
            <div className="p-6"><ThemeSelector /></div>
          </div>

          {/* ─── رابط معلومات المنشأة ─── */}
          <Link href="/dashboard/settings?tab=info"
            className="glass-card flex items-center justify-between gap-4 p-6 transition-colors hover:bg-surface-50 dark:hover:bg-surface-800/30">
            <div>
              <h2 className="text-lg font-bold text-surface-900 dark:text-white">معلومات المنشأة</h2>
              <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">الاسم، العنوان، البريد، المساعد الذكي، وزون.</p>
            </div>
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
              <Building2 className="size-5" />
            </div>
          </Link>

          {/* ─── إضافة نشاط جديد ─── */}
          {hasAddBiz ? (
            <div id="add-business" className="glass-card overflow-hidden lg:col-span-2">
              <div className="p-6 border-b border-surface-200/50 dark:border-surface-700/30">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">إضافة نشاط جديد</h2>
              </div>
              <div className="p-6">
                {params?.error === "business" ? (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    تعذر حفظ النشاط. تأكد من تسجيل الدخول وتطبيق قاعدة البيانات.
                  </div>
                ) : null}
                <form action={createBusiness} className="space-y-4 max-w-md">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">اسم النشاط</Label>
                    <Input id="name" name="name" placeholder="مثال: عيادة النخبة" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="business_type">نوع النشاط</Label>
                    <Select name="business_type" defaultValue="services">
                      <SelectTrigger id="business_type" className="w-full rounded-xl">
                        <SelectValue placeholder="اختر نوع النشاط" />
                      </SelectTrigger>
                      <SelectContent>
                        {businessTypes.map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">المدينة</Label>
                    <Input id="city" name="city" placeholder="الرياض" className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="whatsapp_number">رقم WhatsApp</Label>
                    <Input id="whatsapp_number" name="whatsapp_number" dir="ltr" placeholder="+9665..." className={inputClass} />
                  </div>
                  <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full mt-2">حفظ النشاط</SubmitButton>
                </form>
              </div>
            </div>
          ) : null}

        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* TAB: معلومات المنشأة                         */}
      {/* ══════════════════════════════════════════════ */}
      {activeTab === "info" && (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">

          {/* Success / Error banners */}
          {params?.saved === "1" ? (
            <div className="lg:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
              تم حفظ معلومات المنشأة بنجاح ✓
            </div>
          ) : null}
          {params?.error === "save" ? (
            <div className="lg:col-span-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              تعذر الحفظ. حاول مجدداً.
            </div>
          ) : null}

          {/* ─── نموذج المعلومات ─── */}
          <form action={updateBusinessInfo} className="space-y-6 lg:col-span-2 lg:grid lg:grid-cols-[1fr_380px] lg:gap-6 lg:space-y-0">

            {/* ── قسم المنشأة ── */}
            <div className="glass-card overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">المنشأة</h2>
                <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label>اسم المنشأة</Label>
                  <Input name="name" defaultValue={business?.name ?? ""} placeholder="مطعم الريم" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label>المدينة</Label>
                  <Input name="city" defaultValue={business?.city ?? ""} placeholder="الرياض" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label>العنوان أو رابط الخريطة</Label>
                  <Input name="address" defaultValue={business?.address ?? (botSettings as any).public_location_url ?? ""} placeholder="ألصق رابط Google Maps أو اكتب العنوان" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label>رقم التواصل</Label>
                  <Input name="contact_phone" dir="ltr" defaultValue={business?.contact_phone ?? ""} placeholder="+966 5x xxx xxxx" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label>رقم واتساب التواصل</Label>
                  <Input name="contact_whatsapp" dir="ltr" defaultValue={(botSettings as any).contact_whatsapp ?? ""} placeholder="+966 5x xxx xxxx" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label>البريد الإلكتروني</Label>
                  <Input name="contact_email" dir="ltr" defaultValue={business?.contact_email ?? ""} placeholder="info@example.com" className={inputClass} />
                </div>
                <div className="space-y-1.5">
                  <Label>وصف المنشأة</Label>
                  <textarea name="description" defaultValue={business?.description ?? ""} placeholder="وصف مختصر عن نشاطك..."
                    className={`${inputClass} resize-none`} rows={3} />
                </div>
              </div>
            </div>

            {/* ── العمود الأيمن ── */}
            <div className="space-y-6">

              {/* واتساب والمساعد */}
              {hasBot ? (
                <div className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg">يتطلب باقة البوت</span>
                    </div>
                    <h2 className="text-lg font-bold text-surface-900 dark:text-white">واتساب والمساعد</h2>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="space-y-1.5">
                      <Label>ربط رقم واتساب الذكي</Label>
                      <WhatsAppConnectWidget
                        initialStatus={(business as any)?.meta_waba_status ?? null}
                        initialPhone={business?.whatsapp_number ?? null}
                        initialPhoneNumberId={(business as any)?.meta_phone_number_id ?? null}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>اسم المساعد</Label>
                      <Input name="bot_name" defaultValue={(botSettings as any).bot_name ?? ""} placeholder="مُمكن" className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>شخصية المساعد</Label>
                      <select name="personality" defaultValue={(botSettings as any).personality ?? ""} className={inputClass}>
                        <option value="">اختر شخصية</option>
                        {PERSONALITY_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>اللهجة</Label>
                      <select name="dialect" defaultValue={(botSettings as any).dialect ?? ""} className={inputClass}>
                        <option value="">اختر اللهجة</option>
                        {DIALECT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                /* hidden fields to keep values when hasBot is false */
                <>
                  <input type="hidden" name="whatsapp_number" value={business?.whatsapp_number ?? ""} />
                  <input type="hidden" name="bot_name" value={(botSettings as any).bot_name ?? ""} />
                  <input type="hidden" name="personality" value={(botSettings as any).personality ?? ""} />
                  <input type="hidden" name="dialect" value={(botSettings as any).dialect ?? ""} />
                </>
              )}

              {/* زر الحفظ */}
              <SubmitButton pendingText="جاري الحفظ..." className="btn-primary w-full">حفظ التغييرات</SubmitButton>

            </div>
          </form>

          {/* ─── زون ─── */}
          {hasMarketplace ? (
            <div className="glass-card overflow-hidden lg:col-span-2">
              <div className="flex items-center justify-between gap-4 border-b border-surface-200/50 p-6 dark:border-surface-700/30">
                <div className="text-right">
                  <h2 className="text-lg font-bold text-surface-900 dark:text-white">زون</h2>
                  <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">تحكم في ظهور منشأتك للأفراد في زون.</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300">
                  <Compass className="size-5" />
                </div>
              </div>
              <div className="p-6 space-y-4">

                {/* zone feedback */}
                {params?.zone === "enabled" ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">تم تفعيل ظهور المتجر في الزون.</div> : null}
                {params?.zone === "disabled" ? <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 text-sm text-surface-600 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-300">تم إيقاف ظهور المتجر في الزون.</div> : null}
                {params?.staff_zone === "shown" ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">سيظهر طاقم العمل في زون.</div> : null}
                {params?.staff_zone === "hidden" ? <div className="rounded-xl border border-surface-200 bg-surface-50 p-3 text-sm text-surface-600 dark:border-surface-700 dark:bg-surface-800/50 dark:text-surface-300">تم إخفاء طاقم العمل من زون.</div> : null}
                {marketplace.targetCategoryMissing ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">فئة {marketplace.categoryName} غير موجودة في زون. أضفها أولاً من لوحة الأدمن.</div> : null}

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* عرض في زون */}
                  <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${zoneMapping.isPublic ? "text-emerald-600 dark:text-emerald-300" : "text-surface-500"}`}>
                        {zoneMapping.isPublic ? "ظاهر في زون" : "غير ظاهر"}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-surface-900 dark:text-white text-sm">عرض المنشأة في زون</p>
                        <p className="text-xs text-surface-500 mt-0.5">الفئة: {marketplace.categoryName}</p>
                      </div>
                    </div>
                    <form action={setMarketplaceVisibility}>
                      <input type="hidden" name="enabled" value={zoneMapping.isPublic ? "0" : "1"} />
                      <SubmitButton pendingText="جاري التحديث..."
                        disabled={!business || marketplace.targetCategoryMissing}
                        className={zoneMapping.isPublic
                          ? "w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                          : "btn-primary w-full !py-2.5 !text-sm"}>
                        <span className="inline-flex items-center justify-center gap-2">
                          {zoneMapping.isPublic ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          {zoneMapping.isPublic ? "إيقاف الظهور" : "إظهار في زون"}
                        </span>
                      </SubmitButton>
                    </form>
                  </div>

                  {/* عرض طاقم العمل */}
                  <div className="rounded-xl border border-surface-200 dark:border-surface-700 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${zoneMapping.showStaff ? "text-emerald-600 dark:text-emerald-300" : "text-surface-500"}`}>
                        {zoneMapping.showStaff ? "ظاهر" : "مخفي"}
                      </span>
                      <div className="text-right">
                        <p className="font-semibold text-surface-900 dark:text-white text-sm">عرض طاقم العمل في زون</p>
                        <p className="text-xs text-surface-500 mt-0.5">يظهر الموظفون في صفحة متجرك</p>
                      </div>
                    </div>
                    <form action={setStaffZoneVisibility}>
                      <input type="hidden" name="visible" value={zoneMapping.showStaff ? "0" : "1"} />
                      <SubmitButton pendingText="جاري التحديث..."
                        disabled={!zoneMapping.isPublic}
                        className={zoneMapping.showStaff
                          ? "w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
                          : "btn-primary w-full !py-2.5 !text-sm"}>
                        <span className="inline-flex items-center justify-center gap-2">
                          <Users className="size-4" />
                          {zoneMapping.showStaff ? "إخفاء الطاقم" : "إظهار الطاقم"}
                        </span>
                      </SubmitButton>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      )}
    </div>
  );
}
