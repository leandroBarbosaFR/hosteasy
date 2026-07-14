import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffMessage, WorkerSpecialty } from "@/types/db";

export type TeamContact = {
  userId: string;
  name: string;
  email: string | null;
  role: "host_admin" | "host_staff";
  specialty: WorkerSpecialty;
  unreadCount: number;
  lastMessage: Pick<StaffMessage, "body" | "created_at" | "sender_id"> | null;
};

// Everyone in the host except the viewer, with per-contact unread counts and
// last-message previews for the conversation list.
export async function listTeamContacts(
  hostId: string,
  selfId: string,
): Promise<TeamContact[]> {
  const supabase = await createSupabaseServerClient();

  const [{ data: members }, { data: recent }, { data: unread }] =
    await Promise.all([
      supabase
        .from("host_members")
        .select("user_id, role, specialty, profiles:user_id(full_name, email)")
        .eq("host_id", hostId)
        .order("created_at", { ascending: true }),
      supabase
        .from("staff_messages")
        .select("sender_id, recipient_id, body, created_at")
        .eq("host_id", hostId)
        .or(`sender_id.eq.${selfId},recipient_id.eq.${selfId}`)
        .order("created_at", { ascending: false })
        .limit(300),
      supabase
        .from("staff_messages")
        .select("sender_id")
        .eq("host_id", hostId)
        .eq("recipient_id", selfId)
        .is("read_at", null),
    ]);

  const unreadBySender = new Map<string, number>();
  for (const m of unread ?? []) {
    unreadBySender.set(m.sender_id, (unreadBySender.get(m.sender_id) ?? 0) + 1);
  }

  const lastByContact = new Map<
    string,
    Pick<StaffMessage, "body" | "created_at" | "sender_id">
  >();
  for (const m of recent ?? []) {
    const other = m.sender_id === selfId ? m.recipient_id : m.sender_id;
    if (!lastByContact.has(other)) {
      lastByContact.set(other, {
        body: m.body,
        created_at: m.created_at,
        sender_id: m.sender_id,
      });
    }
  }

  return (members ?? [])
    .filter((m) => m.user_id !== selfId)
    .map((m) => {
      const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
      return {
        userId: m.user_id,
        name:
          (profile as { full_name?: string | null } | null)?.full_name ??
          (profile as { email?: string | null } | null)?.email ??
          "Membro",
        email: (profile as { email?: string | null } | null)?.email ?? null,
        role: m.role as "host_admin" | "host_staff",
        specialty: (m.specialty ?? "general") as WorkerSpecialty,
        unreadCount: unreadBySender.get(m.user_id) ?? 0,
        lastMessage: lastByContact.get(m.user_id) ?? null,
      };
    })
    .sort(
      (a, b) =>
        (b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0) -
        (a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0),
    );
}

export async function getDmThread(
  hostId: string,
  selfId: string,
  otherId: string,
): Promise<StaffMessage[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("staff_messages")
    .select("*")
    .eq("host_id", hostId)
    .or(
      `and(sender_id.eq.${selfId},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${selfId})`,
    )
    .order("created_at", { ascending: true })
    .limit(500);
  return (data ?? []) as StaffMessage[];
}

// Total unread DMs for the nav badges.
export async function getUnreadDmCount(selfId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("staff_messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", selfId)
    .is("read_at", null);
  return count ?? 0;
}
