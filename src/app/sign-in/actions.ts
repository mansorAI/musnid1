"use server";

import { redirect } from "next/navigation";
import { hasServiceRoleEnv, hasSupabaseEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function isExistingUserError(error: { message?: string; code?: string }) {
  const errorText = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();

  return (
    error.code === "user_already_exists" ||
    error.code === "email_exists" ||
    errorText.includes("already") ||
    errorText.includes("registered") ||
    errorText.includes("exists") ||
    errorText.includes("duplicate")
  );
}

function redirectWithAuthError(error: { message?: string; code?: string }) {
  const detail = encodeURIComponent(error.message ?? error.code ?? "unknown");
  const code = error.code?.toLowerCase() ?? "";
  const message = error.message?.toLowerCase() ?? "";

  if (
    code === "signup_disabled" ||
    code === "signups_not_allowed" ||
    message.includes("signup") ||
    message.includes("signups not allowed")
  ) {
    redirect(`/sign-in?error=signup_disabled&detail=${detail}`);
  }

  if (
    code === "email_provider_disabled" ||
    code === "over_email_send_rate_limit" ||
    code === "email_not_confirmed" ||
    message.includes("email")
  ) {
    redirect(`/sign-in?error=email_auth&detail=${detail}`);
  }

  if (message.includes("redirect") || message.includes("url not allowed")) {
    redirect(`/sign-in?error=redirect_url&detail=${detail}`);
  }

  redirect(`/sign-in?error=signup&detail=${detail}`);
}

export async function signInWithEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
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
    const detail = encodeURIComponent(error.message ?? error.code ?? "unknown");
    redirect(`/sign-in?error=invalid&detail=${detail}`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: business } = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!business) {
      redirect("/onboarding");
    }
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
    redirect("/onboarding?demo=1");
  }

  const supabase = await createClient();

  if (hasServiceRoleEnv()) {
    const admin = createAdminClient();
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError && isExistingUserError(createError)) {
      redirect("/sign-in?error=account_exists");
    }

    if (createError) {
      console.error("Supabase admin signup failed:", {
        code: createError.code,
        message: createError.message,
        status: createError.status,
      });
      redirectWithAuthError(createError);
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (!loginError) {
      redirect("/onboarding?created_user=1");
    }

    redirect("/sign-in?message=account_created");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: appUrl ? { emailRedirectTo: `${appUrl}/onboarding` } : undefined,
  });

  if (error) {
    console.error("Supabase signup failed:", {
      code: error.code,
      message: error.message,
      status: error.status,
    });
    if (isExistingUserError(error)) {
      redirect("/sign-in?error=account_exists");
    }
    redirectWithAuthError(error);
  }

  if (data.user && data.user.identities?.length === 0) {
    redirect("/sign-in?error=account_exists");
  }

  if (data.session) {
    redirect("/onboarding?created_user=1");
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
