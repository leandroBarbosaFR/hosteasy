import { BellSlash as BellOff, Checks as CheckCheck } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { NotificationList } from "@/components/app/notification-list";
import { requireHostContext } from "@/lib/data/host";
import { listNotifications } from "@/lib/data/notifications";
import { markAllNotificationsRead } from "@/lib/actions/notifications";

export const metadata = { title: "Notificações · Hosteasy" };

export default async function NotificationsPage() {
  const { profile } = await requireHostContext();
  const notifications = await listNotifications(profile.id);
  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <>
      <AutoRefresh intervalMs={20_000} />
      <Topbar
        subtitle="Notificações"
        title={
          unreadCount > 0
            ? `${unreadCount} ${unreadCount === 1 ? "aviso novo" : "avisos novos"}`
            : "Tudo em dia"
        }
        actions={
          unreadCount > 0 ? (
            <form action={markAllNotificationsRead}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-foreground/80 shadow-sm hover:bg-muted/50"
              >
                <CheckCheck className="size-3.5" /> Marcar todas lidas
              </button>
            </form>
          ) : undefined
        }
      />

      <div className="px-6 pt-6 md:px-10">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<BellOff className="size-5" />}
            title="Nenhuma notificação"
            description="Novas reservas do Airbnb/Booking, alertas de estoque e pedidos aparecem aqui."
          />
        ) : (
          <NotificationList
            notifications={notifications}
            canScheduleCleaning={profile.role !== "host_staff"}
          />
        )}
      </div>
    </>
  );
}
