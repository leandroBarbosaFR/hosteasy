import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseIcal, isBlockEvent, extractGuestName } from "@/lib/ical";
import { notifyHostAdmins } from "@/lib/notify";
import { ensureCleaningTask } from "@/lib/cleaning";
import { formatDate } from "@/lib/format";

export type SyncResult = {
  ok: boolean;
  error?: string;
  imported?: number;
  updated?: number;
};

// Pulls one iCal reservation source and upserts reservations keyed by
// (property_id, source_uid). New reservations notify every host admin so
// they can schedule a cleaner. Used both by the dashboard "Sincronizar"
// button and by the hourly cron.
export async function syncReservationSource(sourceId: string): Promise<SyncResult> {
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

    const { data: property } = await admin
      .from("properties")
      .select("name, unit_code")
      .eq("id", src.property_id)
      .maybeSingle();
    const propertyLabel = property
      ? `${property.name}${property.unit_code ? ` · ${property.unit_code}` : ""}`
      : "Imóvel";

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
        const { data: created, error: insErr } = await admin
          .from("reservations")
          .insert({
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
          })
          .select("id")
          .single();
        if (!insErr && created) {
          imported++;
          const cleaning = await ensureCleaningTask(created.id);
          const sourceLabel =
            src.source_type === "airbnb"
              ? "Airbnb"
              : src.source_type === "booking"
                ? "Booking.com"
                : "iCal";
          await notifyHostAdmins({
            hostId: src.host_id,
            type: "new_reservation",
            title: `Nova reserva ${sourceLabel}: ${guest}`,
            body: `${propertyLabel} · ${formatDate(checkIn)} → ${formatDate(checkOut)}. ${
              cleaning === "created"
                ? "Limpeza pós check-out já agendada automaticamente."
                : "Agendar limpeza pós check-out?"
            }`,
            entityType: "reservation",
            entityId: created.id,
            actionPath: "/dashboard/reservations",
          });
        }
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

// Sync every active source across all hosts. Used by the cron endpoint.
export async function syncAllActiveSources(): Promise<{
  total: number;
  succeeded: number;
  failed: number;
  imported: number;
}> {
  const admin = createSupabaseAdminClient();
  const { data: sources } = await admin
    .from("reservation_sources")
    .select("id")
    .eq("is_active", true);

  let succeeded = 0;
  let failed = 0;
  let imported = 0;
  for (const s of sources ?? []) {
    const r = await syncReservationSource(s.id);
    if (r.ok) {
      succeeded++;
      imported += r.imported ?? 0;
    } else {
      failed++;
    }
  }
  return { total: sources?.length ?? 0, succeeded, failed, imported };
}
