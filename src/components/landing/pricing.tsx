import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const included = [
  "Tablet 8\" sempre ligado (incluído)",
  "Garantia contra quebra e roubo",
  "Sem taxa de setup ou instalação",
  "Painel web ilimitado para anfitrião",
  "Check-in digital + chat com hóspede",
  "Hóspede em PT, EN, ES, FR e RU",
  "Vendas extras (late check-out, faxina, etc)",
  "Comissão de parceiros locais (iFood, passeios)",
  "Integração com Stays, Hostaway, Lodgify, Airbnb",
  "Suporte em português, em horário comercial",
];

export function Pricing() {
  return (
    <section
      id="precos"
      className="relative overflow-hidden bg-background py-14 md:py-[60px]"
    >
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Preços
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Um plano.{" "}
            <span className="text-primary">Tablet incluído.</span> Sem
            pegadinha.
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
            Preço por imóvel. Mais de 10 imóveis? Falamos com você sobre
            condições especiais.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl">
          <div className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
            <div className="grid md:grid-cols-2">
              <div className="border-b border-border/60 p-8 md:border-b-0 md:border-r">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                  Mensal
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-medium tracking-tight">
                    R$ 99
                  </span>
                  <span className="text-sm text-foreground/55">
                    /mês por imóvel
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground/65">
                  Contrato de 12 meses. Cobrança via Pix, boleto ou cartão.
                </p>
              </div>
              <div className="relative bg-sand/10 p-8">
                <span className="absolute right-6 top-6 rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                  Economize 16%
                </span>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                  Anual
                </p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-display text-5xl font-medium tracking-tight">
                    R$ 999
                  </span>
                  <span className="text-sm text-foreground/55">
                    /ano por imóvel
                  </span>
                </div>
                <p className="mt-3 text-sm text-foreground/65">
                  Equivale a R$ 83/mês. Pagamento à vista no Pix ou em até 12x.
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 bg-background p-8">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                Tudo incluído
              </p>
              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {included.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm leading-relaxed"
                  >
                    <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                      <Check className="size-3" strokeWidth={3} />
                    </span>
                    <span className="text-foreground/80">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/demo"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-12 gap-2 rounded-full border-0 bg-clip-border py-1.5 pl-5 pr-2 text-sm font-semibold transition-[box-shadow] duration-200 hover:shadow-[6px_6px_0_0_#1f1916]"
                  )}
                >
                  Agendar demonstração
                  <span className="grid size-8 place-items-center rounded-full bg-white/20">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
                <Link
                  href="/contato"
                  className="inline-flex h-12 items-center justify-center gap-1.5 rounded-full bg-[#1f1916] px-5 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
                >
                  Tenho mais de 10 imóveis
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
