import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { requireStaffContext } from "@/lib/data/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata = { title: "Reservas · Hosteasy" };

export default async function StaffBookingsPage() {
  const { hostId } = await requireStaffContext();
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const horizon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: rows } = await supabase
    .from("reservations")
    .select(
      "id, guest_name, check_in, check_out, status, source, properties(name, unit_code)",
    )
    .eq("host_id", hostId)
    .gte("check_out", today)
    .lte("check_in", horizon)
    .order("check_in", { ascending: true });

  const reservations = (rows ?? []).map((r) => {
    const propRel = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    return {
      ...r,
      property_name: (propRel as { name?: string } | null)?.name ?? null,
      unit_code: (propRel as { unit_code?: string | null } | null)?.unit_code ?? null,
    };
  });

  return (
    <>
      <AutoRefresh intervalMs={60_000} />
      <Topbar
        subtitle="Reservas"
        title="Próximos 30 dias"
      />

      <p className="px-6 pt-2 text-xs text-foreground/55 md:px-10">
        Apenas visualização. Use as tarefas para coordenar limpeza e check-in.
      </p>

      <div className="px-6 pt-4 md:px-10">
        {reservations.length === 0 ? (
          <EmptyState title="Sem reservas nos próximos 30 dias" />
        ) : (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {reservations.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{r.guest_name}</p>
                  <p className="truncate text-[11px] text-foreground/55">
                    {r.property_name}
                    {r.unit_code ? ` · ${r.unit_code}` : ""} · {r.source}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">
                    {new Date(r.check_in).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    {" → "}
                    {new Date(r.check_out).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </p>
                  <span
                    className={cn(
                      "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      r.status === "in_stay"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : r.status === "confirmed"
                          ? "bg-foreground/5 text-foreground/70"
                          : "bg-foreground/10 text-foreground/55",
                    )}
                  >
                    {r.status === "in_stay" ? "Em estadia" : r.status === "confirmed" ? "Confirmada" : r.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
