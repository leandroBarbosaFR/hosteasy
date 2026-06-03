"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  LineChart,
  Building2,
  Tablet as TabletIcon,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(auth)/actions";

const NAV = [
  { href: "/dashboard", label: "Visão geral", Icon: LayoutDashboard },
  { href: "/dashboard/reservations", label: "Reservas", Icon: CalendarDays },
  { href: "/dashboard/messages", label: "Mensagens", Icon: MessageSquare },
  { href: "/dashboard/revenue", label: "Receita", Icon: LineChart },
  { href: "/dashboard/properties", label: "Imóveis", Icon: Building2 },
  { href: "/dashboard/tablets", label: "Tablets", Icon: TabletIcon },
  { href: "/dashboard/extras", label: "Extras", Icon: Sparkles },
  { href: "/dashboard/settings", label: "Ajustes", Icon: Settings },
];

export function HostSidebar({
  user,
}: {
  user: { name: string; subtitle: string; initial: string };
}) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-svh w-60 flex-col gap-1 bg-[#1c2247] p-4 text-white/90 md:flex">
      <div className="mb-4 flex items-center justify-between px-2 py-1">
        <span className="font-display text-base font-semibold">hosteasy</span>
        <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70">
          Anfitrião
        </span>
      </div>

      {NAV.map(({ href, label, Icon }) => {
        const active =
          href === "/dashboard"
            ? pathname === href
            : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              "hover:bg-white/10 hover:text-white",
              active
                ? "bg-white/10 font-medium text-white"
                : "text-white/70",
            )}
          >
            {active ? (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-0.5 -translate-x-[6px] -translate-y-1/2 rounded-full bg-primary"
              />
            ) : null}
            <Icon className="size-4" />
            {label}
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

      <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-white/5 px-3 py-2.5">
        <div className="grid size-8 place-items-center rounded-full bg-primary/30 text-xs font-semibold">
          {user.initial}
        </div>
        <div className="leading-tight">
          <p className="text-xs font-semibold">{user.name}</p>
          <p className="text-[10px] text-white/60">{user.subtitle}</p>
        </div>
      </div>
    </aside>
  );
}
