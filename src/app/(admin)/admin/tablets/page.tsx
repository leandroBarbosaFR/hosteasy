import { Topbar } from "@/components/app/topbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/app/empty-state";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tablets · Admin" };

export default async function AdminTabletsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("tablets")
    .select(
      "id, tablet_code, status, battery_percent, wifi_status, last_seen_at, hosts(name), properties(name)",
    )
    .order("status");

  return (
    <>
      <Topbar subtitle="Admin" title="Tablets" />
      <div className="px-6 pt-6 md:px-10">
        {rows && rows.length > 0 ? (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold">{r.tablet_code}</p>
                  <p className="text-[11px] text-foreground/55">
                    {(r.hosts as { name?: string } | null)?.name} ·{" "}
                    {(r.properties as { name?: string } | null)?.name ?? "Sem imóvel"}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-foreground/55">
                    {r.battery_percent != null ? `${r.battery_percent}%` : "—"}
                  </span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                      r.status === "online"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : r.status === "maintenance"
                          ? "bg-amber-500/15 text-amber-700"
                          : "bg-foreground/10 text-foreground/60",
                    )}
                  >
                    {r.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nenhum tablet ainda" />
        )}
      </div>
    </>
  );
}
