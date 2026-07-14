import { requireRole } from "@/lib/auth";
import { HostSidebar } from "@/components/app/host-sidebar";
import { RealtimeRefresh } from "@/components/app/realtime-refresh";
import { initialOf } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUnreadNotificationCount } from "@/lib/data/notifications";
import { getUnreadDmCount } from "@/lib/data/chat";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["host_admin", "host_staff", "super_admin"]);

  let subtitle = "Anfitrião";
  let counts = { notifications: 0, teamChat: 0 };
  if (profile.host_id) {
    const supabase = await createSupabaseServerClient();
    const [{ count: propCount }, notifications, teamChat] = await Promise.all([
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("host_id", profile.host_id),
      getUnreadNotificationCount(profile.id),
      getUnreadDmCount(profile.id),
    ]);
    subtitle = `${propCount ?? 0} ${propCount === 1 ? "imóvel" : "imóveis"}`;
    counts = { notifications, teamChat };
  }

  return (
    <div className="flex min-h-svh bg-background">
      <RealtimeRefresh tables={["notifications", "staff_messages", "messages"]} />
      <HostSidebar
        user={{
          name: profile.full_name ?? "Anfitrião",
          subtitle,
          initial: initialOf(profile.full_name ?? profile.email),
        }}
        counts={counts}
      />
      <div className="flex-1 pb-12">{children}</div>
    </div>
  );
}
