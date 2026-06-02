"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const hostSchema = z.object({
  name: z.string().min(2),
  owner_email: z.string().email().optional().or(z.literal("")),
  plan: z.string().optional().or(z.literal("")),
});

export async function createHostAsAdmin(formData: FormData) {
  await requireRole(["super_admin"]);
  const parsed = hostSchema.safeParse({
    name: formData.get("name"),
    owner_email: formData.get("owner_email") ?? "",
    plan: formData.get("plan") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  const admin = createSupabaseAdminClient();

  let ownerId: string | null = null;
  if (parsed.data.owner_email) {
    const { data } = await admin.auth.admin.inviteUserByEmail(
      parsed.data.owner_email,
    );
    ownerId = data?.user?.id ?? null;
  }

  const { data: host, error } = await admin
    .from("hosts")
    .insert({
      name: parsed.data.name,
      owner_id: ownerId,
      plan: parsed.data.plan || "free",
      status: "active",
    })
    .select("id")
    .single();
  if (error || !host) return { ok: false, error: error?.message ?? "Falha" };

  if (ownerId) {
    await admin
      .from("profiles")
      .update({ host_id: host.id, role: "host_admin" })
      .eq("id", ownerId);
    await admin.from("host_members").insert({
      host_id: host.id,
      user_id: ownerId,
      role: "host_admin",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/hosts");
  return { ok: true, id: host.id };
}

export async function setHostStatus(id: string, status: string) {
  await requireRole(["super_admin"]);
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("hosts").update({ status }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/admin/hosts/${id}`);
  revalidatePath("/admin/hosts");
  return { ok: true };
}
