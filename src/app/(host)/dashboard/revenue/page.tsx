import Link from "next/link";
import { Topbar } from "@/components/app/topbar";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Receita · Hosteasy" };

type Range = "7d" | "30d" | "90d" | "year";

const DAYS: Record<Range, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  year: 365,
};

function sinceISODate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{ range?: Range }>;
}) {
  const { range = "30d" } = await searchParams;
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const since = sinceISODate(DAYS[range]);

  const { data: reservations } = await supabase
    .from("reservations")
    .select("amount, nights, status, property_id, properties(name)")
    .eq("host_id", hostId)
    .gte("check_in", since);

  const safe = (reservations ?? []).filter((r) => r.status !== "cancelled");
  const total = safe.reduce((a, r) => a + Number(r.amount ?? 0), 0);
  const nights = safe.reduce((a, r) => a + Number(r.nights ?? 0), 0);
  const adr = nights > 0 ? total / nights : 0;
  const reservationsCount = safe.length;

  // Group by property
  const byProperty = new Map<string, { name: string; total: number }>();
  for (const r of safe) {
    const propRel = r.properties as { name: string } | { name: string }[] | null;
    const name = Array.isArray(propRel) ? propRel[0]?.name ?? "Imóvel" : propRel?.name ?? "Imóvel";
    const cur = byProperty.get(r.property_id) ?? { name, total: 0 };
    cur.total += Number(r.amount ?? 0);
    byProperty.set(r.property_id, cur);
  }
  const propertyRows = [...byProperty.values()].sort(
    (a, b) => b.total - a.total,
  );

  return (
    <>
      <Topbar subtitle="Receita" title="Receita por período" />

      <div className="flex flex-wrap gap-2 px-6 pt-6 md:px-10">
        {(["7d", "30d", "90d", "year"] as Range[]).map((r) => (
          <Link
            key={r}
            href={`/dashboard/revenue?range=${r}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              range === r
                ? "bg-foreground/90 text-white"
                : "border border-border/60 bg-card text-foreground/70 hover:bg-muted/50",
            )}
          >
            {r === "7d" ? "7 dias" : r === "30d" ? "30 dias" : r === "90d" ? "90 dias" : "12 meses"}
          </Link>
        ))}
      </div>

      <section className="grid gap-3 px-6 pt-6 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        <StatCard label="Receita"        value={formatBRL(total)} trend="up" delta="+8%" />
        <StatCard label="Reservas"        value={String(reservationsCount)} />
        <StatCard label="Noites vendidas" value={String(nights)} />
        <StatCard label="Diária média"    value={formatBRL(adr)} />
      </section>

      <section className="px-6 pt-6 md:px-10">
        <h2 className="mb-2 text-sm font-semibold">Por imóvel</h2>
        {propertyRows.length === 0 ? (
          <EmptyState title="Sem dados no período" />
        ) : (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {propertyRows.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium">{p.name}</span>
                <span className="font-semibold">{formatBRL(p.total)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
