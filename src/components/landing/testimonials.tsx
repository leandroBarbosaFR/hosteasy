import Image from "next/image";
import { Star } from "@phosphor-icons/react/ssr";

// TODO: substituir por depoimentos reais e autorizados antes de ir ao ar.
// Os textos e fotos abaixo são placeholders de layout.
const testimonials = [
  {
    quote:
      "No primeiro mês o tablet vendeu R$ 610 em late check-out e faxina extra. Eu nem precisei mandar mensagem pra ninguém.",
    name: "Marina Duarte",
    role: "4 imóveis · Jurerê",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    quote:
      "Parei de responder “qual a senha do Wi-Fi” às 23h. O guia em vídeo resolveu quase tudo — meu WhatsApp ficou silencioso.",
    name: "Rafael Nunes",
    role: "2 imóveis · Campeche",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80",
  },
  {
    quote:
      "O que mais me pegou foi a marca ser minha, não do Airbnb. Três hóspedes já voltaram reservando direto comigo.",
    name: "Ana Beatriz Rocha",
    role: "7 imóveis · Lagoa da Conceição",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80",
  },
];

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-card/40 py-14 md:py-[60px]">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Quem já usa
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Anfitriões que pararam de{" "}
            <span className="text-primary">deixar dinheiro na mesa</span>
          </h2>
        </div>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <li
              key={t.name}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/45 p-7 shadow-[0_1px_2px_rgba(31,25,22,0.04)] backdrop-blur-2xl backdrop-saturate-150"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
              />
              <div
                className="relative flex gap-0.5"
                aria-label="Avaliação: 5 de 5 estrelas"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    aria-hidden
                    className="size-3.5 fill-primary text-primary"
                  weight="fill" />
                ))}
              </div>

              <blockquote className="relative mt-5 flex-1 text-pretty text-sm leading-relaxed text-foreground/80">
                &ldquo;{t.quote}&rdquo;
              </blockquote>

              <figcaption className="relative mt-6 flex items-center gap-3 border-t border-foreground/[0.07] pt-5">
                <Image
                  src={t.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-foreground">
                    {t.name}
                  </p>
                  <p className="mt-0.5 text-xs text-foreground/55">{t.role}</p>
                </div>
              </figcaption>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
