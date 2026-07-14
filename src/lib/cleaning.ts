import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";

// Cleaning auto-assignment. When a property has a default cleaner, every
// reservation gets a post-checkout cleaning task created for them
// automatically — on import (iCal sync), on manual creation, and via the
// hourly cron sweep as a catch-all (covers cleaners configured after the
// reservation already existed).

export async function ensureCleaningTask(
  reservationId: string,
): Promise<"created" | "exists" | "skipped"> {
  const admin = createSupabaseAdminClient();

  const { data: r } = await admin
    .from("reservations")
    .select("id, host_id, property_id, check_out, guest_name, status")
    .eq("id", reservationId)
    .in("status", ["confirmed", "in_stay"])
    .maybeSingle();
  if (!r) return "skipped";

  const { data: prop } = await admin
    .from("properties")
    .select("id, default_cleaner_id")
    .eq("id", r.property_id)
    .maybeSingle();
  if (!prop?.default_cleaner_id) return "skipped";

  const { data: existing } = await admin
    .from("staff_tasks")
    .select("id")
    .eq("reservation_id", r.id)
    .eq("category", "cleaning")
    .neq("status", "cancelled")
    .limit(1)
    .maybeSingle();
  if (existing) return "exists";

  // Due the day of checkout, ~11am BRT (matches createCleaningFromReservation).
  const due = new Date(r.check_out + "T14:00:00Z");

  const { data: task, error } = await admin
    .from("staff_tasks")
    .insert({
      host_id: r.host_id,
      property_id: r.property_id,
      reservation_id: r.id,
      assignee_id: prop.default_cleaner_id,
      created_by_id: null,
      title: `Limpeza pós check-out — ${r.guest_name}`,
      description: `Estadia encerra em ${r.check_out}. Verificar danos, repor amenities, deixar pronto para o próximo hóspede. (Criada automaticamente.)`,
      category: "cleaning",
      status: "pending",
      priority: "high",
      due_at: due.toISOString(),
    })
    .select("id")
    .single();
  if (error || !task) return "skipped";

  await notifyUser(prop.default_cleaner_id, {
    hostId: r.host_id,
    type: "task_assigned",
    title: `Limpeza agendada — ${r.guest_name}`,
    body: `Check-out em ${r.check_out}. Criada automaticamente.`,
    entityType: "staff_task",
    entityId: task.id,
    actionPath: `/staff/tasks/${task.id}`,
  });

  return "created";
}

// Catch-all: every reservation checking out in the next 7 days whose property
// has a default cleaner but no cleaning task yet.
export async function sweepCleaningTasks(): Promise<{ created: number }> {
  const admin = createSupabaseAdminClient();
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: reservations } = await admin
    .from("reservations")
    .select("id")
    .in("status", ["confirmed", "in_stay"])
    .gte("check_out", today)
    .lte("check_out", horizon);

  let created = 0;
  for (const r of reservations ?? []) {
    if ((await ensureCleaningTask(r.id)) === "created") created++;
  }
  return { created };
}
