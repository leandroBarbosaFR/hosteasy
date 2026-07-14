"use server";

import { revalidatePath } from "next/cache";
import { requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const NOTIFICATION_PATHS = ["/dashboard/notifications", "/dashboard", "/staff"];

export async function markNotificationRead(id: string) {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", profile.id)
    .is("read_at", null);
  for (const p of NOTIFICATION_PATHS) revalidatePath(p);
}

export async function markAllNotificationsRead() {
  const profile = await requireProfile();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", profile.id)
    .is("read_at", null);
  for (const p of NOTIFICATION_PATHS) revalidatePath(p);
}
