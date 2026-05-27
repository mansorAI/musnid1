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

export async function signUpWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/sign-in?error=missing");
  }

  if (password.length < 6) {
    redirect("/sign-in?error=password");
  }

  if (!hasSupabaseEnv()) {
    redirect("/dashboard/settings?demo=1");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: appUrl ? { emailRedirectTo: `${appUrl}/dashboard/settings` } : undefined,
  });

  if (error) {
    redirect("/sign-in?error=signup");
  }

  if (data.session) {
    redirect("/dashboard/settings?created_user=1");
  }

  redirect("/sign-in?message=check-email");
}

export async function signOut() {
  if (!hasSupabaseEnv()) {
    redirect("/");
  }

  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
