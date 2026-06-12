"use server";

import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/server";
import { getAdminUser } from "@/lib/admin-data";

async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) throw new Error("غير مصرح");
}

export async function saveApiKeys(formData: FormData) {
  await requireAdmin();
  const supabase = createServiceClient();

  const claudeKey = formData.get("claude_api_key") as string | null;
  const geminiKey = formData.get("gemini_api_key") as string | null;

  await Promise.all([
    supabase.from("app_settings").upsert({
      key: "claude_api_key",
      value: claudeKey?.trim() || null,
      updated_at: new Date().toISOString(),
    }),
    supabase.from("app_settings").upsert({
      key: "gemini_api_key",
      value: geminiKey?.trim() || null,
      updated_at: new Date().toISOString(),
    }),
  ]);

  revalidatePath("/admin/settings");
}
