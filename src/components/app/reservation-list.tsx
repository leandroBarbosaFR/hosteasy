import { ArrowRight } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { ScheduleCleaningButton } from "@/components/app/schedule-cleaning-button";
import type { Reservation } from "@/types/db";

export type ReservationWithProperty = Reservation & {
  properties?: { name: string; unit_code: string | null } | null;
};

const statusStyles: Record<Reservation["status"], string> = {
  confirmed:    "bg-foreground/5 text-foreground/70",
  in_stay:      "bg-emerald-500/15 text-emerald-700",
  checked_out:  "bg-foreground/5 text-foreground/55",
  cancelled:    "bg-destructive/10 text-destructive",
};

const statusLabel: Record<Reservation["status"], string> = {
  confirmed:    "Confirmada",
  in_stay:      "Em estadia",
  checked_out:  "Finalizada",
  cancelled:    "Cancelada",
};

export function ReservationList({
  reservations,
  compact = false,
  showCleaningAction = false,
}: {
  reservations: ReservationWithProperty[];
  compact?: boolean;
  showCleaningAction?: boolean;
}) {
  return (
    <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
      {reservations.map((r) => (
        <li
          key={r.id}
          className="flex items-center justify-between gap-3 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{r.guest_name}</p>
            <p className="truncate text-[11px] text-foreground/60">
              {r.properties?.name ?? "—"}{" "}
              {r.properties?.unit_code ? `· ${r.properties.unit_code}` : ""}
            </p>
          </div>

          {!compact ? (
            <div className="hidden text-[11px] text-foreground/60 sm:block">
              {formatDateRange(r.check_in, r.check_out)}
            </div>
          ) : null}

          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              statusStyles[r.status],
            )}
          >
            {statusLabel[r.status]}
          </span>

          {!compact ? (
            <span className="hidden text-sm font-semibold sm:inline">
              {formatBRL(r.amount)}
            </span>
          ) : null}

          {showCleaningAction &&
          (r.status === "confirmed" || r.status === "in_stay") ? (
            <ScheduleCleaningButton reservationId={r.id} />
          ) : null}

          <ArrowRight className="size-3.5 shrink-0 text-foreground/30" />
        </li>
      ))}
    </ul>
  );
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sStr = s.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const eStr = e.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  return `${sStr} – ${eStr}`;
}
