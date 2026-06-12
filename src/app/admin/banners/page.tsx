import { createServiceClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import type { AdBanner, ZoneSection, BusinessOffer, AdminOffer } from "@/types/database";
import {
  createBanner, updateBanner, toggleBanner, deleteBanner,
  toggleBusinessOffer, deleteBusinessOffer, updateBusinessOfferTitle,
  toggleAdminOffer, deleteAdminOffer,
} from "./actions";
import { AdminOfferForm } from "./offers-form";

const COLOR_PRESETS = [
  { label: "بنفسجي", value: "#7a5af8" },
  { label: "أزرق",   value: "#2e90fa" },
  { label: "أخضر",   value: "#15b79e" },
  { label: "برتقالي", value: "#ef6820" },
  { label: "وردي",   value: "#d444f1" },
  { label: "أحمر",   value: "#f04438" },
];

async function getData() {
  const supabase = createServiceClient();
  const [bannersRes, sectionsRes, bizOffersRes, adminOffersRes, businessesRes] = await Promise.all([
    supabase.from("ad_banners").select("*").order("section_key").order("sort_order"),
    supabase.from("zone_sections").select("*").order("sort_order"),
    supabase
      .from("business_offers")
      .select("*, businesses(id, name), menu_items(id, name)")
      .order("created_at", { ascending: false }),
    supabase
      .from("admin_offers")
      .select("*, businesses(id, name), menu_items(id, name)")
      .order("sort_order"),
    supabase
      .from("businesses")
      .select("id, name, menu_items(id, name)")
      .order("name"),
  ]);

  const businesses = (businessesRes.data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    products: (Array.isArray(b.menu_items) ? b.menu_items : b.menu_items ? [b.menu_items] : []) as { id: string; name: string }[],
  }));

  return {
    banners: (bannersRes.data ?? []) as AdBanner[],
    sections: (sectionsRes.data ?? []) as ZoneSection[],
    bizOffers: (bizOffersRes.data ?? []) as unknown as (BusinessOffer & {
      businesses: { id: string; name: string } | null;
      menu_items: { id: string; name: string } | null;
    })[],
    adminOffers: (adminOffersRes.data ?? []) as unknown as (AdminOffer & {
      businesses: { id: string; name: string } | null;
      menu_items: { id: string; name: string } | null;
    })[],
    businesses,
  };
}

export default async function BannersPage() {
  const { banners, sections, bizOffers, adminOffers, businesses } = await getData();

  const allSections = [{ section_key: "all", name: "كل الأقسام" }, ...sections];

  return (
    <div className="space-y-12">

      {/* ── قسم ١: البنرات الإعلانية ── */}
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">البنرات الإعلانية</h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            بنرات متحركة تظهر أعلى أنشطة زون لكل قسم
          </p>
        </div>

        {/* Add banner form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <h2 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">إضافة بنر جديد</h2>
          <form action={createBanner} className="space-y-4" encType="multipart/form-data">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400">العنوان *</label>
                <input
                  name="title" required placeholder="مثال: عروض نهاية الأسبوع"
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400">العنوان الفرعي</label>
                <input
                  name="subtitle" placeholder="مثال: خصومات حتى ٥٠٪"
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                />
              </div>

              {/* Image: upload or URL */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400">صورة البنر</label>
                <input
                  name="image_file" type="file" accept="image/*"
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white file:mr-2 file:rounded-lg file:border-0 file:bg-violet-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-violet-700"
                />
                <input
                  name="image_url" placeholder="أو أدخل رابط الصورة https://..."
                  className="mt-1 rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400">لون الخلفية</label>
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    name="bg_color" defaultValue="#7a5af8" placeholder="اتركه فارغاً للصورة فقط"
                    className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white w-48"
                  />
                  <div className="flex gap-1.5">
                    {COLOR_PRESETS.map((c) => (
                      <div key={c.value} title={c.label} style={{ backgroundColor: c.value }}
                        className="w-6 h-6 rounded-full border-2 border-white shadow-sm" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-surface-400 dark:text-surface-600 mt-0.5">اتركه فارغاً لعرض الصورة بدون خلفية</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400">القسم</label>
                <select name="section_key"
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                  <option value="all">🌐 كل الأقسام</option>
                  {sections.map((s) => (
                    <option key={s.section_key} value={s.section_key}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-surface-500 dark:text-surface-400">الترتيب</label>
                <input name="sort_order" type="number" defaultValue={banners.length}
                  className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
                />
              </div>
            </div>
            <SubmitButton pendingText="جاري الإضافة..."
              className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors">
              إضافة بنر
            </SubmitButton>
          </form>
        </div>

        {/* Banners list */}
        <div className="space-y-3">
          {allSections.map((section) => {
            const sectionBanners = banners.filter((b) => b.section_key === section.section_key);
            return (
              <div key={section.section_key} className="space-y-2">
                <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                  {section.name} ({sectionBanners.length})
                </h3>
                {sectionBanners.length === 0 ? (
                  <p className="text-xs text-surface-400 dark:text-surface-600 pr-4">لا توجد بنرات لهذا القسم</p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sectionBanners.map((banner) => (
                      <div key={banner.id}
                        className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:bg-surface-900 dark:border-surface-800">
                        <div className="h-20 flex flex-col justify-end p-3 relative"
                          style={{ backgroundColor: banner.bg_color || "#7a5af8" }}>
                          {banner.image_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={banner.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                          )}
                          <p className="text-white font-bold text-sm leading-tight relative">{banner.title}</p>
                          {banner.subtitle && <p className="text-white/70 text-xs mt-0.5 relative">{banner.subtitle}</p>}
                          {!banner.is_active && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">معطّل</span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 flex items-center justify-between gap-2">
                          <form action={toggleBanner}>
                            <input type="hidden" name="id" value={banner.id} />
                            <input type="hidden" name="is_active" value={String(banner.is_active)} />
                            <SubmitButton pendingText="..."
                              className={`text-xs px-3 py-1 rounded-full font-medium ${banner.is_active
                                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-surface-100 text-surface-500 dark:bg-surface-800"}`}>
                              {banner.is_active ? "إخفاء" : "إظهار"}
                            </SubmitButton>
                          </form>
                          <form action={deleteBanner}>
                            <input type="hidden" name="id" value={banner.id} />
                            <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:underline">حذف</SubmitButton>
                          </form>
                        </div>
                        <details className="px-3 pb-3">
                          <summary className="text-xs text-violet-600 cursor-pointer hover:underline select-none">تعديل</summary>
                          <form action={updateBanner} className="mt-2 space-y-2" encType="multipart/form-data">
                            <input type="hidden" name="id" value={banner.id} />
                            <input name="title" defaultValue={banner.title}
                              className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="العنوان" />
                            <input name="subtitle" defaultValue={banner.subtitle ?? ""}
                              className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="العنوان الفرعي" />
                            <div className="flex gap-2">
                              <input name="bg_color" defaultValue={banner.bg_color}
                                className="flex-1 rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="لون الخلفية" />
                              <input name="sort_order" type="number" defaultValue={banner.sort_order}
                                className="w-16 rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
                            </div>
                            <select name="section_key" defaultValue={banner.section_key}
                              className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white">
                              <option value="all">🌐 كل الأقسام</option>
                              {sections.map((s) => (
                                <option key={s.section_key} value={s.section_key}>{s.name}</option>
                              ))}
                            </select>
                            <input name="image_file" type="file" accept="image/*"
                              className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white file:mr-2 file:rounded file:border-0 file:bg-violet-50 file:px-1.5 file:text-[10px] file:font-medium file:text-violet-700" />
                            <input name="image_url" defaultValue={banner.image_url ?? ""}
                              className="w-full rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white" placeholder="أو رابط الصورة (اختياري)" />
                            <SubmitButton pendingText="..."
                              className="w-full rounded-lg bg-violet-600 py-1.5 text-xs font-medium text-white hover:bg-violet-700 transition-colors">
                              حفظ التعديلات
                            </SubmitButton>
                          </form>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {banners.length === 0 && (
            <div className="rounded-2xl border bg-white p-10 text-center shadow-sm dark:bg-surface-900 dark:border-surface-800">
              <p className="text-surface-500 dark:text-surface-400">لا توجد بنرات بعد — أضف أول بنر من النموذج أعلاه</p>
            </div>
          )}
        </div>
      </div>

      {/* ── قسم ٢: عروض المنشآت ── */}
      <div className="space-y-4">
        <div className="border-t pt-8 dark:border-surface-800">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">عروض المنشآت</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            العروض التي أنشأها أصحاب المنشآت — يمكنك إخفاؤها أو حذفها أو تعديل عناوينها
          </p>
        </div>

        {bizOffers.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm dark:bg-surface-900 dark:border-surface-800">
            <p className="text-surface-500 dark:text-surface-400">لا توجد عروض من المنشآت بعد</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bizOffers.map((offer) => {
              const biz = Array.isArray(offer.businesses) ? offer.businesses[0] : offer.businesses;
              const product = Array.isArray(offer.menu_items) ? offer.menu_items[0] : offer.menu_items;
              return (
                <div key={offer.id}
                  className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:bg-surface-900 dark:border-surface-800">
                  {offer.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={offer.image_url} alt="" className="w-full h-24 object-cover" />
                  )}
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white leading-tight">{offer.title}</p>
                    {biz && <p className="text-xs text-violet-600 dark:text-violet-400">{biz.name}</p>}
                    {product && <p className="text-xs text-surface-500 dark:text-surface-400">📦 {product.name}</p>}
                    {offer.external_url && (
                      <p className="text-xs text-surface-400 dark:text-surface-500 truncate">🔗 {offer.external_url}</p>
                    )}
                    {!offer.is_visible && (
                      <span className="inline-block rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-500 dark:bg-surface-800">مخفي</span>
                    )}
                  </div>
                  <div className="px-3 pb-2 flex items-center justify-between gap-2">
                    <form action={toggleBusinessOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <input type="hidden" name="is_visible" value={String(offer.is_visible)} />
                      <SubmitButton pendingText="..."
                        className={`text-xs px-3 py-1 rounded-full font-medium ${offer.is_visible
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-surface-100 text-surface-500 dark:bg-surface-800"}`}>
                        {offer.is_visible ? "إخفاء" : "إظهار"}
                      </SubmitButton>
                    </form>
                    <form action={deleteBusinessOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:underline">حذف</SubmitButton>
                    </form>
                  </div>
                  <details className="px-3 pb-3">
                    <summary className="text-xs text-violet-600 cursor-pointer hover:underline select-none">تعديل العنوان</summary>
                    <form action={updateBusinessOfferTitle} className="mt-2 flex gap-2">
                      <input type="hidden" name="id" value={offer.id} />
                      <input name="title" defaultValue={offer.title}
                        className="flex-1 rounded-lg border px-2 py-1.5 text-xs bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white" />
                      <SubmitButton pendingText="..."
                        className="rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-700">
                        حفظ
                      </SubmitButton>
                    </form>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── قسم ٣: عروض الأدمن ── */}
      <div className="space-y-6">
        <div className="border-t pt-8 dark:border-surface-800">
          <h2 className="text-xl font-bold text-surface-900 dark:text-white">عروض الأدمن</h2>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            عروض تنشئها أنت وتظهر لجميع الأفراد في قسم العروض
          </p>
        </div>

        {/* Create admin offer form */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm dark:bg-surface-900 dark:border-surface-800">
          <h3 className="mb-4 text-base font-semibold text-surface-900 dark:text-white">إضافة عرض جديد</h3>
          <AdminOfferForm businesses={businesses} />
        </div>

        {/* Admin offers list */}
        {adminOffers.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm dark:bg-surface-900 dark:border-surface-800">
            <p className="text-surface-500 dark:text-surface-400">لا توجد عروض أدمن بعد — أضف أول عرض من النموذج أعلاه</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {adminOffers.map((offer) => {
              const biz = Array.isArray(offer.businesses) ? offer.businesses[0] : offer.businesses;
              const product = Array.isArray(offer.menu_items) ? offer.menu_items[0] : offer.menu_items;
              return (
                <div key={offer.id}
                  className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:bg-surface-900 dark:border-surface-800">
                  {offer.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={offer.image_url} alt="" className="w-full h-24 object-cover" />
                  )}
                  {!offer.image_url && (
                    <div className="h-10 bg-gradient-to-r from-violet-500 to-violet-700 flex items-center px-3">
                      <span className="text-white text-xs font-bold">عرض الأدمن</span>
                    </div>
                  )}
                  <div className="p-3 space-y-1">
                    <p className="text-sm font-semibold text-surface-900 dark:text-white leading-tight">{offer.title}</p>
                    {biz && <p className="text-xs text-violet-600 dark:text-violet-400">🏪 {biz.name}</p>}
                    {product && <p className="text-xs text-surface-500 dark:text-surface-400">📦 {product.name}</p>}
                    {offer.external_url && (
                      <p className="text-xs text-surface-400 dark:text-surface-500 truncate">🔗 {offer.external_url}</p>
                    )}
                    {!offer.is_active && (
                      <span className="inline-block rounded-full bg-surface-100 px-2 py-0.5 text-[10px] font-medium text-surface-500 dark:bg-surface-800">مخفي</span>
                    )}
                  </div>
                  <div className="px-3 pb-2 flex items-center justify-between gap-2">
                    <form action={toggleAdminOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <input type="hidden" name="is_active" value={String(offer.is_active)} />
                      <SubmitButton pendingText="..."
                        className={`text-xs px-3 py-1 rounded-full font-medium ${offer.is_active
                          ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-surface-100 text-surface-500 dark:bg-surface-800"}`}>
                        {offer.is_active ? "إخفاء" : "إظهار"}
                      </SubmitButton>
                    </form>
                    <form action={deleteAdminOffer}>
                      <input type="hidden" name="id" value={offer.id} />
                      <SubmitButton pendingText="..." className="text-xs text-rose-500 hover:underline">حذف</SubmitButton>
                    </form>
                  </div>
                  <details className="px-3 pb-3">
                    <summary className="text-xs text-violet-600 cursor-pointer hover:underline select-none">تعديل</summary>
                    <div className="mt-3">
                      <AdminOfferForm
                        businesses={businesses}
                        editOffer={{
                          id: offer.id,
                          title: offer.title,
                          image_url: offer.image_url,
                          external_url: offer.external_url,
                          business_id: offer.business_id,
                          product_id: offer.product_id,
                          sort_order: offer.sort_order,
                        }}
                      />
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
