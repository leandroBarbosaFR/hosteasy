import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";

export function LegalPage({
  eyebrow,
  title,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-background py-20 md:py-24">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary" />
              {eyebrow}
            </span>
            <h1 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-foreground/55">
              Última atualização: {lastUpdated}
            </p>
          </div>
        </section>

        <section className="bg-background pb-20 md:pb-28">
          <article className="legal-prose mx-auto max-w-2xl px-6">
            {children}
          </article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
