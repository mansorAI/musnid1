"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { getCurrentBusiness } from "@/lib/dashboard-data";
import type { EmployeeActionType } from "@/types/database";

// ── الإجراءات القديمة (الدليل) ────────────────────────────────────────────────

export async function addStaffMember(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) redirect("/sign-in?next=/dashboard/staff");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) redirect("/dashboard/staff?error=missing_name");

  const title     = String(formData.get("title")     ?? "").trim() || null;
  const specialty = String(formData.get("specialty") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("staff_members").insert({
    business_id: business.id,
    name, title, specialty, is_active: true,
  });

  if (error) redirect("/dashboard/staff?error=insert");
  revalidatePath("/dashboard/staff");
  redirect("/dashboard/staff");
}

export async function toggleStaffActive(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const id      = String(formData.get("id")        ?? "").trim();
  const current = formData.get("is_active") === "true";
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("staff_members").update({ is_active: !current }).eq("id", id);
  revalidatePath("/dashboard/staff");
}

// ── البحث عن موظف بالإيميل ───────────────────────────────────────────────────

export async function searchProfileByEmail(
  email: string
): Promise<{ id: string; full_name: string | null; email: string } | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  return data ?? null;
}

// ── ربط موظف بالمنشأة ────────────────────────────────────────────────────────

export async function linkEmployee(formData: FormData) {
  if (!hasSupabaseEnv()) return { error: "no_env" };

  const business = await getCurrentBusiness();
  if (!business) return { error: "no_business" };

  const supabase   = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "no_user" };

  const profileId = String(formData.get("profile_id") ?? "").trim();
  const roleType  = formData.get("role_type") as "staff" | "cashier";
  if (!profileId || !roleType) return { error: "missing_fields" };

  // إنشاء سجل business_employees
  const { data: emp, error: empError } = await supabase
    .from("business_employees")
    .insert({
      business_id: business.id,
      profile_id:  profileId,
      invited_by:  user.id,
      role_type:   roleType,
      status:      "active",
    })
    .select("id")
    .single();

  if (empError) {
    if (empError.code === "23505") return { error: "already_linked" };
    return { error: empError.message };
  }

  if (roleType === "cashier") {
    // إنشاء سجل الصلاحيات
    const perms = {
      business_id:         business.id,
      employee_id:         emp.id,
      cashier_access:      true,
      can_read:            formData.get("can_read")            === "true",
      can_create:          formData.get("can_create")          === "true",
      can_update:          formData.get("can_update")          === "true",
      can_delete:          formData.get("can_delete")          === "true",
      can_manage_products: formData.get("can_manage_products") === "true",
    };
    const { error: permError } = await supabase.from("employee_permissions").insert(perms);
    if (permError) return { error: permError.message };

  } else {
    // إنشاء سجل staff_members للبوت
    const name      = String(formData.get("name")      ?? "").trim();
    const title     = String(formData.get("title")     ?? "").trim() || null;
    const specialty = String(formData.get("specialty") ?? "").trim() || null;
    const bio       = String(formData.get("bio")       ?? "").trim() || null;
    if (!name) return { error: "missing_name" };

    const { error: staffError } = await supabase.from("staff_members").insert({
      business_id: business.id,
      name, title, specialty, bio, is_active: true,
    });
    if (staffError) return { error: staffError.message };
  }

  revalidatePath("/dashboard/staff");
  return { success: true };
}

// ── تحديث صلاحيات كاشير ──────────────────────────────────────────────────────

export async function updateEmployeePermissions(formData: FormData) {
  if (!hasSupabaseEnv()) return { error: "no_env" };

  const business = await getCurrentBusiness();
  if (!business) return { error: "no_business" };

  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (!employeeId) return { error: "missing_id" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("employee_permissions")
    .update({
      can_read:            formData.get("can_read")            === "true",
      can_create:          formData.get("can_create")          === "true",
      can_update:          formData.get("can_update")          === "true",
      can_delete:          formData.get("can_delete")          === "true",
      can_manage_products: formData.get("can_manage_products") === "true",
      updated_at:          new Date().toISOString(),
    })
    .eq("employee_id", employeeId);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/staff");
  return { success: true };
}

// ── إزالة موظف ───────────────────────────────────────────────────────────────

export async function removeEmployee(formData: FormData) {
  if (!hasSupabaseEnv()) return;

  const business = await getCurrentBusiness();
  if (!business) return;

  const employeeId = String(formData.get("employee_id") ?? "").trim();
  if (!employeeId) return;

  const supabase = await createClient();
  await supabase
    .from("business_employees")
    .update({ status: "removed", updated_at: new Date().toISOString() })
    .eq("id", employeeId)
    .eq("business_id", business.id);

  revalidatePath("/dashboard/staff");
}

// ── جلب بيانات الموظفين المرتبطين ────────────────────────────────────────────

export async function getLinkedEmployees() {
  if (!hasSupabaseEnv()) return [];

  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("business_employees")
    .select(`
      *,
      profile:profiles!profile_id(full_name, email, phone),
      permissions:employee_permissions(*)
    `)
    .eq("business_id", business.id)
    .neq("status", "removed")
    .order("created_at");

  return (data ?? []).map((row: any) => ({
    ...row,
    permissions: Array.isArray(row.permissions) ? row.permissions[0] ?? null : row.permissions,
  }));
}

// ── جلب جلسات موظف ───────────────────────────────────────────────────────────

export async function getEmployeeSessions(employeeId: string) {
  if (!hasSupabaseEnv()) return [];

  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("employee_sessions")
    .select("*")
    .eq("business_id", business.id)
    .eq("employee_id", employeeId)
    .order("clocked_in_at", { ascending: false })
    .limit(30);

  return data ?? [];
}

// ── جلب سجل التدقيق ──────────────────────────────────────────────────────────

export async function getEmployeeAuditLog(employeeId: string) {
  if (!hasSupabaseEnv()) return [];

  const business = await getCurrentBusiness();
  if (!business) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("employee_audit_log")
    .select("*")
    .eq("business_id", business.id)
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

// ── مساعد: تسمية الإجراءات ───────────────────────────────────────────────────

export const ACTION_LABEL: Record<EmployeeActionType, string> = {
  clock_in:        "دخول الكاشير",
  clock_out:       "خروج الكاشير",
  invoice_created: "إصدار فاتورة",
  invoice_deleted: "حذف فاتورة",
  product_added:   "إضافة منتج",
  product_updated: "تعديل منتج",
  product_deleted: "حذف منتج",
};
