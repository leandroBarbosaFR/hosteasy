"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House as Home, ListChecks, Chats as MessagesSquare, Package, CalendarDots as CalendarDays, Receipt, SignOut as LogOut } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";

export function StaffBottomNav({
  pendingTaskCount,
  unreadChatCount = 0,
}: {
  pendingTaskCount: number;
  unreadChatCount?: number;
}) {
  const pathname = usePathname();

  const items: Array<{
    href: string;
    label: string;
    Icon: typeof Home;
    badge?: number;
  }> = [
    { href: "/staff", label: "Hoje", Icon: Home },
    { href: "/staff/tasks", label: "Tarefas", Icon: ListChecks, badge: pendingTaskCount },
    { href: "/staff/chat", label: "Chat", Icon: MessagesSquare, badge: unreadChatCount },
    { href: "/staff/stock", label: "Estoque", Icon: Package },
    { href: "/staff/bookings", label: "Reservas", Icon: CalendarDays },
    { href: "/staff/payments", label: "Pedidos", Icon: Receipt },
  ];

  return (
    <>
      {/* Phone — floating bottom pill */}
      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around gap-1 rounded-full border border-white/40 bg-white/80 px-2 py-1.5 shadow-xl shadow-black/10 backdrop-blur-2xl md:hidden">
        {items.map(({ href, label, Icon, badge }) => {
          const active = href === "/staff" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] transition-colors",
                active
                  ? "bg-foreground/90 text-white"
                  : "text-foreground/70 hover:bg-white/60",
              )}
            >
              <Icon className="size-4" />
              {label}
              {badge ? (
                <span className="absolute -top-0.5 right-2 grid min-w-[16px] place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      {/* Tablet / desktop — left sidebar */}
      <aside className="sticky top-0 hidden h-svh w-56 flex-col gap-1 bg-[#1c2247] p-4 text-white/90 md:flex">
        <div className="mb-4 flex items-center justify-between px-2 py-1">
          <span className="font-display text-base font-bold">hosteasy</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
            Equipe
          </span>
        </div>

        {items.map(({ href, label, Icon, badge }) => {
          const active = href === "/staff" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                "hover:bg-white/10 hover:text-white",
                active ? "bg-white/10 font-medium text-white" : "text-white/70",
              )}
            >
              {active ? (
                <span
                  aria-hidden
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-x-[6px] -translate-y-1/2 rounded-full bg-primary"
                />
              ) : null}
              <Icon className="size-4 shrink-0" />
              <span className="flex-1">{label}</span>
              {badge ? (
                <span className="grid min-w-[18px] place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {badge}
                </span>
              ) : null}
            </Link>
          );
        })}

        <form action={logoutAction} className="mt-auto">
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Sair
          </button>
        </form>
      </aside>
    </>
  );
}
