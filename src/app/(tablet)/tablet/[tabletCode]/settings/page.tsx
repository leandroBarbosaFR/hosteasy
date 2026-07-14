import { resolveTabletContext } from "@/lib/data/tablet";
import { SettingsForm } from "./settings-form";

export default async function TabletSettingsPage({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  const s = ctx.tablet.settings;

  return (
    <main className="mx-auto max-w-2xl px-5 pt-10">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          Ajustes
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Como você quer o tablet
        </h1>
      </header>

      <div className="mt-6">
        <SettingsForm tabletCode={tabletCode} defaults={s} />
      </div>
    </main>
  );
}
