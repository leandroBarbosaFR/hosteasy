"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireStaffContext } from "@/lib/data/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notifyUser } from "@/lib/notify";

const createSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: z
    .enum(["cleaning", "maintenance", "supplies", "check_in", "check_out", "other"])
    .default("other"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  property_id: z.string().uuid().optional().or(z.literal("")),
  reservation_id: z.string().uuid().optional().or(z.literal("")),
  assignee_id: z.string().uuid().optional().or(z.literal("")),
  due_at: z.string().optional().or(z.literal("")),
});

export async function createTask(formData: FormData) {
  const { hostId, profile } = await requireStaffContext();

  // host_staff can create tasks for themselves; host_admin/super_admin can
  // create tasks and assign to anyone in their host.
  const parsed = createSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    category: (formData.get("category") as string) || "other",
    priority: (formData.get("priority") as string) || "normal",
    property_id: formData.get("property_id") ?? "",
    reservation_id: formData.get("reservation_id") ?? "",
    assignee_id: formData.get("assignee_id") ?? "",
    due_at: formData.get("due_at") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  // host_staff can only assign to themselves (if assignee_id given)
  if (
    profile.role === "host_staff" &&
    parsed.data.assignee_id &&
    parsed.data.assignee_id !== profile.id
  ) {
    return { ok: false, error: "Equipe só pode criar tarefas para si mesma." };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff_tasks")
    .insert({
      host_id: hostId,
      property_id: parsed.data.property_id || null,
      reservation_id: parsed.data.reservation_id || null,
      assignee_id: parsed.data.assignee_id || null,
      created_by_id: profile.id,
      title: parsed.data.title,
      description: parsed.data.description || null,
      category: parsed.data.category,
      priority: parsed.data.priority,
      due_at: parsed.data.due_at
        ? new Date(parsed.data.due_at).toISOString()
        : null,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erro" };

  if (parsed.data.assignee_id && parsed.data.assignee_id !== profile.id) {
    await notifyUser(parsed.data.assignee_id, {
      hostId,
      type: "task_assigned",
      title: `Nova tarefa: ${parsed.data.title}`,
      body: `Atribuída por ${profile.full_name ?? "anfitrião"}.`,
      entityType: "staff_task",
      entityId: data.id,
      actionPath: `/staff/tasks/${data.id}`,
    });
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/staff");
  revalidatePath("/staff/tasks");
  return { ok: true, id: data.id };
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["pending", "in_progress", "done", "blocked", "cancelled"]),
});

export async function updateTaskStatus(taskId: string, status: string) {
  const { profile, hostId } = await requireStaffContext();
  const parsed = statusSchema.safeParse({ id: taskId, status });
  if (!parsed.success) return { ok: false, error: "Status inválido." };

  const supabase = await createSupabaseServerClient();

  // host_staff may only update tasks assigned to them.
  // RLS will reject the wrong row, but we surface a friendly error here.
  if (profile.role === "host_staff") {
    const { data: t } = await supabase
      .from("staff_tasks")
      .select("assignee_id")
      .eq("id", taskId)
      .maybeSingle();
    if (!t || t.assignee_id !== profile.id) {
      return { ok: false, error: "Tarefa não está atribuída a você." };
    }
  }

  const { error } = await supabase
    .from("staff_tasks")
    .update({ status: parsed.data.status })
    .eq("id", taskId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/staff");
  revalidatePath("/staff/tasks");
  revalidatePath(`/staff/tasks/${taskId}`);
  return { ok: true };
}

export async function assignTask(taskId: string, assigneeId: string | null) {
  const { profile, hostId } = await requireStaffContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Apenas o anfitrião pode atribuir tarefas." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: updated, error } = await supabase
    .from("staff_tasks")
    .update({ assignee_id: assigneeId })
    .eq("id", taskId)
    .eq("host_id", hostId)
    .select("id, title")
    .single();
  if (error) return { ok: false, error: error.message };

  if (assigneeId && assigneeId !== profile.id && updated) {
    await notifyUser(assigneeId, {
      hostId,
      type: "task_assigned",
      title: `Tarefa atribuída a você: ${updated.title}`,
      body: `Atribuída por ${profile.full_name ?? "anfitrião"}.`,
      entityType: "staff_task",
      entityId: taskId,
      actionPath: `/staff/tasks/${taskId}`,
    });
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath("/staff");
  return { ok: true };
}

export async function deleteTask(taskId: string) {
  const { profile, hostId } = await requireStaffContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("staff_tasks")
    .delete()
    .eq("id", taskId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/tasks");
  revalidatePath("/staff");
  return { ok: true };
}

export async function addTaskComment(
  taskId: string,
  body: string,
): Promise<{
  ok: boolean;
  error?: string;
  comment?: { id: string; body: string; created_at: string; sender_id: string | null };
}> {
  const { profile } = await requireStaffContext();
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Mensagem vazia." };
  if (trimmed.length > 2000) return { ok: false, error: "Mensagem longa demais." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("staff_task_comments")
    .insert({
      task_id: taskId,
      sender_id: profile.id,
      body: trimmed,
    })
    .select("id, body, created_at, sender_id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erro" };

  revalidatePath(`/dashboard/tasks/${taskId}`);
  revalidatePath(`/staff/tasks/${taskId}`);
  return { ok: true, comment: data };
}

// Convenience: create a cleaning task pre-filled from a reservation's
// check-out date. Used by the "Agendar limpeza" button on reservations.
export async function createCleaningFromReservation(
  reservationId: string,
  assigneeId: string | null,
) {
  const { profile, hostId } = await requireStaffContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: r } = await supabase
    .from("reservations")
    .select("id, property_id, check_out, guest_name")
    .eq("id", reservationId)
    .eq("host_id", hostId)
    .maybeSingle();
  if (!r) return { ok: false, error: "Reserva não encontrada." };

  // Due at the next day 11am local — typical post-checkout window.
  const due = new Date(r.check_out + "T14:00:00Z"); // ~11am BRT

  const { data, error } = await supabase
    .from("staff_tasks")
    .insert({
      host_id: hostId,
      property_id: r.property_id,
      reservation_id: r.id,
      assignee_id: assigneeId || null,
      created_by_id: profile.id,
      title: `Limpeza pós check-out — ${r.guest_name}`,
      description: `Estadia encerra em ${r.check_out}. Verificar danos, repor amenities, deixar pronto para o próximo hóspede.`,
      category: "cleaning",
      status: "pending",
      priority: "high",
      due_at: due.toISOString(),
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erro" };

  if (assigneeId && assigneeId !== profile.id) {
    await notifyUser(assigneeId, {
      hostId,
      type: "task_assigned",
      title: `Limpeza agendada — ${r.guest_name}`,
      body: `Check-out em ${r.check_out}.`,
      entityType: "staff_task",
      entityId: data.id,
      actionPath: `/staff/tasks/${data.id}`,
    });
  }

  revalidatePath("/dashboard/tasks");
  revalidatePath("/dashboard/reservations");
  revalidatePath("/staff");
  return { ok: true, id: data.id };
}
