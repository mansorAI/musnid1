"use server";

import { revalidatePath } from "next/cache";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/admin-data";
import type { Database } from "@/types/database";

function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function saveAppTheme(formData: FormData) {
  const user = await getAdminUser();
  if (!user) throw new Error("غير مصرح");

  const bg_color_start = (formData.get("bg_color_start") as string)?.trim() || "#ffffff";
  const bg_color_end   = (formData.get("bg_color_end")   as string)?.trim() || "#ffffff";
  const card_color     = (formData.get("card_color")     as string)?.trim() || "#ffffff";

  const supabase = getServiceClient();
  const { error } = await supabase
    .from("platform_settings")
    .upsert({ id: "default", bg_color_start, bg_color_end, card_color, updated_at: new Date().toISOString() });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/app-theme");
}
