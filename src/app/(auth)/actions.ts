"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { dashboardPathForRole } from "@/lib/auth";

const credentialsSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const signupSchema = credentialsSchema.extend({
  fullName: z.string().min(2, "Diga seu nome"),
  hostName: z.string().min(2, "Diga o nome do seu negócio").optional(),
});

const emailOnlySchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const passwordSchema = z.object({
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

export type ActionState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    "http://localhost:3000"
  );
}

export async function loginAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return { ok: false, error: "E-mail ou senha incorretos." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .single();

  const next = (formData.get("next") as string | null) ?? null;
  const target = next && next.startsWith("/")
    ? next
    : dashboardPathForRole(profile?.role ?? "host_admin");

  revalidatePath("/", "layout");
  redirect(target);
}

export async function signupAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    hostName: formData.get("hostName") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${siteUrl()}/auth/callback`,
    },
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  // If email confirmations are disabled, a session is returned immediately —
  // create the host and link the profile right now. We use the admin client
  // because RLS blocks host inserts for everyone except super_admin; this is
  // a server-trusted provisioning flow tied to the just-signed-up user.
  if (data.user && data.session) {
    const admin = createSupabaseAdminClient();

    const { data: host } = await admin
      .from("hosts")
      .insert({
        name: parsed.data.hostName ?? parsed.data.fullName,
        owner_id: data.user.id,
      })
      .select("id")
      .single();

    if (host) {
      await admin
        .from("profiles")
        .update({
          full_name: parsed.data.fullName,
          host_id: host.id,
          role: "host_admin",
        })
        .eq("id", data.user.id);

      await admin.from("host_members").insert({
        host_id: host.id,
        user_id: data.user.id,
        role: "host_admin",
      });
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
  }

  return {
    ok: true,
    message:
      "Conta criada. Confira seu e-mail para confirmar e depois entre.",
  };
}

export async function forgotPasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "E-mail inválido" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    { redirectTo: `${siteUrl()}/auth/callback?next=/reset-password` },
  );
  if (error) {
    return { ok: false, error: error.message };
  }
  return {
    ok: true,
    message:
      "Se houver uma conta com esse e-mail, mandamos um link para criar nova senha.",
  };
}

export async function resetPasswordAction(
  _prev: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const parsed = passwordSchema.safeParse({ password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Senha inválida" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
