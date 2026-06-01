"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import {
  computeSuppressionDelta,
  extractContextTag,
  updateEnergyLevel,
  type TaskContextTag,
} from "@/lib/task-engine";

async function getUser() {
  if (!hasSupabaseEnv()) redirect("/dashboard/tasks?demo=1");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/dashboard/tasks");
  return { supabase, userId: user.id, userEmail: user.email ?? "" };
}

function readTaskId(formData: FormData) {
  const taskId = String(formData.get("task_id") ?? "").trim();
  if (!taskId) redirect("/dashboard/tasks?error=missing-task");
  return taskId;
}

async function getTaskForUser(taskId: string, userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("personal_tasks")
    .select("id,title,context_tag,base_weight,energy_required,days_delayed")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

async function logOutcome(
  taskId: string,
  userId: string,
  contextTag: TaskContextTag,
  outcome: "done" | "snoozed" | "ignored",
) {
  const supabase = await createClient();
  const hour = new Date().getHours();

  await supabase.from("task_surface_log").insert({
    task_id: taskId,
    user_id: userId,
    context_tag: contextTag,
    outcome,
  });

  const { data: factorRow } = await supabase
    .from("task_suppression_factors")
    .select("factor")
    .eq("task_id", taskId)
    .eq("context_tag", contextTag)
    .maybeSingle();

  await supabase.from("task_suppression_factors").upsert(
    {
      task_id: taskId,
      user_id: userId,
      context_tag: contextTag,
      factor: computeSuppressionDelta(outcome, factorRow?.factor ?? 1),
    },
    { onConflict: "task_id,context_tag" },
  );

  const { data: energyRow } = await supabase
    .from("user_energy_map")
    .select("energy_level,sample_count")
    .eq("user_id", userId)
    .eq("hour", hour)
    .maybeSingle();

  const sampleCount = energyRow?.sample_count ?? 0;
  await supabase.from("user_energy_map").upsert(
    {
      user_id: userId,
      hour,
      energy_level: updateEnergyLevel(energyRow?.energy_level ?? 0.5, sampleCount, outcome === "done"),
      sample_count: sampleCount + 1,
    },
    { onConflict: "user_id,hour" },
  );
}

export async function addPersonalTask(formData: FormData) {
  const { supabase, userId, userEmail } = await getUser();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) redirect("/dashboard/tasks?error=missing-title");

  await supabase.from("profiles").upsert(
    { id: userId, email: userEmail },
    { onConflict: "id", ignoreDuplicates: true },
  );

  const context = String(formData.get("context_tag") ?? "").trim() as TaskContextTag;
  const baseWeight = Number(formData.get("base_weight") ?? 1);
  const energyRequired = Number(formData.get("energy_required") ?? 0.5);
  const startTime = String(formData.get("start_time") ?? "").trim();
  const endTime = String(formData.get("end_time") ?? "").trim();

  const { data: task, error } = await supabase
    .from("personal_tasks")
    .insert({
      user_id: userId,
      title,
      context_tag: context || extractContextTag(title),
      base_weight: Number.isFinite(baseWeight) ? baseWeight : 1,
      energy_required: Number.isFinite(energyRequired) ? energyRequired : 0.5,
    })
    .select("id")
    .single();

  if (error || !task) redirect("/dashboard/tasks?error=create");

  if (startTime && endTime && startTime < endTime) {
    await supabase.from("task_time_windows").insert({
      task_id: task.id,
      start_time: startTime,
      end_time: endTime,
    });
  }

  revalidatePath("/dashboard/tasks");
  redirect("/dashboard/tasks");
}

export async function completePersonalTask(formData: FormData) {
  const { supabase, userId } = await getUser();
  const taskId = readTaskId(formData);
  const task = await getTaskForUser(taskId, userId);
  if (!task) return;

  await supabase
    .from("personal_tasks")
    .update({ status: "done", completed_at: new Date().toISOString() })
    .eq("id", taskId)
    .eq("user_id", userId);

  await logOutcome(taskId, userId, task.context_tag as TaskContextTag, "done");
  revalidatePath("/dashboard/tasks");
}

export async function snoozePersonalTask(formData: FormData) {
  const { supabase, userId } = await getUser();
  const taskId = readTaskId(formData);
  const task = await getTaskForUser(taskId, userId);
  if (!task) return;

  await supabase
    .from("personal_tasks")
    .update({ days_delayed: task.days_delayed + 1 })
    .eq("id", taskId)
    .eq("user_id", userId);

  await logOutcome(taskId, userId, task.context_tag as TaskContextTag, "snoozed");
  revalidatePath("/dashboard/tasks");
}

export async function ignorePersonalTask(formData: FormData) {
  const { userId } = await getUser();
  const taskId = readTaskId(formData);
  const task = await getTaskForUser(taskId, userId);
  if (!task) return;

  await logOutcome(taskId, userId, task.context_tag as TaskContextTag, "ignored");
  revalidatePath("/dashboard/tasks");
}
