import Link from "next/link";
import { ArrowRight, Coins, Heart, Headset, MapPinned } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { Wordmark } from "@/components/landing/logo";

export const metadata = {
  title: "Brand guideline · HostEasy",
};

const SWATCHES = [
  {
    name: "Cream",
    role: "Background",
    hex: "#FAF7F4",
    oklch: "oklch(0.97 0.005 70)",
    text: "dark",
  },
  {
    name: "Pink",
    role: "Primary · Accent",
    hex: "#E5395A",
    oklch: "oklch(0.643 0.237 17.5)",
    text: "light",
  },
  {
    name: "Espresso",
    role: "Foreground · Dark CTA",
    hex: "#1F1916",
    oklch: "oklch(0.22 0.012 50)",
    text: "light",
  },
  {
    name: "Sand",
    role: "Muted surface",
    hex: "#E8DCC6",
    oklch: "oklch(0.92 0.022 76)",
    text: "dark",
  },
  {
    name: "Sage",
    role: "Secondary accent",
    hex: "#7C8C6A",
    oklch: "oklch(0.65 0.05 128)",
    text: "light",
  },
  {
    name: "Card",
    role: "Warm white surface",
    hex: "#FCFBF8",
    oklch: "oklch(0.995 0.006 78)",
    text: "dark",
  },
];

export default function BrandGuidelinePage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Logo />
        <Colors />
        <Typography />
        <Components />
        <Shadows />
        <Iconography />
        <Voice />
      </main>
      <SiteFooter />
    </>
  );
}

function Section({
  number,
  eyebrow,
  title,
  desc,
  children,
}: {
  number: string;
  eyebrow: string;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border/60 py-14 md:py-[60px]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-10 md:grid-cols-[1fr_2fr] md:gap-14">
          <div>
            <p className="font-display text-sm italic text-foreground/45">
              {number}
            </p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              {eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium leading-[1.1] tracking-tight md:text-4xl">
              {title}
            </h2>
            {desc && (
              <p className="mt-4 text-sm leading-relaxed text-foreground/65">
                {desc}
              </p>
            )}
          </div>
          <div>{children}</div>
        </div>
      </div>
    </section>
  );
}

function Hero() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" />
          Brand guideline · v1
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-7xl">
          Como{" "}
          <span className="italic text-primary">o hosteasy</span> se mostra
          ao mundo.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Cores, tipografia, componentes e o tom de voz que mantêm cada
          ponto de contato com anfitrião e hóspede consistente.
        </p>
      </div>
    </section>
  );
}

function Logo() {
  return (
    <Section
      number="01"
      eyebrow="Identidade"
      title="Logo"
      desc="O wordmark sempre em minúsculas. 'host' em rosa primary, 'easy' em foreground. Espaço seguro mínimo igual à altura do x."
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-10 rounded-3xl border border-border/60 bg-card p-10">
          <Wordmark className="h-12 w-auto" />
          <Wordmark className="h-7 w-auto" />
          <Wordmark className="h-5 w-auto" />
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex items-center justify-center rounded-3xl bg-[#1f1916] p-10">
            <Wordmark
              className="h-10 w-auto invert"
              alt="hosteasy (on dark)"
            />
          </div>
          <div className="flex items-center justify-center rounded-3xl border border-border/60 bg-card p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="Favicon" className="size-20" />
          </div>
        </div>
      </div>
    </Section>
  );
}

function Colors() {
  return (
    <Section
      number="02"
      eyebrow="Cores"
      title="Paleta"
      desc="Rosa primary só como acento (ctas, ênfases). Cream é o palco. Espresso é o contraste sério. Sand e sage entram só pra texturizar."
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {SWATCHES.map((s) => (
          <div
            key={s.name}
            className="overflow-hidden rounded-2xl border border-border/60"
          >
            <div
              className={`flex h-32 items-end p-4 ${
                s.text === "light" ? "text-white" : "text-foreground"
              }`}
              style={{ backgroundColor: s.hex }}
            >
              <p className="font-display text-xl font-medium leading-none">
                {s.name}
              </p>
            </div>
            <div className="bg-card px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                {s.role}
              </p>
              <p className="mt-1 font-mono text-xs text-foreground/80">
                {s.hex}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-foreground/50">
                {s.oklch}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Typography() {
  return (
    <Section
      number="03"
      eyebrow="Tipografia"
      title="Fraunces + Geist"
      desc="Fraunces (serif variável, eixos SOFT e opsz) carrega a personalidade — usar em headlines com itálico para ênfase. Geist Sans cuida do corpo e da UI."
    >
      <div className="space-y-8">
        <div className="rounded-3xl border border-border/60 bg-card p-8">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-2xl italic text-primary">
              Fraunces
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
              Display · Serif
            </p>
          </div>
          <p className="mt-6 font-display text-6xl font-medium leading-[1.02] tracking-tight md:text-7xl">
            Mais receita por estadia.
          </p>
          <p className="mt-3 font-display text-4xl font-medium italic text-primary">
            Menos pergunta de hóspede.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
            <span>weight 500</span>
            <span>tracking-tight</span>
            <span>leading 1.02</span>
          </div>
        </div>

        <div className="rounded-3xl border border-border/60 bg-card p-8">
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold tracking-tight">Geist Sans</p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
              Body · UI
            </p>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-2xl font-semibold tracking-tight">
              Tablet de 8&rdquo; sempre ligado.
            </p>
            <p className="text-base leading-relaxed text-foreground/70">
              Corpo de texto. Hóspedes passam em média 27 minutos no tablet
              por estadia — tempo de sobra pra IA priorizar os extras
              certos e responder dúvidas óbvias.
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              Eyebrow / Microcopy
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Components() {
  return (
    <Section
      number="04"
      eyebrow="Componentes"
      title="Padrões repetidos"
      desc="Cinco blocos visuais aparecem em todo o site: pill eyebrow, headline serif com itálico colorido, dois CTAs (pink + espresso), card glass e cards de produto."
    >
      <div className="space-y-5">
        <Demo label="Eyebrow pill">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Tablet com IA · feito pra Floripa
          </span>
        </Demo>

        <Demo label="Headline com ênfase italica">
          <p className="text-balance font-display text-3xl font-medium leading-[1.05] tracking-tight">
            O tablet que cuida{" "}
            <span className="italic text-primary">da sua estadia</span> por
            você.
          </p>
        </Demo>

        <Demo label="CTAs">
          <div className="flex flex-wrap gap-3">
            <Link
              href="#"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-primary py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow] duration-200 hover:shadow-[6px_6px_0_0_#1f1916]"
            >
              Agendar demonstração
              <span className="grid size-8 place-items-center rounded-full bg-white/20">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            <Link
              href="#"
              className="inline-flex h-12 items-center gap-1.5 rounded-full bg-[#1f1916] px-5 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
            >
              Ver preços
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </Demo>

        <Demo label="Glass card (sobre superfície clara)">
          <div className="relative max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white/45 p-6 shadow-md shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
            />
            <Coins className="size-6 text-[#1a1a1a]" strokeWidth={1.75} />
            <h3 className="mt-4 font-display text-xl font-medium tracking-tight">
              Extras que se vendem sozinhos
            </h3>
            <p className="mt-2 text-sm text-foreground/70">
              Card translúcido com edge-highlight na borda superior.
            </p>
          </div>
        </Demo>

        <Demo label="Product card (com foto)">
          <div className="grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-background ring-1 ring-border/60">
                <Heart className="size-5 text-[#1a1a1a]" strokeWidth={1.75} />
              </div>
              <p className="mt-3 font-display text-base font-medium tracking-tight">
                Reservas diretas
              </p>
              <p className="mt-1 text-[11px] text-foreground/60">
                +18% no portfólio
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="grid size-10 place-items-center rounded-xl bg-background ring-1 ring-border/60">
                <Headset
                  className="size-5 text-[#1a1a1a]"
                  strokeWidth={1.75}
                />
              </div>
              <p className="mt-3 font-display text-base font-medium tracking-tight">
                Atendimento
              </p>
              <p className="mt-1 text-[11px] text-foreground/60">
                −70% mensagens
              </p>
            </div>
          </div>
        </Demo>
      </div>
    </Section>
  );
}

function Shadows() {
  return (
    <Section
      number="05"
      eyebrow="Sombra"
      title="Solid offset shadow"
      desc="Toda sombra de hover é sólida, sem blur. CTA rosa recebe sombra espresso. CTA escuro recebe sombra rosa. Offset padrão: 6px 6px (5px no header)."
    >
      <div className="space-y-5">
        <div className="rounded-3xl border border-border/60 bg-card p-10">
          <div className="flex flex-wrap items-end gap-10">
            <div className="text-center">
              <div className="size-20 rounded-2xl bg-primary shadow-[6px_6px_0_0_#1f1916]" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                Pink + espresso
              </p>
            </div>
            <div className="text-center">
              <div className="size-20 rounded-2xl bg-[#1f1916] shadow-[6px_6px_0_0_var(--color-primary)]" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                Espresso + pink
              </p>
            </div>
            <div className="text-center">
              <div className="size-20 rounded-full bg-card shadow-[6px_6px_0_0_var(--color-primary)] ring-1 ring-border/60" />
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                Avatar
              </p>
            </div>
          </div>
        </div>
        <pre className="overflow-x-auto rounded-2xl bg-[#1f1916] p-5 text-xs leading-relaxed text-white/90">
{`/* base */
box-shadow: 6px 6px 0 0 <color>;

/* hover transition */
transition: box-shadow 200ms ease;`}
        </pre>
      </div>
    </Section>
  );
}

function Iconography() {
  return (
    <Section
      number="06"
      eyebrow="Ícones"
      title="Lucide, naked"
      desc="lucide-react com strokeWidth 1.75, sem fundo nem borda. Cor padrão #1a1a1a em fundo claro, white em fundo escuro. Nunca rosa (rosa é só pra acento)."
    >
      <div className="rounded-3xl border border-border/60 bg-card p-10">
        <div className="grid grid-cols-4 gap-6">
          {[Coins, MapPinned, Heart, Headset].map((Icon, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Icon
                className="size-8 text-[#1a1a1a]"
                strokeWidth={1.75}
              />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                {Icon.displayName ?? `Icon ${i}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Voice() {
  return (
    <Section
      number="07"
      eyebrow="Voz"
      title="Como falamos"
      desc="Português brasileiro, direto, com leve sotaque de Floripa. Confirma a dor → mostra o resultado em número → explica o como. Nunca abstrato, sempre específico."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/[0.04] p-7">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            Sim
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
            <li>
              &ldquo;Pare de responder &lsquo;qual é a senha do Wi-Fi&rsquo;
              pela 47ª vez no mês.&rdquo;
            </li>
            <li>&ldquo;+R$ 850/mês por imóvel, em média.&rdquo;</li>
            <li>
              &ldquo;Marca 15 min comigo, sem pitch. Se não fizer sentido a
              gente desliga e fica de boa.&rdquo;
            </li>
            <li>
              &ldquo;Vizinha de Campeche · iFood pré-conectado · Stays e
              Hostaway sincronizando.&rdquo;
            </li>
          </ul>
        </div>
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/[0.04] p-7">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-rose-700">
            Não
          </p>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/80">
            <li>
              &ldquo;Revolutionize sua experiência de hospedagem com IA de
              próxima geração.&rdquo;
            </li>
            <li>
              &ldquo;Otimize seu fluxo operacional e potencialize o
              engajamento.&rdquo;
            </li>
            <li>&ldquo;Sinergias inovadoras para anfitriões 4.0.&rdquo;</li>
            <li>&ldquo;Pronto para escalar?&rdquo; (vazio sem número)</li>
          </ul>
        </div>
      </div>
    </Section>
  );
}

function Demo({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-7">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
        {label}
      </p>
      <div className="mt-4">{children}</div>
    </div>
  );
}
