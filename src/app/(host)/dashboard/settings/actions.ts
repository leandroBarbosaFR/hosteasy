"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function changePassword(formData: FormData) {
  const password = (formData.get("password") as string) ?? "";
  if (password.length < 6) return { ok: false, error: "Mínimo 6 caracteres." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function updateProfileName(formData: FormData) {
  const profile = await requireProfile();
  const name = ((formData.get("full_name") as string) ?? "").trim();
  if (name.length < 2) return { ok: false, error: "Nome muito curto." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: name })
    .eq("id", profile.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["host_admin", "host_staff"]),
});

export async function inviteMember(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Apenas admins podem convidar." };
  }
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "host_staff",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  // Use the admin client to invite the user via Supabase Auth.
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { invited_to_host: hostId, invited_role: parsed.data.role },
    },
  );
  if (error || !data.user) return { ok: false, error: error?.message ?? "Falha." };

  await admin
    .from("profiles")
    .update({ host_id: hostId, role: parsed.data.role })
    .eq("id", data.user.id);

  await admin.from("host_members").insert({
    host_id: hostId,
    user_id: data.user.id,
    role: parsed.data.role,
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function removeMember(memberId: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("host_members")
    .delete()
    .eq("id", memberId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

const templateSchema = z.object({
  title: z.string().min(2),
  body: z.string().min(2),
  type: z.string().optional().or(z.literal("")),
});

export async function saveMessageTemplate(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = templateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    type: formData.get("type") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("message_templates").insert({
    host_id: hostId,
    title: parsed.data.title,
    body: parsed.data.body,
    type: parsed.data.type || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
