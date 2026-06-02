"use server";

import { revalidatePath } from "next/cache";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendHostMessage(
  reservationId: string,
  body: string,
): Promise<{ ok: boolean; error?: string; message?: {
  id: string; body: string; sender_type: "host"; created_at: string;
} }> {
  const { hostId, profile } = await requireHostContext();
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Mensagem vazia." };

  const supabase = await createSupabaseServerClient();
  const { data: reservation } = await supabase
    .from("reservations")
    .select("id, host_id, tablet_id")
    .eq("id", reservationId)
    .single();

  if (!reservation || reservation.host_id !== hostId) {
    return { ok: false, error: "Reserva inválida." };
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      host_id: hostId,
      reservation_id: reservation.id,
      tablet_id: reservation.tablet_id,
      sender_type: "host",
      sender_id: profile.id,
      body: trimmed,
    })
    .select("id, body, sender_type, created_at")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erro" };

  revalidatePath("/dashboard/messages");
  return { ok: true, message: { ...data, sender_type: "host" } };
}

export async function markThreadRead(reservationId: string) {
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("reservation_id", reservationId)
    .eq("host_id", hostId)
    .eq("sender_type", "guest")
    .is("read_at", null);
  revalidatePath("/dashboard/messages");
}
