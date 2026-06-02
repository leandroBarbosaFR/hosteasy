import { notFound } from "next/navigation";
import { resolveTabletContext } from "@/lib/data/tablet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GuideCard } from "@/components/app/guide-card";
import { EmptyState } from "@/components/app/empty-state";

export default async function TabletGuidesPage({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  if (!ctx.property) notFound();

  const admin = createSupabaseAdminClient();
  const { data: categories } = await admin
    .from("guide_categories")
    .select("*, guide_items(id)")
    .eq("property_id", ctx.property.id)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-4xl px-5 pt-10">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          Guia da casa
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
          O que saber para curtir
        </h1>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {(categories ?? []).map((c) => (
          <GuideCard
            key={c.id}
            category={c}
            href={`/tablet/${tabletCode}/guides/${c.id}`}
            count={(c.guide_items as { id: string }[] | undefined)?.length}
          />
        ))}
      </div>

      {(categories ?? []).length === 0 ? (
        <div className="mt-6">
          <EmptyState title="O anfitrião ainda não publicou um guia." />
        </div>
      ) : null}
    </main>
  );
}
