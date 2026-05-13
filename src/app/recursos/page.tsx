import Link from "next/link";
import {
  ArrowRight,
  Coins,
  MapPinned,
  Heart,
  Headset,
  BarChart3,
  Palette,
  Globe,
  ShieldCheck,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { FinalCta } from "@/components/landing/final-cta";

const DEEP_DIVES = [
  {
    icon: Coins,
    eyebrow: "POS no quarto",
    title: "Extras que se vendem sozinhos",
    body: "A IA aprende quais extras convertem em cada imóvel e em cada perfil de hóspede — café da manhã pra família, late check-out pra business, transfer pra grupos. Hóspede toca, cobramos no cartão, você fica com 90%.",
    bullets: [
      "Late check-out, early check-in, café, faxina, transfer, equipamentos",
      "Preço dinâmico por estação e por imóvel",
      "Você aprova cada pedido pelo painel em segundos",
    ],
  },
  {
    icon: MapPinned,
    eyebrow: "Parceiros locais",
    title: "Comissão sem você mover um dedo",
    body: "iFood, restaurantes, escolas de surf, passeios de barco, aluguel de bike. Pré-conectado por bairro de Floripa — hóspede gasta direto no tablet, você recebe a comissão no fim do mês.",
    bullets: [
      "Catálogo curado por bairro (Campeche, Jurerê, Lagoa, Centro)",
      "Comissão média de 20% por parceiro",
      "Onboarding de novo parceiro em 24h",
    ],
  },
  {
    icon: Heart,
    eyebrow: "Direto > OTA",
    title: "Mais reservas sem pagar 17%",
    body: "Sua marca aparece em cada estadia, hóspede entra no seu CRM e recebe gatilho de reserva direta. Você reduz dependência de OTA estadia após estadia.",
    bullets: [
      "Marca, cores, fotos e tom personalizados por imóvel",
      "Programa de indicação com link único do hóspede",
      "CRM com histórico, perfil e nota interna",
    ],
  },
  {
    icon: Headset,
    eyebrow: "Atendimento",
    title: "Pare de viver no WhatsApp",
    body: "Vídeo-guia da casa, FAQ, chat em 5 idiomas. A IA responde antes do hóspede te chamar — e quando chama, abre o ticket já com contexto.",
    bullets: [
      "PT, EN, ES, FR e RU automáticos",
      "Vídeos curtos: cafeteira, ar, TV, Wi-Fi, check-out",
      "Triagem inteligente: urgente vai pro WhatsApp, dúvida fica no tablet",
    ],
  },
];

const SUPPORT_FEATURES = [
  {
    icon: BarChart3,
    title: "Analytics em tempo real",
    body: "Veja quanto cada imóvel rendeu, qual extra converte e onde falta resposta no guia.",
  },
  {
    icon: Palette,
    title: "100% white-label",
    body: "Logo, cores, fotos, vídeos e tom de voz personalizados por imóvel.",
  },
  {
    icon: Globe,
    title: "5 idiomas",
    body: "Conteúdo e chat em português, inglês, espanhol, francês e russo.",
  },
  {
    icon: ShieldCheck,
    title: "Garantia total no hardware",
    body: "Quebrou, sumiu, foi roubado? Mandamos outro tablet em 48h, sem custo.",
  },
];

export default function RecursosPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <DeepDives />
        <SupportGrid />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" />
          Recursos
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          Um tablet que faz{" "}
          <span className="italic text-primary">o trabalho pesado</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Quatro frentes principais de receita e operação combinadas em um
          aparelho só, com IA que aprende e otimiza estadia após estadia.
        </p>
      </div>
    </section>
  );
}

function DeepDives() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-5xl space-y-16 px-6 md:space-y-24">
        {DEEP_DIVES.map((f, i) => (
          <div
            key={f.title}
            className={`grid items-start gap-8 md:grid-cols-2 md:gap-14 ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                {f.eyebrow}
              </p>
              <h2 className="mt-3 text-balance font-display text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl">
                {f.title}
              </h2>
              <p className="mt-4 text-pretty text-base leading-relaxed text-foreground/70">
                {f.body}
              </p>
              <ul className="mt-5 space-y-2.5">
                {f.bullets.map((b) => (
                  <li
                    key={b}
                    className="flex items-start gap-2.5 text-sm text-foreground/75"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex aspect-[5/4] items-center justify-center rounded-3xl border border-border/60 bg-card">
              <f.icon
                className="size-20 text-[#1a1a1a]"
                strokeWidth={1.25}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SupportGrid() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            E também
          </p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight md:text-4xl">
            Tudo no preço da assinatura
          </h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {SUPPORT_FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/60 bg-card p-6"
            >
              <f.icon className="size-5 text-[#1a1a1a]" strokeWidth={1.75} />
              <h3 className="mt-3 font-display text-lg font-medium tracking-tight">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/contato"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f1916] py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
          >
            Ver o painel rodando
            <span className="grid size-7 place-items-center rounded-full bg-white/15">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
