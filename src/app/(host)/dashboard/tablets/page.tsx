import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { EmptyState } from "@/components/app/empty-state";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewTabletDialog } from "./new-tablet-dialog";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tablets · Hosteasy" };

export default async function HostTabletsPage() {
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: tablets }, { data: properties }] = await Promise.all([
    supabase
      .from("tablets")
      .select("*, properties(name, unit_code)")
      .eq("host_id", hostId)
      .order("tablet_code"),
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
  ]);

  return (
    <>
      <Topbar
        subtitle="Tablets"
        title="Seus tablets"
        actions={
          <NewTabletDialog
            properties={properties ?? []}
            trigger={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md">
                <Plus className="size-3.5" /> Novo tablet
              </span>
            }
          />
        }
      />

      <div className="px-6 pt-6 md:px-10">
        {tablets && tablets.length > 0 ? (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {tablets.map((t) => {
              const prop = Array.isArray(t.properties)
                ? t.properties[0]
                : t.properties;
              return (
                <li key={t.id}>
                  <Link
                    href={`/dashboard/tablets/${t.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-semibold">
                        {t.tablet_code}
                      </p>
                      <p className="truncate text-[11px] text-foreground/55">
                        {prop?.name ?? "Sem imóvel"}
                        {prop?.unit_code ? ` · ${prop.unit_code}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-foreground/55">
                        {t.battery_percent != null ? `${t.battery_percent}%` : "—"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                          t.status === "online"
                            ? "bg-emerald-500/15 text-emerald-700"
                            : t.status === "maintenance"
                              ? "bg-amber-500/15 text-amber-700"
                              : "bg-foreground/10 text-foreground/60",
                        )}
                      >
                        {t.status}
                      </span>
                      <ArrowRight className="size-4 text-foreground/30" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState
            title="Sem tablets cadastrados"
            description="Cadastre o código impresso no tablet para vincular ao seu painel."
          />
        )}
      </div>
    </>
  );
}
