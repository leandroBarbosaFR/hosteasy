import { Plus, Star } from "lucide-react";
import Link from "next/link";
import { Topbar } from "@/components/app/topbar";
import { StatCard } from "@/components/app/stat-card";
import { ReservationList } from "@/components/app/reservation-list";
import { EmptyState } from "@/components/app/empty-state";
import { getHostDashboardData } from "@/lib/data/host";
import { formatBRL } from "@/lib/format";

export const metadata = { title: "Visão geral · Hosteasy" };

export default async function DashboardPage() {
  const { monthRevenue, occupancy, activeReservations, upcoming, profile, revenueSeries } =
    await getHostDashboardData();

  const total30d = revenueSeries.reduce(
    (a, r) => a + Number(r.amount ?? 0),
    0,
  );
  const avgNight = upcoming.length
    ? Math.round(
        upcoming.reduce((a, r) => a + Number(r.amount ?? 0), 0) /
          upcoming.length,
      )
    : 0;

  return (
    <>
      <Topbar
        subtitle={`Boa tarde, ${profile.full_name?.split(" ")[0] ?? "anfitrião"}`}
        title={
          activeReservations > 0
            ? `Você tem ${activeReservations} ${activeReservations === 1 ? "reserva" : "reservas"} ativas`
            : "Nenhuma reserva ativa"
        }
        actions={
          <Link
            href="/dashboard/reservations?new=1"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md"
          >
            <Plus className="size-3.5" /> Nova reserva
          </Link>
        }
      />

      <section className="grid gap-3 px-6 pt-6 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        <StatCard label="Receita do mês" value={formatBRL(monthRevenue)} trend="up" delta="+12%" />
        <StatCard label="Ocupação"       value={`${occupancy.toFixed(0)}%`} trend="up" delta="+4%" />
        <StatCard label="Reservas ativas" value={String(activeReservations)} trend="up" delta="+3" />
        <StatCard
          label="Nota média"
          value="4.9"
          trend="up"
          delta="↑"
          icon={<Star className="size-4 fill-primary text-primary" />}
        />
      </section>

      <section className="grid gap-4 px-6 pt-6 md:grid-cols-5 md:px-10">
        <div className="md:col-span-3">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Próximas reservas</h2>
            <Link
              href="/dashboard/reservations"
              className="text-xs font-medium text-foreground/60 hover:text-foreground"
            >
              Ver todas
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              title="Nenhuma reserva nos próximos dias"
              description="Quando entrar uma nova reserva ela aparece aqui."
            />
          ) : (
            <ReservationList reservations={upcoming} />
          )}
        </div>

        <div className="md:col-span-2">
          <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Receita · 30 dias</h2>
              <span className="text-xs font-semibold text-emerald-600">+12%</span>
            </div>
            <Sparkline values={revenueSeries.map((r) => Number(r.amount ?? 0))} />
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[11px] text-foreground/55">Total</p>
                <p className="text-lg font-semibold">{formatBRL(total30d)}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-foreground/55">Diária média</p>
                <p className="text-lg font-semibold">{formatBRL(avgNight)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) {
    return (
      <div className="mt-4 grid h-20 place-items-center rounded-xl bg-muted/40 text-xs text-foreground/45">
        Sem dados ainda
      </div>
    );
  }
  const max = Math.max(...values, 1);
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(values.length - 1, 1)) * 100;
      const y = 100 - (v / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="mt-4 h-20 w-full"
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
        points={points}
      />
    </svg>
  );
}
