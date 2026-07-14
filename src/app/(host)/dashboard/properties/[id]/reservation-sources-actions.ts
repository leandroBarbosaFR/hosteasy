"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { syncReservationSource as runSync } from "@/lib/sync";

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

// Wraps the shared sync engine (src/lib/sync.ts) with the cache revalidation
// the dashboard needs after a manual sync.
async function syncReservationSourceInternal(sourceId: string) {
  const result = await runSync(sourceId);
  if (result.ok) {
    const supabase = await createSupabaseServerClient();
    const { data: src } = await supabase
      .from("reservation_sources")
      .select("property_id")
      .eq("id", sourceId)
      .maybeSingle();
    if (src?.property_id) {
      revalidatePath(`/dashboard/properties/${src.property_id}`);
    }
    revalidatePath("/dashboard/reservations");
    revalidatePath("/dashboard");
  }
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
