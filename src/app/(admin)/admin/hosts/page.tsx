import Link from "next/link";
import { Plus, ArrowRight } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { EmptyState } from "@/components/app/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewHostDialog } from "./new-host-dialog";

export const metadata = { title: "Anfitriões · Admin" };

export default async function AdminHostsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: hosts } = await supabase
    .from("hosts")
    .select(
      "id, name, plan, status, owner_id, created_at, owner:owner_id(full_name, email)",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <Topbar
        subtitle="Admin"
        title="Anfitriões"
        actions={
          <NewHostDialog
            trigger={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md">
                <Plus className="size-3.5" /> Novo anfitrião
              </span>
            }
          />
        }
      />
      <div className="px-6 pt-6 md:px-10">
        {hosts && hosts.length > 0 ? (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {hosts.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/admin/hosts/${h.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/40"
                >
                  <div>
                    <p className="text-sm font-semibold">{h.name}</p>
                    <p className="text-[11px] text-foreground/55">
                      {(h.owner as { full_name?: string | null; email?: string | null } | null)?.email ??
                        "Sem dono"}{" "}
                      · {h.plan}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        h.status === "active"
                          ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700"
                          : "rounded-full bg-foreground/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70"
                      }
                    >
                      {h.status}
                    </span>
                    <ArrowRight className="size-4 text-foreground/30" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nenhum anfitrião cadastrado" />
        )}
      </div>
    </>
  );
}
