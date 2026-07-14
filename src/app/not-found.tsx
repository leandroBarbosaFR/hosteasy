import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center bg-background py-24">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="font-display text-7xl font-bold text-primary md:text-8xl">
            404
          </p>
          <h1 className="mt-4 text-balance font-display text-3xl font-bold leading-[1.1] tracking-tight md:text-4xl">
            Essa página{" "}
            <span className="text-primary">não tá na pousada</span>.
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-foreground/65">
            O link que você seguiu virou maré. Volta pra recepção e a gente
            te leva pra onde precisa.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f1916] py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
            >
              Voltar pra home
              <span className="grid size-7 place-items-center rounded-full bg-white/15">
                <ArrowRight className="size-3.5" />
              </span>
            </Link>
            <Link
              href="/contato"
              className="text-sm font-medium text-foreground/65 underline-offset-4 hover:text-foreground hover:underline"
            >
              ou fala com a gente
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
