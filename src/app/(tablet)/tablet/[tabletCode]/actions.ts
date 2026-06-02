"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const heartbeatSchema = z.object({
  battery_percent: z.number().int().min(0).max(100).nullable().optional(),
  wifi_status: z.string().max(40).nullable().optional(),
  online: z.boolean().optional(),
});

// Called by the tablet PWA every ~60 seconds. Updates last_seen_at and any
// device telemetry the browser exposed. Never overrides a manually-set
// 'maintenance' status — that's the host's intent.
export async function recordTabletHeartbeat(
  tabletCode: string,
  payload: z.infer<typeof heartbeatSchema>,
): Promise<{ ok: boolean }> {
  const parsed = heartbeatSchema.safeParse(payload);
  if (!parsed.success) return { ok: false };

  const admin = createSupabaseAdminClient();
  const { data: tablet } = await admin
    .from("tablets")
    .select("id, status")
    .eq("tablet_code", tabletCode)
    .maybeSingle();
  if (!tablet) return { ok: false };

  const patch: Record<string, unknown> = {
    last_seen_at: new Date().toISOString(),
  };
  if (parsed.data.battery_percent != null) {
    patch.battery_percent = parsed.data.battery_percent;
  }
  if (parsed.data.wifi_status != null) {
    patch.wifi_status = parsed.data.wifi_status;
  }
  if (tablet.status !== "maintenance") {
    patch.status = parsed.data.online === false ? "offline" : "online";
  }

  await admin.from("tablets").update(patch).eq("id", tablet.id);
  return { ok: true };
}

async function resolveTablet(tabletCode: string) {
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("tablets")
    .select("id, host_id")
    .eq("tablet_code", tabletCode)
    .maybeSingle();
  return data ? { tablet: data, admin } : null;
}

async function resolveActiveReservation(tabletCode: string) {
  const ctx = await resolveTablet(tabletCode);
  if (!ctx) return null;
  const { data: reservation } = await ctx.admin
    .from("reservations")
    .select("id, host_id")
    .eq("tablet_id", ctx.tablet.id)
    .in("status", ["confirmed", "in_stay"])
    .order("check_in", { ascending: true })
    .limit(1)
    .maybeSingle();
  return reservation ? { ...ctx, reservation } : { ...ctx, reservation: null };
}

export async function sendGuestMessage(
  tabletCode: string,
  body: string,
): Promise<{
  ok: boolean;
  error?: string;
  message?: { id: string; body: string; sender_type: "guest"; created_at: string };
}> {
  const trimmed = body.trim();
  if (!trimmed) return { ok: false, error: "Mensagem vazia." };
  if (trimmed.length > 2000) return { ok: false, error: "Mensagem muito longa." };

  const ctx = await resolveActiveReservation(tabletCode);
  if (!ctx) return { ok: false, error: "Tablet inválido." };
  if (!ctx.reservation) {
    return { ok: false, error: "Sem estadia ativa neste tablet." };
  }

  const { data, error } = await ctx.admin
    .from("messages")
    .insert({
      host_id: ctx.reservation.host_id,
      reservation_id: ctx.reservation.id,
      tablet_id: ctx.tablet.id,
      sender_type: "guest",
      body: trimmed,
    })
    .select("id, body, sender_type, created_at")
    .single();
  if (error || !data) return { ok: false, error: error?.message ?? "Erro" };

  revalidatePath(`/tablet/${tabletCode}/contact`);
  return { ok: true, message: { ...data, sender_type: "guest" } };
}

export async function orderExtra(
  tabletCode: string,
  extraId: string,
  quantity = 1,
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await resolveActiveReservation(tabletCode);
  if (!ctx) return { ok: false, error: "Tablet inválido." };
  if (!ctx.reservation) {
    return { ok: false, error: "Sem estadia ativa neste tablet." };
  }

  const { data: extra } = await ctx.admin
    .from("extras")
    .select("id, price, host_id, title")
    .eq("id", extraId)
    .maybeSingle();
  if (!extra || extra.host_id !== ctx.reservation.host_id) {
    return { ok: false, error: "Extra inválido." };
  }

  const { error } = await ctx.admin.from("extra_orders").insert({
    host_id: extra.host_id,
    reservation_id: ctx.reservation.id,
    extra_id: extra.id,
    quantity,
    total: Number(extra.price) * quantity,
    status: "pending",
  });
  if (error) return { ok: false, error: error.message };

  // Also drop a system message so the host sees it in the inbox.
  await ctx.admin.from("messages").insert({
    host_id: extra.host_id,
    reservation_id: ctx.reservation.id,
    tablet_id: ctx.tablet.id,
    sender_type: "system",
    body: `Pedido novo: ${extra.title} (x${quantity}).`,
  });

  revalidatePath(`/tablet/${tabletCode}/extras`);
  return { ok: true };
}

const settingsSchema = z.object({
  language: z.string().min(2).max(8),
  volume: z.coerce.number().min(0).max(100),
  brightness: z.coerce.number().min(0).max(100),
  notifications: z.coerce.boolean().optional().default(false),
});

export async function updateTabletSettings(
  tabletCode: string,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const ctx = await resolveTablet(tabletCode);
  if (!ctx) return { ok: false, error: "Tablet inválido." };

  const parsed = settingsSchema.safeParse({
    language: formData.get("language"),
    volume: formData.get("volume"),
    brightness: formData.get("brightness"),
    notifications: formData.get("notifications") === "on",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  const { error } = await ctx.admin
    .from("tablets")
    .update({ settings: parsed.data })
    .eq("id", ctx.tablet.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/tablet/${tabletCode}/settings`);
  return { ok: true };
}
