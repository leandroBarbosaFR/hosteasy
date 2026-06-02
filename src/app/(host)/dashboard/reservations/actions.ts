"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  property_id: z.string().uuid(),
  guest_name: z.string().min(2),
  guest_email: z.string().email().optional().or(z.literal("")),
  guest_phone: z.string().optional().or(z.literal("")),
  check_in: z.string(),
  check_out: z.string(),
  amount: z.coerce.number().min(0),
  source: z.enum(["airbnb", "booking", "manual", "other"]).default("manual"),
});

export async function createReservation(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }

  const parsed = schema.safeParse({
    property_id: formData.get("property_id"),
    guest_name: formData.get("guest_name"),
    guest_email: formData.get("guest_email") ?? "",
    guest_phone: formData.get("guest_phone") ?? "",
    check_in: formData.get("check_in"),
    check_out: formData.get("check_out"),
    amount: formData.get("amount") ?? 0,
    source: (formData.get("source") as string) ?? "manual",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("reservations").insert({
    host_id: hostId,
    property_id: parsed.data.property_id,
    guest_name: parsed.data.guest_name,
    guest_email: parsed.data.guest_email || null,
    guest_phone: parsed.data.guest_phone || null,
    check_in: parsed.data.check_in,
    check_out: parsed.data.check_out,
    amount: parsed.data.amount,
    source: parsed.data.source,
    status: "confirmed",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/reservations");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateReservationStatus(
  id: string,
  status: "confirmed" | "in_stay" | "checked_out" | "cancelled",
) {
  await requireHostContext();
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/reservations");
  return { ok: true };
}
