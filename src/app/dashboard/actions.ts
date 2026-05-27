"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Database } from "@/types/database";

type BusinessType = Database["public"]["Enums"]["business_type"];

function requireValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`Missing required field: ${key}`);
  }

  return value;
}

async function getUserId() {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard/settings?demo=1");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/dashboard/settings");
  }

  return { supabase, userId: user.id };
}

export async function createOrganization(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const name = requireValue(formData, "name");
  const businessType = requireValue(formData, "business_type") as BusinessType;
  const city = String(formData.get("city") ?? "").trim() || null;
  const whatsappNumber = String(formData.get("whatsapp_number") ?? "").trim() || null;

  const { error } = await supabase.from("organizations").insert({
    owner_id: userId,
    name,
    business_type: businessType,
    city,
    whatsapp_number: whatsappNumber,
  });

  if (error) {
    redirect("/dashboard/settings?error=organization");
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createKnowledgeArticle(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const title = requireValue(formData, "title");
  const content = requireValue(formData, "content");

  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (!organization) {
    redirect("/dashboard/settings?missing_org=1");
  }

  const { error } = await supabase.from("knowledge_articles").insert({
    organization_id: organization.id,
    title,
    content,
  });

  if (error) {
    redirect("/dashboard/knowledge?error=create");
  }

  revalidatePath("/dashboard/knowledge");
  redirect("/dashboard/knowledge?created=1");
}

export async function createAutomation(formData: FormData) {
  const { supabase, userId } = await getUserId();
  const name = requireValue(formData, "name");
  const trigger = requireValue(formData, "trigger");
  const response = requireValue(formData, "response");

  const { data: organization } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .limit(1)
    .maybeSingle();

  if (!organization) {
    redirect("/dashboard/settings?missing_org=1");
  }

  const { error } = await supabase.from("automations").insert({
    organization_id: organization.id,
    name,
    trigger,
    response,
  });

  if (error) {
    redirect("/dashboard/automations?error=create");
  }

  revalidatePath("/dashboard/automations");
  redirect("/dashboard/automations?created=1");
}
