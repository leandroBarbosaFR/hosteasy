"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Bell, CalendarPlus, Package, Chat as MessageSquare, Sparkle as Sparkles, WarningCircle as AlertCircle, ListChecks, Check } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { markNotificationRead } from "@/lib/actions/notifications";
import { createCleaningFromReservation } from "@/app/(staff)/staff/actions";
import type { Notification, NotificationType } from "@/types/db";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  new_reservation: CalendarPlus,
  low_stock: Package,
  new_order: Sparkles,
  guest_message: MessageSquare,
  task_assigned: ListChecks,
  sync_error: AlertCircle,
  other: Bell,
};

export function NotificationList({
  notifications,
  canScheduleCleaning,
}: {
  notifications: Notification[];
  canScheduleCleaning: boolean;
}) {
  return (
    <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
      {notifications.map((n) => (
        <NotificationRow
          key={n.id}
          notification={n}
          canScheduleCleaning={canScheduleCleaning}
        />
      ))}
    </ul>
  );
}

function NotificationRow({
  notification: n,
  canScheduleCleaning,
}: {
  notification: Notification;
  canScheduleCleaning: boolean;
}) {
  const [pending, start] = useTransition();
  const [scheduled, setScheduled] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const unread = !n.read_at;
  const Icon = TYPE_ICON[n.type] ?? Bell;

  const showCleaningButton =
    canScheduleCleaning &&
    n.type === "new_reservation" &&
    n.entity_type === "reservation" &&
    !!n.entity_id &&
    !scheduled;

  return (
    <li
      className={cn(
        "flex flex-wrap items-start gap-3 px-4 py-3",
        unread && "bg-primary/[0.04]",
      )}
    >
      <div
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full",
          unread ? "bg-primary/15 text-primary" : "bg-foreground/5 text-foreground/50",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", unread ? "font-semibold" : "font-medium text-foreground/80")}>
          {n.title}
        </p>
        {n.body ? (
          <p className="mt-0.5 text-[12px] leading-relaxed text-foreground/60">{n.body}</p>
        ) : null}
        <p className="mt-1 text-[10px] uppercase tracking-wider text-foreground/45">
          {new Date(n.created_at).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {showCleaningButton ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setErr(null);
                  const r = await createCleaningFromReservation(n.entity_id!, null);
                  if (r.ok) {
                    setScheduled(true);
                    await markNotificationRead(n.id);
                  } else {
                    setErr(r.error ?? "Erro");
                  }
                })
              }
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <CalendarPlus className="size-3" />
              {pending ? "Agendando…" : "Agendar limpeza"}
            </button>
          ) : null}
          {scheduled ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              <Check className="size-3" /> Limpeza agendada
            </span>
          ) : null}
          {n.action_path ? (
            <Link
              href={n.action_path}
              onClick={() => void markNotificationRead(n.id)}
              className="rounded-full bg-foreground/5 px-3 py-1.5 text-[11px] font-semibold text-foreground hover:bg-foreground/10"
            >
              Ver detalhes
            </Link>
          ) : null}
          {unread ? (
            <button
              type="button"
              onClick={() => start(async () => void (await markNotificationRead(n.id)))}
              className="rounded-full px-3 py-1.5 text-[11px] font-medium text-foreground/55 hover:bg-foreground/5"
            >
              Marcar lida
            </button>
          ) : null}
        </div>
        {err ? <p className="mt-1 text-[11px] text-destructive">{err}</p> : null}
      </div>
    </li>
  );
}
