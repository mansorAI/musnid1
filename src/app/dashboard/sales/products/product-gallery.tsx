"use client";

import { useState } from "react";
import { Images, X, ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGalleryButton({ images, name }: { images: string[]; name: string }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  if (!images.length) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => { setIdx(0); setOpen(true); }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-100 dark:border-primary-800/50 dark:bg-primary-900/20 dark:text-primary-400"
        title="عرض الصور"
      >
        <Images className="size-3.5" />
        صور ({images.length})
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative flex w-full max-w-2xl flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* إغلاق */}
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white"
            >
              <X className="size-7" />
            </button>

            {/* الصورة */}
            <img
              src={images[idx]}
              alt={`${name} ${idx + 1}`}
              className="max-h-[70vh] w-full rounded-2xl object-contain"
            />

            {/* تنقل */}
            {images.length > 1 && (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIdx((i) => (i + 1) % images.length)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <span className="text-sm text-white/70">
                  {idx + 1} / {images.length}
                </span>
                <button
                  onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            )}

            {/* نقاط التنقل */}
            {images.length > 1 && (
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === idx ? "w-5 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* اسم المنتج */}
            <p className="text-sm font-medium text-white/80">{name}</p>
          </div>
        </div>
      )}
    </>
  );
}
