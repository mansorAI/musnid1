"use client";

import { useRef, useTransition } from "react";
import { uploadCategoryIcon } from "./actions";

export function CategoryIconUpload({
  categoryId,
  currentUrl,
}: {
  categoryId: string;
  currentUrl: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("category_id", categoryId);
    formData.append("icon_file", file);
    startTransition(() => {
      uploadCategoryIcon(formData);
    });
  }

  return (
    <div className="flex items-center gap-2">
      {/* معاينة */}
      {currentUrl ? (
        <img
          src={currentUrl}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-surface-200 dark:border-surface-700 shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-content-center shrink-0 text-surface-400 text-xs text-center leading-10">
          ؟
        </div>
      )}

      {/* زر الرفع */}
      <label className={`cursor-pointer text-xs text-violet-600 hover:underline ${pending ? "opacity-50 pointer-events-none" : ""}`}>
        {pending ? "جاري الرفع..." : currentUrl ? "تغيير" : "رفع صورة"}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
