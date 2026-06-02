import { Topbar } from "@/components/app/topbar";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/app/empty-state";

export const metadata = { title: "Imóveis · Admin" };

export default async function AdminPropertiesPage() {
  const supabase = await createSupabaseServerClient();
  const { data: rows } = await supabase
    .from("properties")
    .select("id, name, unit_code, city, state, hosts(name)")
    .order("name");

  return (
    <>
      <Topbar subtitle="Admin" title="Todos os imóveis" />
      <div className="px-6 pt-6 md:px-10">
        {rows && rows.length > 0 ? (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">{r.name}</p>
                  <p className="text-[11px] text-foreground/55">
                    {(r.hosts as { name?: string } | null)?.name} · {r.city ?? "—"}
                  </p>
                </div>
                <span className="text-xs text-foreground/55">{r.unit_code ?? "—"}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Sem imóveis na plataforma" />
        )}
      </div>
    </>
  );
}
