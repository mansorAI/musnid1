import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

function getServiceClient() {
  return createServiceClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return null;
  return user;
}

export async function getAdminStats() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalBusinesses },
    { count: totalCustomers },
    { count: totalPlans },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "business"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("plans").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  return {
    totalUsers: totalUsers ?? 0,
    totalBusinesses: totalBusinesses ?? 0,
    totalCustomers: totalCustomers ?? 0,
    totalPlans: totalPlans ?? 0,
  };
}

export async function getAllMembers() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, role, created_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllBusinesses() {
  const supabase = getServiceClient();

  const { data } = await supabase
    .from("businesses")
    .select(`
      id, name, type, city, contact_email, subscription_tier, subscription_status, created_at,
      owner:profiles!businesses_owner_id_fkey (id, email, full_name),
      business_category_mapping (category_id, is_public, store_categories (id, name))
    `)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getAllCategories() {
  const supabase = getServiceClient();

  const { data } = await supabase
    .from("store_categories")
    .select("id, name, section_key")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function getPlans() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("plans")
    .select(`
      *,
      plan_features (*)
    `)
    .order("sort_order", { ascending: true });

  return data ?? [];
}

export async function getBusinessSubscriptions() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("business_subscriptions")
    .select(`
      *,
      plan:plans (name, price),
      business:businesses (name, type)
    `)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getBusinessDirectFeatures() {
  const supabase = getServiceClient();

  const { data } = await supabase
    .from("business_features")
    .select("*, business:businesses(id, name)")
    .order("created_at", { ascending: false });

  return data ?? [];
}
