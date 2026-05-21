import { User, Building2, Hotel, Briefcase } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { FinalCta } from "@/components/landing/final-cta";

const PROFILES = [
  {
    icon: User,
    range: "1–2 imóveis",
    title: "Anfitrião solo",
    body: "Você gerencia o seu próprio apê e tá cansado de responder \"qual é a senha do Wi-Fi?\" no domingo de manhã. Quer ganhar mais por estadia sem precisar virar empresa.",
    wins: [
      "Para de viver no WhatsApp",
      "+R$ 400–600/mês em extras",
      "Setup em 5 dias, sem TI",
    ],
  },
  {
    icon: Building2,
    range: "3–10 imóveis",
    title: "Anfitrião multipropriedade",
    body: "Você já tem prédio próprio ou um portfólio espalhado. Precisa de um painel único que mostre receita por imóvel e padronize o atendimento, sem perder a personalidade de cada propriedade.",
    wins: [
      "Painel multi-imóvel com receita por unidade",
      "Conteúdo personalizado por imóvel",
      "Comissão de parceiros somada no fim do mês",
    ],
    featured: true,
  },
  {
    icon: Hotel,
    range: "Pousada / hotel boutique",
    title: "Hotelaria independente",
    body: "Você quer experiência de hotel sem custo de hotel. Tablets dão concierge digital, vendem o café da manhã, ajudam o hóspede sem precisar contratar mais staff.",
    wins: [
      "Concierge digital 24h, em 5 idiomas",
      "Upsell de café, spa, passeios",
      "Avaliações 5 estrelas com gatilho automático",
    ],
  },
  {
    icon: Briefcase,
    range: "10+ imóveis",
    title: "Property manager profissional",
    body: "Você gerencia para outros donos e cada % de margem importa. Integramos com seu PMS, padronizamos atendimento e gerimos uma camada de receita extra que vai direto pro seu bolso (ou pro do proprietário, você escolhe).",
    wins: [
      "Integra com Stays, Hostaway, Lodgify, Airbnb",
      "Split de receita configurável por imóvel",
      "API completa para relatórios próprios",
    ],
  },
];

export default function ParaQuemEPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Profiles />
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
          Para quem é
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          Funciona pra{" "}
          <span className="text-primary">1 imóvel</span> ou{" "}
          <span className="text-primary">100</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Anfitrião solo, gestor multipropriedade, pousada boutique ou
          property manager profissional — o painel se adapta ao seu tamanho
          de operação.
        </p>
      </div>
    </section>
  );
}

function Profiles() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2">
        {PROFILES.map((p) => (
          <article
            key={p.title}
            className={`relative rounded-3xl border p-7 ${
              p.featured
                ? "border-foreground/20 bg-card shadow-[6px_6px_0_0_var(--color-primary)]"
                : "border-border/60 bg-card"
            }`}
          >
            {p.featured && (
              <span className="absolute right-6 top-6 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Mais comum
              </span>
            )}
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              {p.range}
            </p>
            <div className="mt-3 flex items-center gap-3">
              <p.icon
                className="size-7 text-[#1a1a1a]"
                strokeWidth={1.5}
              />
              <h2 className="font-display text-2xl font-medium tracking-tight">
                {p.title}
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground/70">
              {p.body}
            </p>
            <ul className="mt-5 space-y-2">
              {p.wins.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-2.5 text-sm text-foreground/80"
                >
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {w}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
