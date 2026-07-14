import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { StatCard } from "@/components/app/stat-card";
import { requireStaffContext } from "@/lib/data/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { orderStatusMeta, isPaidOrder, isAwaitingPayment } from "@/lib/orders";

export const metadata = { title: "Pedidos · Hosteasy" };

export default async function StaffPaymentsPage() {
  const { hostId } = await requireStaffContext();
  const supabase = await createSupabaseServerClient();

  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const { data: orders } = await supabase
    .from("extra_orders")
    .select(
      "id, total, status, created_at, extras(title, category), reservations(guest_name, properties(name, unit_code))",
    )
    .eq("host_id", hostId)
    .gte("created_at", monthStart.toISOString())
    .order("created_at", { ascending: false });

  const rows = (orders ?? []).map((o) => {
    const extraRel = Array.isArray(o.extras) ? o.extras[0] : o.extras;
    const resRel = Array.isArray(o.reservations) ? o.reservations[0] : o.reservations;
    const propRel = (resRel as { properties?: unknown } | null)?.properties as
      | { name?: string; unit_code?: string | null }
      | { name?: string; unit_code?: string | null }[]
      | null;
    const prop = Array.isArray(propRel) ? propRel[0] : propRel;
    return {
      id: o.id as string,
      total: Number(o.total ?? 0),
      status: o.status as string,
      created_at: o.created_at as string,
      title: (extraRel as { title?: string } | null)?.title ?? "Extra",
      category: (extraRel as { category?: string } | null)?.category ?? "custom",
      guest_name: (resRel as { guest_name?: string } | null)?.guest_name ?? "—",
      property_name: prop?.name ?? "—",
    };
  });

  const paid = rows.filter((r) => isPaidOrder(r.status));
  const pendingPayment = rows.filter((r) => isAwaitingPayment(r.status));
  const monthRevenue = paid.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <AutoRefresh intervalMs={45_000} />
      <Topbar
        subtitle="Pedidos"
        title="Vendas do mês"
      />
      <p className="px-6 pt-2 text-xs text-foreground/55 md:px-10">
        Apenas visualização — quem aprova e marca como pago é o anfitrião.
      </p>

      <section className="grid gap-3 px-6 pt-6 sm:grid-cols-3 md:px-10">
        <StatCard label="Receita do mês" value={formatBRL(monthRevenue)} />
        <StatCard label="Pedidos pagos"  value={String(paid.length)} />
        <StatCard label="Aguard. pagamento" value={String(pendingPayment.length)} />
      </section>

      <div className="px-6 pt-6 md:px-10">
        {rows.length === 0 ? (
          <EmptyState
            title="Nenhum pedido este mês"
            description="Quando o hóspede pedir um extra no tablet, aparece aqui."
          />
        ) : (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {rows.map((r) => {
              const meta = orderStatusMeta(r.status);
              return (
                <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.title}</p>
                    <p className="truncate text-[11px] text-foreground/55">
                      {r.guest_name} · {r.property_name} ·{" "}
                      {new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{formatBRL(r.total)}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                        meta.cls,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
