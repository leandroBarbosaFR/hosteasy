"use server";

import { revalidatePath } from "next/cache";
import { requireStaffContext } from "@/lib/data/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Shared by /dashboard/team (host side) and /staff/chat (worker side).
export async function sendStaffMessage(
  recipientId: string,
  body: string,
): Promise<{
  ok: boolean;
  error?: string;
  message?: { id: string; body: string; sender_id: string; created_at: string };
}> {
  const { profile, hostId } = await requireStaffContext();
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Mensagem vazia." };
  if (trimmed.length > 2000) return { ok: false, error: "Mensagem muito longa." };
  if (recipientId === profile.id) {
    return { ok: false, error: "Não dá pra falar consigo mesmo." };
  }

  const supabase = await createSupabaseServerClient();

  // Friendly pre-check; RLS enforces the same rule in the database.
  const { data: member } = await supabase
    .from("host_members")
    .select("id")
    .eq("host_id", hostId)
    .eq("user_id", recipientId)
    .maybeSingle();
  if (!member) return { ok: false, error: "Destinatário fora do seu time." };

  const { data, error } = await supabase
    .from("staff_messages")
    .insert({
      host_id: hostId,
      sender_id: profile.id,
      recipient_id: recipientId,
      body: trimmed,
    })
    .select("id, body, sender_id, created_at")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erro" };

  revalidatePath("/dashboard/team");
  revalidatePath("/staff/chat");
  return { ok: true, message: data };
}

export async function markDmThreadRead(otherUserId: string) {
  const { profile, hostId } = await requireStaffContext();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("staff_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("host_id", hostId)
    .eq("sender_id", otherUserId)
    .eq("recipient_id", profile.id)
    .is("read_at", null);
  revalidatePath("/dashboard/team");
  revalidatePath("/staff/chat");
}
