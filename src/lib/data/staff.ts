import "server-only";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Profile, StaffTask } from "@/types/db";

// A staff or host_admin user who is associated with a host. Used by both
// /dashboard and /staff routes that need scoped data.
export async function requireStaffContext(): Promise<{
  profile: Profile;
  hostId: string;
}> {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.host_id) redirect("/dashboard/setup");
  return { profile, hostId: profile.host_id };
}

// Pending-task badge count for the current user. Used by the sidebars.
export async function getMyPendingTaskCount(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("staff_tasks")
    .select("id", { count: "exact", head: true })
    .eq("assignee_id", userId)
    .in("status", ["pending", "in_progress", "blocked"]);
  return count ?? 0;
}

// Today's task slice (assigned to me OR all if host_admin), sorted by
// due_at then priority. Used on /staff home and /dashboard/tasks.
export type TaskListItem = StaffTask & {
  property_name: string | null;
  assignee_name: string | null;
};

export async function listTasks(opts: {
  hostId: string;
  scope: "mine" | "all"; // mine: assignee_id = me; all: host scope (admin)
  userId: string;
  statuses?: StaffTask["status"][];
}): Promise<TaskListItem[]> {
  const supabase = await createSupabaseServerClient();

  let q = supabase
    .from("staff_tasks")
    .select(
      "*, properties(name, unit_code), assignee:assignee_id(full_name, email)",
    )
    .eq("host_id", opts.hostId)
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (opts.scope === "mine") {
    q = q.eq("assignee_id", opts.userId);
  }
  if (opts.statuses && opts.statuses.length > 0) {
    q = q.in("status", opts.statuses);
  }

  const { data } = await q;
  return (data ?? []).map((row) => {
    const r = row as unknown as StaffTask & {
      properties: { name?: string; unit_code?: string | null } | { name?: string }[] | null;
      assignee: { full_name?: string | null; email?: string | null } | { full_name?: string | null; email?: string | null }[] | null;
    };
    const propertyRel = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const assigneeRel = Array.isArray(r.assignee) ? r.assignee[0] : r.assignee;
    return {
      ...(r as StaffTask),
      property_name: propertyRel?.name ?? null,
      assignee_name: assigneeRel?.full_name ?? assigneeRel?.email ?? null,
    };
  });
}
