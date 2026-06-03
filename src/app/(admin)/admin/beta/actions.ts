"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function setHostBeta(hostId: string, enabled: boolean) {
  await requireRole(["super_admin"]);
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("hosts")
    .update({ beta_test: enabled })
    .eq("id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/beta");
  revalidatePath(`/admin/hosts/${hostId}`);
  return { ok: true };
}

export async function setPropertyBeta(propertyId: string, enabled: boolean) {
  await requireRole(["super_admin"]);
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("properties")
    .update({ beta_test: enabled })
    .eq("id", propertyId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/beta");
  return { ok: true };
}
