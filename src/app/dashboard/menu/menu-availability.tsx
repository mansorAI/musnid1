"use client";

import { useOptimistic, useTransition } from "react";
import { UtensilsCrossed } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";

type MenuItem = Database["public"]["Tables"]["menu_items"]["Row"];
type MenuCategory = Database["public"]["Tables"]["menu_categories"]["Row"];

type Props = {
  categories: MenuCategory[];
  items: MenuItem[];
};

function AvailabilityToggle({
  item,
  onToggle,
}: {
  item: MenuItem;
  onToggle: (id: string, current: boolean) => void;
}) {
  const [, startTransition] = useTransition();

  function handleChange() {
    startTransition(() => onToggle(item.id, item.is_available));
  }

  return (
    <button
      type="button"
      onClick={handleChange}
      aria-label={item.is_available ? "إيقاف التوفر" : "تفعيل التوفر"}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
        item.is_available
          ? "bg-accent-500"
          : "bg-surface-300 dark:bg-surface-600"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ${
          item.is_available ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

const demoCategories: MenuCategory[] = [
  { id: "demo-cat-1", business_id: "demo", name: "مشروبات ساخنة", display_order: 1, created_at: "" },
  { id: "demo-cat-2", business_id: "demo", name: "مأكولات", display_order: 2, created_at: "" },
];

const demoItems: MenuItem[] = [
  { id: "demo-1", business_id: "demo", category_id: "demo-cat-1", name: "قهوة عربية",  description: null, price: 15, image_url: null, images: null, is_available: true,  display_order: 1, preparation_time_minutes: 5,  calories: null, is_spicy: false, is_vegetarian: true,  created_at: "", updated_at: "" },
  { id: "demo-2", business_id: "demo", category_id: "demo-cat-1", name: "كابتشينو",    description: null, price: 22, image_url: null, images: null, is_available: true,  display_order: 2, preparation_time_minutes: 7,  calories: null, is_spicy: false, is_vegetarian: true,  created_at: "", updated_at: "" },
  { id: "demo-3", business_id: "demo", category_id: "demo-cat-1", name: "لاتيه",        description: null, price: 22, image_url: null, images: null, is_available: false, display_order: 3, preparation_time_minutes: 7,  calories: null, is_spicy: false, is_vegetarian: true,  created_at: "", updated_at: "" },
  { id: "demo-4", business_id: "demo", category_id: "demo-cat-2", name: "برجر لحم",    description: null, price: 45, image_url: null, images: null, is_available: true,  display_order: 4, preparation_time_minutes: 15, calories: null, is_spicy: false, is_vegetarian: false, created_at: "", updated_at: "" },
  { id: "demo-5", business_id: "demo", category_id: "demo-cat-2", name: "سندويش دجاج", description: null, price: 35, image_url: null, images: null, is_available: true,  display_order: 5, preparation_time_minutes: 12, calories: null, is_spicy: false, is_vegetarian: false, created_at: "", updated_at: "" },
];

export function MenuAvailabilityList({ categories: rawCats, items: rawItems }: Props) {
  const isDemo = rawItems.length === 0;
  const categories = isDemo ? demoCategories : rawCats;
  const [optimisticItems, setOptimistic] = useOptimistic<MenuItem[], { id: string; value: boolean }>(
    isDemo ? demoItems : rawItems,
    (state, { id, value }) => state.map((item) => (item.id === id ? { ...item, is_available: value } : item)),
  );

  async function toggleItem(id: string, current: boolean) {
    setOptimistic({ id, value: !current });
    if (isDemo) return;

    const supabase = createClient();
    await supabase.from("menu_items").update({ is_available: !current }).eq("id", id);
  }

  const uncategorized = optimisticItems.filter((item) => !item.category_id);
  const allSections = [
    ...categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      items: optimisticItems.filter((item) => item.category_id === cat.id),
    })),
    ...(uncategorized.length > 0 ? [{ id: "uncategorized", name: "بدون تصنيف", items: uncategorized }] : []),
  ].filter((section) => section.items.length > 0);

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-surface-200/50 dark:border-surface-700/30">
        <div>
          <h2 className="text-lg font-bold text-surface-900 dark:text-white">قائمة الأصناف</h2>
          {isDemo && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">عرض تجريبي — أضف أصنافاً من Supabase لترى بياناتك الحقيقية</p>
          )}
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
      </div>

      <div className="divide-y divide-surface-200/50 dark:divide-surface-700/30">
        {allSections.map((section) => (
          <div key={section.id}>
            <div className="px-6 py-3 bg-surface-50/70 dark:bg-surface-800/40">
              <h3 className="text-sm font-semibold text-surface-600 dark:text-surface-400">{section.name}</h3>
            </div>
            <div className="divide-y divide-surface-200/30 dark:divide-surface-700/20">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-surface-50/50 dark:hover:bg-surface-800/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className={`font-medium ${item.is_available ? "text-surface-900 dark:text-white" : "text-surface-400 dark:text-surface-500 line-through"}`}>
                      {item.name}
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5" dir="ltr">
                      {item.price} ر.س
                      {item.preparation_time_minutes ? ` · ${item.preparation_time_minutes} د` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xs font-medium ${item.is_available ? "text-accent-600 dark:text-accent-400" : "text-surface-400"}`}>
                      {item.is_available ? "متوفر" : "نفذ"}
                    </span>
                    <AvailabilityToggle item={item} onToggle={toggleItem} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {allSections.length === 0 && (
          <div className="p-8 text-center">
            <UtensilsCrossed className="w-8 h-8 mx-auto mb-3 text-surface-300 dark:text-surface-600" />
            <p className="text-sm text-surface-500 dark:text-surface-400">
              لا توجد أصناف بعد. أضف تصنيفات وأصنافاً من Supabase لتظهر هنا.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
