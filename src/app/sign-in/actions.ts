"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/dashboard");

  if (!email || !password) {
    redirect("/sign-in?error=missing");
  }

  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/sign-in?error=invalid");
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signOut() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
