"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";

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
