import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="relative bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-3xl px-6">
        <div className="grid items-start gap-8 md:grid-cols-[auto_1fr] md:gap-10">
          <div className="relative size-20 shrink-0 md:size-24">
            <span
              aria-hidden
              className="absolute inset-0 translate-x-2 translate-y-2 rounded-full bg-primary"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/leo.jpg"
              alt="Leandro, co-fundador"
              className="relative size-full rounded-full object-cover"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              Uma nota do co-fundador
            </p>
            <h2 className="mt-3 text-balance font-display text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl">
              Te mostro o painel em{" "}
              <span className="italic text-primary">15 minutos</span> — sem
              pitch.
            </h2>
            <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
              Sou o Leandro. Moro em Floripa e construí o HostEasy depois de
              ver minha vizinha do Campeche responder &ldquo;qual é a senha do
              Wi-Fi?&rdquo; pela 47ª vez no mês. Marca 15 min comigo e te
              mostro o painel rodando com dados de um imóvel real aqui da
              ilha.
            </p>

            <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <Link
                href="/demo"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f1916] py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
              >
                Marcar 15 min comigo
                <span className="grid size-7 place-items-center rounded-full bg-white/15">
                  <ArrowRight className="size-3.5" />
                </span>
              </Link>
              <Link
                href="https://wa.me/5548991958826?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20Hosteasy!"
                className="text-sm font-medium text-foreground/65 underline-offset-4 hover:text-foreground hover:underline"
              >
                ou me chama no WhatsApp
              </Link>
            </div>

            <p
              className="mt-6 font-display text-2xl italic leading-none text-foreground/40"
              aria-hidden
            >
              — Leandro
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
