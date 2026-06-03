"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseIcal, isBlockEvent, extractGuestName } from "@/lib/ical";

const addSchema = z.object({
  property_id: z.string().uuid(),
  source_type: z.enum(["airbnb", "booking", "other"]),
  ical_url: z
    .string()
    .url()
    .refine(
      (u) => u.endsWith(".ics") || u.includes("calendar") || u.includes("ical"),
      { message: "URL deve apontar para um .ics" },
    ),
  source_name: z.string().optional().or(z.literal("")),
});

export async function addReservationSource(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = addSchema.safeParse({
    property_id: formData.get("property_id"),
    source_type: formData.get("source_type"),
    ical_url: formData.get("ical_url"),
    source_name: formData.get("source_name") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  const supabase = await createSupabaseServerClient();
  // Verify the property belongs to this host (RLS would block otherwise).
  const { data: prop } = await supabase
    .from("properties")
    .select("id, host_id")
    .eq("id", parsed.data.property_id)
    .eq("host_id", hostId)
    .maybeSingle();
  if (!prop) return { ok: false, error: "Imóvel não encontrado." };

  const { data: source, error } = await supabase
    .from("reservation_sources")
    .insert({
      host_id: hostId,
      property_id: parsed.data.property_id,
      source_type: parsed.data.source_type,
      source_name: parsed.data.source_name || null,
      ical_url: parsed.data.ical_url,
      is_active: true,
    })
    .select("id")
    .single();
  if (error || !source) {
    return {
      ok: false,
      error: error?.message?.includes("ux_reservation_sources_url")
        ? "Essa URL já está conectada."
        : error?.message ?? "Erro ao adicionar.",
    };
  }

  // Immediate first sync — gives the host instant feedback.
  await syncReservationSourceInternal(source.id);
  revalidatePath(`/dashboard/properties/${parsed.data.property_id}`);
  return { ok: true, id: source.id };
}

export async function syncReservationSource(sourceId: string) {
  await requireHostContext();
  const result = await syncReservationSourceInternal(sourceId);
  return result;
}

export async function deleteReservationSource(sourceId: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: src } = await supabase
    .from("reservation_sources")
    .select("property_id")
    .eq("id", sourceId)
    .eq("host_id", hostId)
    .maybeSingle();
  const { error } = await supabase
    .from("reservation_sources")
    .delete()
    .eq("id", sourceId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  if (src?.property_id) {
    revalidatePath(`/dashboard/properties/${src.property_id}`);
  }
  return { ok: true };
}

async function syncReservationSourceInternal(sourceId: string) {
  // Admin client because this updates reservations across the host's
  // tables in one transaction-like flow; RLS would block tablet_id+
  // status flips done atomically.
  const admin = createSupabaseAdminClient();

  const { data: src } = await admin
    .from("reservation_sources")
    .select("*")
    .eq("id", sourceId)
    .maybeSingle();
  if (!src) return { ok: false, error: "Fonte não encontrada." };

  try {
    const res = await fetch(src.ical_url, {
      headers: { "User-Agent": "Hosteasy/1.0 (+https://hosteasy.com.br)" },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) {
      throw new Error("Resposta não é um arquivo iCal válido.");
    }
    const events = parseIcal(text);

    let imported = 0;
    let updated = 0;
    for (const ev of events) {
      if (isBlockEvent(ev.summary)) continue;
      const guest = extractGuestName(ev.summary, src.source_type);

      // The end date in VALUE=DATE iCal events is exclusive per RFC, so it
      // already matches our check_out (the date the guest leaves).
      const checkIn = ev.start;
      const checkOut = ev.end;
      if (checkOut <= checkIn) continue;

      // Find existing reservation by (property_id, source_uid)
      const { data: existing } = await admin
        .from("reservations")
        .select("id, status")
        .eq("property_id", src.property_id)
        .eq("source_uid", ev.uid)
        .maybeSingle();

      if (existing) {
        await admin
          .from("reservations")
          .update({
            check_in: checkIn,
            check_out: checkOut,
            guest_name: guest,
            last_synced_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        updated++;
      } else {
        const sourceForReservation =
          src.source_type === "airbnb" || src.source_type === "booking"
            ? src.source_type
            : "other";
        const { error: insErr } = await admin.from("reservations").insert({
          host_id: src.host_id,
          property_id: src.property_id,
          guest_name: guest,
          check_in: checkIn,
          check_out: checkOut,
          amount: 0,
          status: "confirmed",
          source: sourceForReservation,
          source_uid: ev.uid,
          source_reservation_id: ev.uid,
          imported_from_ical: true,
          last_synced_at: new Date().toISOString(),
        });
        if (!insErr) imported++;
      }
    }

    await admin
      .from("reservation_sources")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "success",
        last_sync_error: null,
      })
      .eq("id", sourceId);

    revalidatePath(`/dashboard/properties/${src.property_id}`);
    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard");
    return { ok: true, imported, updated };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido.";
    await admin
      .from("reservation_sources")
      .update({
        last_synced_at: new Date().toISOString(),
        last_sync_status: "error",
        last_sync_error: message,
      })
      .eq("id", sourceId);
    return { ok: false, error: message };
  }
}
