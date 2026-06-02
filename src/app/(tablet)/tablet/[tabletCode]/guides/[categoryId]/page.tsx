import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { resolveTabletContext } from "@/lib/data/tablet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function TabletGuideDetail({
  params,
}: {
  params: Promise<{ tabletCode: string; categoryId: string }>;
}) {
  const { tabletCode, categoryId } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  if (!ctx.property) notFound();

  const admin = createSupabaseAdminClient();
  const { data: category } = await admin
    .from("guide_categories")
    .select("*")
    .eq("id", categoryId)
    .eq("property_id", ctx.property.id)
    .maybeSingle();
  if (!category) notFound();

  const { data: items } = await admin
    .from("guide_items")
    .select("*")
    .eq("category_id", category.id)
    .order("sort_order");

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <Link
        href={`/tablet/${tabletCode}/guides`}
        className="inline-flex items-center gap-1 text-xs font-medium text-foreground/65 hover:text-foreground"
      >
        <ArrowLeft className="size-3" /> Guia da casa
      </Link>
      <h1 className="mt-2 font-display text-3xl font-medium tracking-tight md:text-4xl">
        {category.title}
      </h1>
      {category.subtitle ? (
        <p className="mt-1 text-sm text-foreground/65">{category.subtitle}</p>
      ) : null}

      <ol className="mt-6 space-y-3">
        {(items ?? []).map((it) => (
          <li
            key={it.id}
            className="rounded-3xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-xl"
          >
            <h3 className="font-display text-lg font-medium tracking-tight">
              {it.title}
            </h3>
            {it.content ? (
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                {it.content}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </main>
  );
}
