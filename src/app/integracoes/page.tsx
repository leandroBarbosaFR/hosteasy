import Link from "next/link";
import { ArrowRight, Plug, CreditCard, Sparkles, Mail } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { FinalCta } from "@/components/landing/final-cta";

const FEATURED_PMS = [
  { name: "Airbnb", src: "/Airbnb_Logo_0.svg" },
  { name: "Booking.com", src: "/Booking-com_Logo_0.svg" },
  { name: "Seazone", src: "/logo-azul-com-laranja.png" },
];

const PMS_LIST = [
  "Anytime Booking",
  "Avantio",
  "Beds24",
  "BookingSync",
  "Direct",
  "Escapia",
  "FantasticStay",
  "Guesty",
  "icnea",
  "iGMS",
  "Kigo",
  "LiveRez",
  "Mews",
  "myVR",
  "Newbook",
  "Rentals United",
  "Smoobu",
  "Streamline",
  "SuperControl",
  "Tokeet",
  "Track",
  "Uplisting",
  "Zeevou",
];

const PAYMENTS = ["Stripe", "Pix (todos os bancos)", "Mercado Pago", "PagSeguro"];

const HOUSEKEEPING = [
  "Breezeway",
  "ResortCleaning",
  "PropertyCare",
  "EZ Inspections",
];

export default function IntegracoesPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <FeaturedPms />
        <OtherCategories />
        <SuggestIntegration />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" />
          Integrações
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-medium leading-[1.05] tracking-tight md:text-6xl">
          Conectamos com{" "}
          <span className="italic text-primary">o que você já usa</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Sincronize reservas, mensagens e dados do hóspede em tempo real
          com seu PMS, OTA e meios de pagamento. Sem planilha, sem
          copiar-e-colar.
        </p>
      </div>
    </section>
  );
}

function FeaturedPms() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              PMS & OTA
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-tight md:text-4xl">
              Os que importam pro Brasil
            </h2>
          </div>
          <Plug className="hidden size-7 text-foreground/30 md:block" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FEATURED_PMS.map((p) => (
            <PmsCard key={p.name} name={p.name} src={p.src} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-border/60 bg-card p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            +40 outros PMSs
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            Também sincronizamos automaticamente com:
          </p>
          <ul className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-foreground/65">
            {PMS_LIST.map((name) => (
              <li
                key={name}
                className="rounded-full bg-background px-3 py-1 ring-1 ring-border/60"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PmsCard({ name, src }: { name: string; src: string }) {
  return (
    <div className="group flex aspect-[5/3] items-center justify-center rounded-2xl border border-border/60 bg-card p-8 transition-shadow hover:shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={name}
        className="h-10 max-w-full object-contain"
      />
      <span className="sr-only">{name}</span>
    </div>
  );
}

function OtherCategories() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto grid max-w-6xl gap-5 px-6 md:grid-cols-2">
        <CategoryCard
          icon={<CreditCard className="size-5" />}
          title="Pagamentos"
          desc="Cobramos os extras direto no cartão do hóspede ou via Pix, sem você precisar gerenciar fatura."
          items={PAYMENTS}
        />
        <CategoryCard
          icon={<Sparkles className="size-5" />}
          title="Limpeza & manutenção"
          desc="Tarefas geradas automaticamente entre check-out e próximo check-in."
          items={HOUSEKEEPING}
        />
      </div>
    </section>
  );
}

function CategoryCard({
  icon,
  title,
  desc,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  items: string[];
}) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-background text-[#1a1a1a] ring-1 ring-border/60">
          {icon}
        </span>
        <h3 className="font-display text-xl font-medium tracking-tight">
          {title}
        </h3>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-foreground/70">
        {desc}
      </p>
      <ul className="mt-5 flex flex-wrap gap-2 text-sm">
        {items.map((i) => (
          <li
            key={i}
            className="rounded-full bg-background px-3 py-1 text-foreground/70 ring-1 ring-border/60"
          >
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SuggestIntegration() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="flex flex-col items-start gap-6 rounded-3xl border border-border/60 bg-card p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <div className="flex items-start gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-background text-[#1a1a1a] ring-1 ring-border/60">
              <Mail className="size-5" />
            </span>
            <div>
              <h3 className="font-display text-2xl font-medium tracking-tight">
                Não viu o seu PMS aqui?
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-foreground/70">
                Se você usa outro sistema, conta pra gente. Conectamos com
                qualquer PMS que tenha API — geralmente em uma semana.
              </p>
            </div>
          </div>
          <Link
            href="/contato"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#1f1916] py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
          >
            Sugerir integração
            <span className="grid size-7 place-items-center rounded-full bg-white/15">
              <ArrowRight className="size-3.5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
