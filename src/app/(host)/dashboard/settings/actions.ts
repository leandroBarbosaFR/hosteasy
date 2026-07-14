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
  specialty: z
    .enum([
      "cleaning",
      "maintenance",
      "painting",
      "laundry",
      "gardening",
      "pool",
      "general",
    ])
    .default("general"),
});

export async function inviteMember(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Apenas admins podem convidar." };
  }
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") ?? "host_staff",
    specialty: formData.get("specialty") || "general",
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
    specialty: parsed.data.specialty,
  });

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function updateMemberSpecialty(memberId: string, specialty: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = inviteSchema.shape.specialty.safeParse(specialty);
  if (!parsed.success) return { ok: false, error: "Especialidade inválida." };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("host_members")
    .update({ specialty: parsed.data })
    .eq("id", memberId)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard/team");
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

const pixSchema = z.object({
  pix_key: z.string().max(140).optional().or(z.literal("")),
  pix_instructions: z.string().max(500).optional().or(z.literal("")),
});

export async function updateHostPix(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = pixSchema.safeParse({
    pix_key: formData.get("pix_key") ?? "",
    pix_instructions: formData.get("pix_instructions") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("hosts")
    .update({
      pix_key: parsed.data.pix_key || null,
      pix_instructions: parsed.data.pix_instructions || null,
    })
    .eq("id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

const notifySchema = z.object({
  whatsapp_number: z.string().max(20).optional().or(z.literal("")),
  notify_email: z.string().optional(),
  notify_whatsapp: z.string().optional(),
});

export async function updateHostNotifications(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role !== "host_admin" && profile.role !== "super_admin") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = notifySchema.safeParse({
    whatsapp_number: formData.get("whatsapp_number") ?? "",
    notify_email: formData.get("notify_email") || undefined,
    notify_whatsapp: formData.get("notify_whatsapp") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  const digits = (parsed.data.whatsapp_number ?? "").replace(/\D/g, "");
  if (digits && (digits.length < 10 || digits.length > 15)) {
    return { ok: false, error: "Número de WhatsApp inválido (use DDI+DDD+número)." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("hosts")
    .update({
      whatsapp_number: digits || null,
      notify_email: !!parsed.data.notify_email,
      notify_whatsapp: !!parsed.data.notify_whatsapp,
    })
    .eq("id", hostId);
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
