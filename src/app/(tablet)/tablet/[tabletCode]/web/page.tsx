import { resolveTabletContext } from "@/lib/data/tablet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EmptyState } from "@/components/app/empty-state";

export default async function TabletWebPage({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  const admin = createSupabaseAdminClient();

  const { data: shortcuts } = await admin
    .from("web_shortcuts")
    .select("*")
    .eq("host_id", ctx.host.id)
    .eq("active", true)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-4xl px-5 pt-10">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          Web
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Atalhos
        </h1>
        <p className="mt-1 text-sm text-foreground/65">
          Toque para abrir o site no navegador do tablet.
        </p>
      </header>

      {!shortcuts || shortcuts.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Nenhum atalho configurado pelo anfitrião." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {shortcuts.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-3xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md"
            >
              <span
                className="grid size-12 place-items-center rounded-2xl text-base font-semibold text-white shadow"
                style={{ backgroundColor: s.color ?? "#1f1916" }}
              >
                {s.icon_letter ?? s.label[0]}
              </span>
              <span className="text-xs font-medium text-foreground/80">
                {s.label}
              </span>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
