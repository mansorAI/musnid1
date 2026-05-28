"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness } from "@/lib/dashboard-data";

export type KnowledgeArticle = {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
};

async function getArticles(botSettings: Record<string, unknown>): Promise<KnowledgeArticle[]> {
  return Array.isArray(botSettings.knowledge) ? (botSettings.knowledge as KnowledgeArticle[]) : [];
}

export async function addKnowledgeArticle(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/knowledge");

  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  if (!title || !content) redirect("/dashboard/knowledge?error=missing");

  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const articles = await getArticles(botSettings);

  const newArticle: KnowledgeArticle = {
    id: crypto.randomUUID(),
    title,
    content,
    enabled: true,
  };

  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update({ bot_settings: { ...botSettings, knowledge: [...articles, newArticle] } })
    .eq("id", business.id);

  revalidatePath("/dashboard/knowledge");
  redirect("/dashboard/knowledge");
}

export async function toggleKnowledgeArticle(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const articles = await getArticles(botSettings);

  const updated = articles.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));

  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update({ bot_settings: { ...botSettings, knowledge: updated } })
    .eq("id", business.id);

  revalidatePath("/dashboard/knowledge");
}

export async function deleteKnowledgeArticle(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) return;

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const botSettings = (business.bot_settings as Record<string, unknown>) ?? {};
  const articles = await getArticles(botSettings);

  const updated = articles.filter((a) => a.id !== id);

  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update({ bot_settings: { ...botSettings, knowledge: updated } })
    .eq("id", business.id);

  revalidatePath("/dashboard/knowledge");
}
