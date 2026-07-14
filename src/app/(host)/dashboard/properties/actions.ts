"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const propertySchema = z.object({
  name: z.string().min(2),
  unit_code: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
});

export async function createProperty(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = propertySchema.safeParse({
    name: formData.get("name"),
    unit_code: formData.get("unit_code") ?? "",
    address: formData.get("address") ?? "",
    city: formData.get("city") ?? "",
    state: formData.get("state") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("properties").insert({
    host_id: hostId,
    name: parsed.data.name,
    unit_code: parsed.data.unit_code || null,
    address: parsed.data.address || null,
    city: parsed.data.city || null,
    state: parsed.data.state || null,
    country: "BR",
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/properties");
  return { ok: true };
}

const MAX_COVER_BYTES = 5 * 1024 * 1024; // 5 MB
const COVER_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadPropertyCover(
  propertyId: string,
  formData: FormData,
): Promise<{ ok: boolean; url?: string; error?: string }> {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Sem arquivo." };
  if (file.size > MAX_COVER_BYTES) return { ok: false, error: "Arquivo > 5 MB." };
  if (!COVER_TYPES.includes(file.type)) {
    return { ok: false, error: "Use JPG, PNG ou WebP." };
  }

  const admin = createSupabaseAdminClient();
  const { data: property } = await admin
    .from("properties")
    .select("id, host_id")
    .eq("id", propertyId)
    .maybeSingle();
  if (!property || property.host_id !== hostId) {
    return { ok: false, error: "Imóvel inválido." };
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${hostId}/${propertyId}-${Date.now()}.${ext}`;
  const buf = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("properties")
    .upload(key, buf, { contentType: file.type, upsert: true });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = admin.storage.from("properties").getPublicUrl(key);
  const { error: updErr } = await admin
    .from("properties")
    .update({ cover_image_url: pub.publicUrl })
    .eq("id", propertyId)
    .eq("host_id", hostId);
  if (updErr) return { ok: false, error: updErr.message };

  revalidatePath(`/dashboard/properties/${propertyId}`);
  revalidatePath("/dashboard/properties");
  return { ok: true, url: pub.publicUrl };
}

export async function updateDefaultCleaner(
  propertyId: string,
  cleanerId: string | null,
) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();

  if (cleanerId) {
    const { data: member } = await supabase
      .from("host_members")
      .select("id")
      .eq("host_id", hostId)
      .eq("user_id", cleanerId)
      .maybeSingle();
    if (!member) return { ok: false, error: "Pessoa fora do seu time." };
  }

  const { error } = await supabase
    .from("properties")
    .update({ default_cleaner_id: cleanerId })
    .eq("id", propertyId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dashboard/properties/${propertyId}`);
  return { ok: true };
}

export async function assignTabletToProperty(
  propertyId: string,
  tabletCode: string,
) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const code = tabletCode.trim();
  if (!code) return { ok: false, error: "Código vazio." };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("tablets")
    .select("id, host_id")
    .eq("tablet_code", code)
    .maybeSingle();

  if (existing) {
    if (existing.host_id !== hostId) {
      return { ok: false, error: "Tablet pertence a outro anfitrião." };
    }
    const { error } = await supabase
      .from("tablets")
      .update({ property_id: propertyId })
      .eq("id", existing.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase.from("tablets").insert({
      host_id: hostId,
      property_id: propertyId,
      tablet_code: code,
    });
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/dashboard/properties");
  return { ok: true };
}
