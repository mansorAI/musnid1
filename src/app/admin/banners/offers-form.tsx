"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createAdminOffer, updateAdminOffer } from "./actions";

type Business = { id: string; name: string; products: { id: string; name: string }[] };
type LinkType = "external" | "store" | "product";

type EditOffer = {
  id: string;
  title: string;
  image_url: string | null;
  external_url: string | null;
  business_id: string | null;
  product_id: string | null;
  sort_order: number;
};

type Props = {
  businesses: Business[];
  editOffer?: EditOffer;
};

function inferLinkType(offer?: EditOffer): LinkType {
  if (!offer) return "external";
  if (offer.business_id && offer.product_id) return "product";
  if (offer.business_id) return "store";
  return "external";
}

export function AdminOfferForm({ businesses, editOffer }: Props) {
  const isEdit = !!editOffer;
  const [linkType, setLinkType] = useState<LinkType>(inferLinkType(editOffer));
  const [bizId, setBizId] = useState(editOffer?.business_id ?? "");

  const products = businesses.find((b) => b.id === bizId)?.products ?? [];

  const tabCls = (t: LinkType) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      linkType === t
        ? "bg-violet-600 text-white"
        : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
    }`;

  const inputCls = "rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white";
  const labelCls = "text-xs font-medium text-surface-500 dark:text-surface-400";

  return (
    <form
      action={isEdit ? updateAdminOffer : createAdminOffer}
      className="space-y-4"
      encType="multipart/form-data"
    >
      {isEdit && <input type="hidden" name="id" value={editOffer.id} />}
      {isEdit && <input type="hidden" name="existing_image_url" value={editOffer.image_url ?? ""} />}
      <input type="hidden" name="link_type" value={linkType} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>عنوان العرض *</label>
          <input
            name="title"
            required
            defaultValue={editOffer?.title ?? ""}
            placeholder="مثال: خصم ٣٠٪ على الوجبات"
            className={inputCls}
          />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>
            {isEdit && editOffer?.image_url ? "تغيير الصورة (اتركه فارغاً للإبقاء)" : "صورة العرض"}
          </label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className={`${inputCls} file:mr-2 file:rounded-lg file:border-0 file:bg-violet-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-violet-700`}
          />
          {isEdit && editOffer?.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={editOffer.image_url} alt="" className="mt-1 h-12 w-20 rounded-lg object-cover border" />
          )}
        </div>

        {/* Sort order */}
        <div className="flex flex-col gap-1">
          <label className={labelCls}>الترتيب</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={editOffer?.sort_order ?? 0}
            className={inputCls}
          />
        </div>
      </div>

      {/* Link type selector */}
      <div className="flex flex-col gap-2">
        <label className={labelCls}>نوع الرابط</label>
        <div className="flex gap-2 flex-wrap">
          <button type="button" className={tabCls("external")} onClick={() => setLinkType("external")}>
            🔗 رابط خارجي
          </button>
          <button type="button" className={tabCls("store")} onClick={() => { setLinkType("store"); setBizId(""); }}>
            🏪 متجر
          </button>
          <button type="button" className={tabCls("product")} onClick={() => { setLinkType("product"); setBizId(""); }}>
            📦 منتج في متجر
          </button>
        </div>
      </div>

      {/* External URL */}
      {linkType === "external" && (
        <div className="flex flex-col gap-1">
          <label className={labelCls}>رابط الوجهة (TikTok، موقع، ...)</label>
          <input
            name="external_url"
            defaultValue={editOffer?.external_url ?? ""}
            placeholder="https://..."
            className={inputCls}
          />
        </div>
      )}

      {/* Store selector */}
      {(linkType === "store" || linkType === "product") && (
        <div className="flex flex-col gap-1">
          <label className={labelCls}>المتجر</label>
          <select
            name="business_id"
            value={bizId}
            onChange={(e) => setBizId(e.target.value)}
            className={inputCls}
          >
            <option value="">اختر متجراً...</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Product selector */}
      {linkType === "product" && bizId && (
        <div className="flex flex-col gap-1">
          <label className={labelCls}>المنتج</label>
          <select
            name="product_id"
            defaultValue={editOffer?.product_id ?? ""}
            className={inputCls}
          >
            <option value="">اختر منتجاً...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}

      {linkType === "product" && !bizId && (
        <p className="text-xs text-surface-400 dark:text-surface-600">اختر متجراً أولاً لتظهر منتجاته.</p>
      )}

      <SubmitButton
        pendingText={isEdit ? "جاري الحفظ..." : "جاري الإضافة..."}
        className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
      >
        {isEdit ? "حفظ التعديلات" : "إضافة عرض"}
      </SubmitButton>
    </form>
  );
}
