import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Notification } from "@/types/db";

export async function getUnreadNotificationCount(
  userId: string,
): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);
  return count ?? 0;
}

export async function listNotifications(
  userId: string,
  limit = 50,
): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as Notification[];
}
