import { requireRole } from "@/lib/auth";
import { StaffBottomNav } from "@/components/app/staff-bottom-nav";
import { RealtimeRefresh } from "@/components/app/realtime-refresh";
import { getMyPendingTaskCount } from "@/lib/data/staff";
import { getUnreadDmCount } from "@/lib/data/chat";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["host_staff", "host_admin", "super_admin"]);
  const [pendingCount, unreadChat] = await Promise.all([
    getMyPendingTaskCount(profile.id),
    getUnreadDmCount(profile.id),
  ]);

  return (
    <div className="flex min-h-svh bg-background">
      <RealtimeRefresh
        tables={["notifications", "staff_messages", "staff_tasks", "staff_task_comments"]}
      />
      <StaffBottomNav
        pendingTaskCount={pendingCount}
        unreadChatCount={unreadChat}
      />
      <main className="flex-1 pb-28 md:pb-12">{children}</main>
    </div>
  );
}
