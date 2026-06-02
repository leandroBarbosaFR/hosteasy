"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const createSchema = z.object({
  tablet_code: z.string().min(2).max(40),
  property_id: z.string().uuid().optional().or(z.literal("")),
});

export async function createTablet(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = createSchema.safeParse({
    tablet_code: formData.get("tablet_code"),
    property_id: formData.get("property_id") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("tablets")
    .select("id, host_id")
    .eq("tablet_code", parsed.data.tablet_code)
    .maybeSingle();
  if (existing) {
    return { ok: false, error: "Já existe um tablet com esse código." };
  }
  const { error } = await supabase.from("tablets").insert({
    host_id: hostId,
    property_id: parsed.data.property_id || null,
    tablet_code: parsed.data.tablet_code,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/tablets");
  return { ok: true };
}

const updateSchema = z.object({
  id: z.string().uuid(),
  property_id: z.string().uuid().optional().or(z.literal("")),
  status: z.enum(["online", "offline", "maintenance"]).optional(),
});

export async function updateTablet(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    property_id: formData.get("property_id") ?? "",
    status: formData.get("status") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const patch: Record<string, unknown> = {};
  if (parsed.data.property_id !== undefined) {
    patch.property_id = parsed.data.property_id || null;
  }
  if (parsed.data.status) patch.status = parsed.data.status;

  const { error } = await supabase
    .from("tablets")
    .update(patch)
    .eq("id", parsed.data.id)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/tablets");
  revalidatePath(`/dashboard/tablets/${parsed.data.id}`);
  return { ok: true };
}

export async function rotateTabletCode(id: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  // Generate a new code: TAB-<6 hex chars>
  const hex = Math.random().toString(16).slice(2, 8).toUpperCase().padEnd(6, "0");
  const newCode = `TAB-${hex}`;
  const { error } = await supabase
    .from("tablets")
    .update({ tablet_code: newCode })
    .eq("id", id)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };

  // Invalidate any guest stays tied to this tablet — they reference tablet_id
  // not tablet_code, so technically nothing to do, but mark them inactive
  // so an in-flight guest can't keep poking the old URL.
  await supabase
    .from("guest_stays")
    .update({ active: false })
    .eq("tablet_id", id);

  revalidatePath("/dashboard/tablets");
  revalidatePath(`/dashboard/tablets/${id}`);
  return { ok: true, code: newCode };
}

export async function deleteTablet(id: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Apenas admins podem excluir." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("tablets")
    .delete()
    .eq("id", id)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/tablets");
  return { ok: true };
}
