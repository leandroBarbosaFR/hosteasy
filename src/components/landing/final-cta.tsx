import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, CalendarDot as CalendarClock } from "@phosphor-icons/react/ssr";
import { whatsappLink } from "@/lib/site";

const reassurances = [
  { icon: Truck, label: "Tablet incluído, enviado pronto" },
  { icon: ShieldCheck, label: "Quebra e roubo cobertos" },
  { icon: CalendarClock, label: "Rodando em 5 a 7 dias" },
];

export function FinalCta() {
  return (
    <section className="relative bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#1f1916] px-6 py-14 text-center md:px-16 md:py-20">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary/20 blur-3xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-28 -left-20 size-72 rounded-full bg-sage/15 blur-3xl"
          />

          <div className="relative">
            <h2 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-5xl">
              Sua próxima estadia já podia estar{" "}
              <span className="text-primary">vendendo por você</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/65 md:text-lg">
              Quinze minutos de conversa e você vê o painel rodando com um imóvel
              seu. Sem compromisso, sem cartão, sem apresentação de slides.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/demo"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-white transition-[box-shadow] duration-200 hover:shadow-[6px_6px_0_0_rgba(255,255,255,0.9)] sm:w-auto"
              >
                Agendar demonstração
                <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={whatsappLink(
                  "Olá! Vi o site do hosteasy e quero saber mais."
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors duration-200 hover:bg-white/20 sm:w-auto"
              >
                Falar no WhatsApp
              </Link>
            </div>

            <ul className="mx-auto mt-10 flex max-w-2xl flex-col items-center justify-center gap-3 text-xs text-white/55 sm:flex-row sm:gap-7">
              {reassurances.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="size-4 shrink-0 text-primary" weight="regular" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
