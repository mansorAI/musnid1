"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/ui/submit-button";
import { createAdminOffer } from "./actions";

type Business = { id: string; name: string; products: { id: string; name: string }[] };
type LinkType = "external" | "store" | "product";

export function AdminOfferForm({ businesses }: { businesses: Business[] }) {
  const [linkType, setLinkType] = useState<LinkType>("external");
  const [bizId, setBizId] = useState("");

  const products = businesses.find((b) => b.id === bizId)?.products ?? [];

  const tabCls = (t: LinkType) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      linkType === t
        ? "bg-violet-600 text-white"
        : "bg-surface-100 text-surface-600 hover:bg-surface-200 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700"
    }`;

  return (
    <form action={createAdminOffer} className="space-y-4" encType="multipart/form-data">
      <input type="hidden" name="link_type" value={linkType} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Title */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">عنوان العرض *</label>
          <input
            name="title"
            required
            placeholder="مثال: خصم ٣٠٪ على الوجبات"
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
          />
        </div>

        {/* Image upload */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">صورة العرض</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white file:mr-2 file:rounded-lg file:border-0 file:bg-violet-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-violet-700"
          />
        </div>

        {/* Sort order */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">الترتيب</label>
          <input
            name="sort_order"
            type="number"
            defaultValue={0}
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
          />
        </div>
      </div>

      {/* Link type selector */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-surface-500 dark:text-surface-400">نوع الرابط</label>
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
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">رابط الوجهة (TikTok، موقع، ...)</label>
          <input
            name="external_url"
            placeholder="https://..."
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
          />
        </div>
      )}

      {/* Store selector */}
      {(linkType === "store" || linkType === "product") && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">المتجر</label>
          <select
            name="business_id"
            value={bizId}
            onChange={(e) => setBizId(e.target.value)}
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
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
          <label className="text-xs font-medium text-surface-500 dark:text-surface-400">المنتج</label>
          <select
            name="product_id"
            className="rounded-xl border px-3 py-2 text-sm bg-white dark:bg-surface-800 dark:border-surface-700 dark:text-white"
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
        pendingText="جاري الإضافة..."
        className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
      >
        إضافة عرض
      </SubmitButton>
    </form>
  );
}
