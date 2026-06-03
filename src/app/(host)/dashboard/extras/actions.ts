"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const extraSchema = z.object({
  id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().min(2).max(80),
  description: z.string().max(500).optional().or(z.literal("")),
  price: z.coerce.number().min(0).max(99_999),
  category: z.enum([
    "late_checkout",
    "breakfast",
    "transfer",
    "welcome_basket",
    "groceries",
    "custom",
  ]),
  active: z.string().optional(),
});

export async function saveExtra(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = extraSchema.safeParse({
    id: formData.get("id") || undefined,
    property_id: formData.get("property_id") ?? "",
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    category: formData.get("category"),
    active: formData.get("active") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    host_id: hostId,
    property_id: parsed.data.property_id || null,
    title: parsed.data.title,
    description: parsed.data.description || null,
    price: parsed.data.price,
    category: parsed.data.category,
    active: !!parsed.data.active,
  };

  let id = parsed.data.id;
  if (id) {
    const { error } = await supabase
      .from("extras")
      .update(payload)
      .eq("id", id)
      .eq("host_id", hostId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("extras")
      .insert(payload)
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: error?.message ?? "Erro" };
    id = data.id;
  }

  revalidatePath("/dashboard/extras");
  return { ok: true, id };
}

export async function deleteExtra(id: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("extras")
    .delete()
    .eq("id", id)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/extras");
  return { ok: true };
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function uploadExtraImage(
  extraId: string,
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Sem arquivo." };
  if (file.size > MAX_BYTES) return { ok: false, error: "Arquivo > 5 MB." };
  if (!ALLOWED.includes(file.type)) {
    return { ok: false, error: "Use JPG, PNG ou WebP." };
  }

  const admin = createSupabaseAdminClient();
  const { data: extra } = await admin
    .from("extras")
    .select("id, host_id")
    .eq("id", extraId)
    .maybeSingle();
  if (!extra || extra.host_id !== hostId) {
    return { ok: false, error: "Extra inválido." };
  }

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${hostId}/${extraId}-${Date.now()}.${ext}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("extras")
    .upload(key, buf, { contentType: file.type, upsert: true });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = admin.storage.from("extras").getPublicUrl(key);
  const publicUrl = pub.publicUrl;

  const { error: updErr } = await admin
    .from("extras")
    .update({ image_url: publicUrl })
    .eq("id", extraId)
    .eq("host_id", hostId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath("/dashboard/extras");
  return { ok: true, url: publicUrl };
}

export async function approveExtraOrder(orderId: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("extra_orders")
    .update({ status: "pending_payment" })
    .eq("id", orderId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/extras");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function markOrderPaid(orderId: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("extra_orders")
    .update({ status: "paid" })
    .eq("id", orderId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/extras");
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function cancelOrder(orderId: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("extra_orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/extras");
  return { ok: true };
}
