"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createHostForCurrentUser(name: string) {
  const profile = await requireProfile();
  if (profile.host_id) redirect("/dashboard");

  // Initial provisioning is server-trusted: we already verified the user via
  // requireProfile and only mutate rows belonging to them, so use the admin
  // client and bypass RLS (which forbids non-super-admin host inserts).
  const admin = createSupabaseAdminClient();

  const { data: host, error } = await admin
    .from("hosts")
    .insert({ name, owner_id: profile.id })
    .select("id")
    .single();
  if (error || !host) {
    throw new Error(error?.message ?? "Falha ao criar host.");
  }

  await admin
    .from("profiles")
    .update({ host_id: host.id, role: "host_admin" })
    .eq("id", profile.id);

  await admin.from("host_members").insert({
    host_id: host.id,
    user_id: profile.id,
    role: "host_admin",
  });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
