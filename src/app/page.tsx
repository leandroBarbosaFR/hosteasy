import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { TabletMockup } from "@/components/landing/tablet-mockup";
import { HostDashboardMockup } from "@/components/landing/host-dashboard-mockup";
import { Features } from "@/components/landing/features";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <HostDashboardSection />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-background">

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-16 md:grid-cols-12 md:items-center md:gap-8 md:pb-[60px] md:pt-24">
        <div className="md:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Tablet com IA · feito pra anfitriões em Floripa
          </div>

          <h1 className="mt-6 text-balance font-display text-5xl font-medium leading-[1.02] tracking-tight text-foreground md:text-[5.25rem]">
            Mais receita por estadia.{" "}
            <span className="italic text-primary">Menos pergunta</span> de hóspede.
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
            Tablet de 8&rdquo; sempre ligado no imóvel, com IA que aprende
            quais extras o seu hóspede compra. Sincroniza com Stays, Hostaway,
            Airbnb e +40 PMSs. Sem app, sem login, sem QR code hóspede toca,
            paga, você confirma.
          </p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
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
              href="#precos"
              className="inline-flex h-12 items-center gap-1.5 rounded-full bg-[#1f1916] px-5 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
            >
              Ver preços
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-2">
              <Avatar
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Marina, anfitriã"
              />
              <Avatar
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Rafael, anfitrião"
              />
              <Avatar
                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Ana, anfitriã"
              />
              <span className="grid size-9 place-items-center rounded-full border-2 border-background bg-sand text-[11px] font-semibold text-foreground/70">
                +
              </span>
            </div>
            <div className="leading-tight">
              <p className="flex items-center gap-1 text-sm font-semibold">
                <Star className="size-4 fill-primary text-primary" />
                4.9 · +R$ 850/mês por imóvel
              </p>
              <p className="text-xs text-foreground/55">
                em média, ganho extra reportado por 200+ anfitriões
              </p>
            </div>
          </div>
        </div>

        <div className="relative hidden md:col-span-6 md:block">
          <div className="relative mx-auto w-full max-w-3xl md:-mr-6 lg:-mr-10">
            <TabletMockup />
            <FloatingReservationCard />
            <FloatingMessageBubble />
          </div>
        </div>
      </div>
    </section>
  );
}

function Avatar({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="size-9 rounded-full border-2 border-background object-cover"
    />
  );
}

function FloatingReservationCard() {
  return (
    <div className="absolute -left-4 top-10 hidden w-48 -rotate-[4deg] overflow-hidden rounded-2xl border border-white/40 bg-white/45 p-3 shadow-xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 md:block lg:-left-10">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
      />
      <div className="relative flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-full bg-primary/20 text-[11px] font-semibold text-primary ring-1 ring-white/40">
          M
        </div>
        <div className="leading-tight">
          <p className="text-[11px] font-semibold text-foreground">
            Nova reserva
          </p>
          <p className="text-[10px] text-foreground/60">Vilas do Luiz · 102</p>
        </div>
        <span className="ml-auto size-2 rounded-full bg-sage shadow-[0_0_0_3px_rgba(124,140,106,0.18)]" />
      </div>
      <div className="relative mt-2 rounded-md border border-white/40 bg-white/40 px-2 py-1.5 text-[10px] font-medium leading-tight text-foreground/80 backdrop-blur">
        12 – 15 mai · 3 noites
        <span className="ml-1 font-semibold text-foreground">R$ 1.620</span>
      </div>
    </div>
  );
}

function FloatingMessageBubble() {
  return (
    <div className="absolute -bottom-6 right-0 hidden w-56 rotate-[3deg] overflow-hidden rounded-2xl rounded-bl-md border border-white/10 bg-espresso/65 p-3 text-white shadow-xl shadow-black/20 backdrop-blur-2xl backdrop-saturate-150 md:block lg:-right-6">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <p className="relative text-[10px] uppercase tracking-wider text-white/60">
        Hóspede · Marina
      </p>
      <p className="relative mt-1 text-xs leading-snug">
        Posso fazer early check-in? Chegamos antes das 14h 🙏
      </p>
      <div className="relative mt-2 flex items-center justify-between">
        <span className="text-[10px] text-white/45">há 2 min</span>
        <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider shadow-sm">
          responder
        </span>
      </div>
    </div>
  );
}

function HostDashboardSection() {
  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-[60px]">
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Para o anfitrião
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Tudo que vende, tudo que pergunta —{" "}
            <span className="italic text-primary">num só painel</span>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
            Veja quanto cada imóvel rende, qual extra converte mais, onde
            falta resposta no guia. Edite o conteúdo de um imóvel em 30
            segundos. Decisões baseadas em dado, não em achismo.
          </p>
        </div>
        <div className="mx-auto mt-14 hidden max-w-5xl md:block">
          <HostDashboardMockup />
        </div>
      </div>
    </section>
  );
}

