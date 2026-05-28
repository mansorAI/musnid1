"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import type { Database, Json } from "@/types/database";

type BusinessType = Database["public"]["Enums"]["business_type"];

const businessTypes: readonly BusinessType[] = [
  "restaurant",
  "cafe",
  "clinic",
  "salon",
  "retail",
  "real_estate",
  "services",
  "other",
];

const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"] as const;

type DayKey = (typeof days)[number];

type DayHours = {
  open: string;
  close: string;
  closed: boolean;
};

type WorkingHours = Record<DayKey, DayHours>;

type BotSettings = {
  personality: string;
  dialect: string;
  greeting: string;
};

function requireValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) {
    redirect(`/onboarding?error=${encodeURIComponent("أكمل الحقول الأساسية ثم حاول مرة أخرى.")}`);
  }
  return value;
}

function optionalValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim() || null;
}

function generateSlug(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[\s]+/g, "-")
      .replace(/[^a-z0-9\u0600-\u06FF-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "business";

  return `${base}-${Date.now().toString(36)}`;
}

function parseBusinessType(value: string): BusinessType {
  if (businessTypes.includes(value as BusinessType)) {
    return value as BusinessType;
  }

  return "services";
}

function parseWorkingHours(formData: FormData): WorkingHours {
  return days.reduce<WorkingHours>((hours, day) => {
    hours[day] = {
      open: String(formData.get(`${day}_open`) ?? "09:00"),
      close: String(formData.get(`${day}_close`) ?? "17:00"),
      closed: formData.get(`${day}_closed`) === "on",
    };
    return hours;
  }, {} as WorkingHours);
}

export async function completeOnboarding(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard?created_business=demo");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in?next=/onboarding");
  }

  const { data: existingBusiness } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  if (existingBusiness) {
    redirect("/dashboard");
  }

  const name = requireValue(formData, "name");
  const type = parseBusinessType(requireValue(formData, "business_type"));
  const city = requireValue(formData, "city");
  const description = optionalValue(formData, "description");
  const contactPhone = optionalValue(formData, "contact_phone");
  const contactEmail = optionalValue(formData, "contact_email") ?? user.email ?? null;
  const whatsappNumber = optionalValue(formData, "whatsapp_number");
  const workingHours = parseWorkingHours(formData);
  const botSettings: BotSettings = {
    personality: requireValue(formData, "bot_personality"),
    dialect: requireValue(formData, "bot_dialect"),
    greeting: requireValue(formData, "bot_greeting"),
  };

  const { error: profileError } = await supabase.from("profiles").upsert(
    { id: user.id, email: user.email ?? contactEmail ?? "" },
    { onConflict: "id", ignoreDuplicates: true },
  );

  if (profileError) {
    redirect(`/onboarding?error=${encodeURIComponent(`تعذر تجهيز ملف المستخدم: ${profileError.message}`)}`);
  }

  const { error } = await supabase.from("businesses").insert({
    owner_id: user.id,
    name,
    slug: generateSlug(name),
    type,
    description,
    city,
    contact_phone: contactPhone,
    contact_email: contactEmail,
    whatsapp_number: whatsappNumber,
    working_hours: workingHours as Json,
    bot_settings: botSettings as Json,
  });

  if (error) {
    redirect(`/onboarding?error=${encodeURIComponent(`تعذر إنشاء النشاط: ${error.message}`)}`);
  }

  redirect("/dashboard?created_business=1");
}
