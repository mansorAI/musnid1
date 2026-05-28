import { getMenuData } from "@/lib/dashboard-data";
import { MenuAvailabilityList } from "./menu-availability";

export default async function MenuPage() {
  const { categories, items } = await getMenuData();

  return (
    <div className="grid gap-6">
      <section>
        <p className="text-sm text-surface-500 dark:text-surface-400">المنيو</p>
        <h1 className="text-2xl font-extrabold text-surface-900 dark:text-white">قائمة الطعام والتوفر</h1>
      </section>

      <MenuAvailabilityList categories={categories} items={items} />
    </div>
  );
}
