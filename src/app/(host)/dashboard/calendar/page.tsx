import Link from "next/link";
import { CaretLeft as ChevronLeft, CaretRight as ChevronRight } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Calendário · Hosteasy" };

const PROPERTY_COLORS = [
  "bg-primary/15 text-primary",
  "bg-emerald-500/15 text-emerald-700",
  "bg-sky-500/15 text-sky-700",
  "bg-amber-500/15 text-amber-700",
  "bg-violet-500/15 text-violet-700",
  "bg-rose-500/15 text-rose-700",
];

type CalReservation = {
  id: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  property_id: string;
  status: string;
};

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  // Month anchor from ?m=YYYY-MM, defaulting to the current month.
  const anchor = /^\d{4}-\d{2}$/.test(m ?? "")
    ? new Date(`${m}-01T00:00:00`)
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const prev = new Date(year, month - 1, 1);
  const next = new Date(year, month + 1, 1);
  const monthKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

  const [{ data: reservations }, { data: properties }] = await Promise.all([
    supabase
      .from("reservations")
      .select("id, guest_name, check_in, check_out, property_id, status")
      .eq("host_id", hostId)
      .neq("status", "cancelled")
      .lte("check_in", iso(monthEnd))
      .gte("check_out", iso(monthStart)),
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
  ]);

  const colorByProperty = new Map<string, string>();
  (properties ?? []).forEach((p, i) => {
    colorByProperty.set(p.id, PROPERTY_COLORS[i % PROPERTY_COLORS.length]);
  });
  const labelByProperty = new Map<string, string>();
  (properties ?? []).forEach((p) => {
    labelByProperty.set(p.id, p.unit_code ?? p.name);
  });

  // Sunday-first grid covering the whole month.
  const gridStart = new Date(monthStart);
  gridStart.setDate(gridStart.getDate() - gridStart.getDay());
  const days: Date[] = [];
  for (
    let d = new Date(gridStart);
    d <= monthEnd || d.getDay() !== 0;
    d.setDate(d.getDate() + 1)
  ) {
    days.push(new Date(d));
  }

  const todayIso = iso(new Date());
  const monthLabel = anchor.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  function reservationsForDay(dayIso: string): CalReservation[] {
    // A reservation occupies the night of `day` when check_in <= day < check_out.
    return ((reservations ?? []) as CalReservation[])
      .filter((r) => r.check_in <= dayIso && dayIso < r.check_out)
      .sort((a, b) => a.property_id.localeCompare(b.property_id));
  }

  return (
    <>
      <Topbar
        subtitle="Calendário"
        title={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
        actions={
          <div className="flex items-center gap-1">
            <Link
              href={`/dashboard/calendar?m=${monthKey(prev)}`}
              className="grid size-9 place-items-center rounded-full border border-border/60 bg-card text-foreground/70 shadow-sm hover:bg-muted/50"
              aria-label="Mês anterior"
            >
              <ChevronLeft className="size-4" />
            </Link>
            <Link
              href="/dashboard/calendar"
              className="rounded-full border border-border/60 bg-card px-3 py-2 text-xs font-semibold text-foreground/70 shadow-sm hover:bg-muted/50"
            >
              Hoje
            </Link>
            <Link
              href={`/dashboard/calendar?m=${monthKey(next)}`}
              className="grid size-9 place-items-center rounded-full border border-border/60 bg-card text-foreground/70 shadow-sm hover:bg-muted/50"
              aria-label="Próximo mês"
            >
              <ChevronRight className="size-4" />
            </Link>
          </div>
        }
      />

      {(properties ?? []).length > 1 ? (
        <div className="flex flex-wrap gap-2 px-6 pt-4 md:px-10">
          {(properties ?? []).map((p) => (
            <span
              key={p.id}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-semibold",
                colorByProperty.get(p.id),
              )}
            >
              {p.name}
              {p.unit_code ? ` · ${p.unit_code}` : ""}
            </span>
          ))}
        </div>
      ) : null}

      <div className="px-6 pt-4 md:px-10">
        <div className="overflow-x-auto rounded-3xl border border-border/50 bg-card shadow-sm">
          <div className="min-w-[720px]">
            <div className="grid grid-cols-7 border-b border-border/60">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                <div
                  key={d}
                  className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-foreground/50"
                >
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const dayIso = iso(day);
                const inMonth = day.getMonth() === month;
                const dayReservations = reservationsForDay(dayIso);
                return (
                  <div
                    key={dayIso}
                    className={cn(
                      "min-h-[92px] border-b border-r border-border/40 p-1.5 [&:nth-child(7n)]:border-r-0",
                      !inMonth && "bg-muted/30",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-6 place-items-center rounded-full text-[11px] font-semibold",
                        dayIso === todayIso
                          ? "bg-primary text-primary-foreground"
                          : inMonth
                            ? "text-foreground/70"
                            : "text-foreground/35",
                      )}
                    >
                      {day.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayReservations.slice(0, 3).map((r) => {
                        const isCheckIn = r.check_in === dayIso;
                        return (
                          <div
                            key={r.id}
                            title={`${r.guest_name} · ${labelByProperty.get(r.property_id) ?? ""} · ${r.check_in} → ${r.check_out}`}
                            className={cn(
                              "truncate rounded px-1.5 py-0.5 text-[10px] font-medium leading-tight",
                              colorByProperty.get(r.property_id) ??
                                "bg-foreground/10 text-foreground/60",
                              isCheckIn ? "rounded-l-full" : "opacity-75",
                            )}
                          >
                            {isCheckIn || day.getDay() === 0
                              ? `${labelByProperty.get(r.property_id) ?? ""} ${r.guest_name.split(" ")[0]}`
                              : "·"}
                          </div>
                        );
                      })}
                      {dayReservations.length > 3 ? (
                        <p className="px-1 text-[9px] text-foreground/45">
                          +{dayReservations.length - 3}
                        </p>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <p className="mt-2 text-[11px] text-foreground/50">
          Noites vazias entre reservas são janelas de limpeza — ou de reserva
          direta.
        </p>
      </div>
    </>
  );
}
