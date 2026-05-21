import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { TabletMockup } from "@/components/landing/tablet-mockup";
import { HostDashboardMockup } from "@/components/landing/host-dashboard-mockup";
import { Features } from "@/components/landing/features";
import { LogoMarquee } from "@/components/landing/logo-marquee";
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
        <LogoMarquee />
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
      <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-14 pt-16 text-center md:pb-[60px] md:pt-24">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-3 px-3 py-1.5">
            <div className="flex -space-x-1.5">
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
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-foreground/80">
              <Star className="size-3.5 fill-primary text-primary" />
              4.9 · 200+ anfitriões
            </span>
          </div>
        </div>

        <h1 className="mt-8 text-balance font-display text-5xl font-medium leading-[1.02] tracking-tight text-foreground md:text-[5.25rem]">
          Aumente a receita por estadia.{" "}
          <span className="text-primary">Reduza as perguntas</span> do hóspede.
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Transforme a experiência no imóvel com um tablet inteligente que ajuda o hóspede a comprar extras, tirar dúvidas e agir na hora. Sem app, sem login, sem QR code. O hóspede toca, paga, você confirma.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/demo"
            className={cn(
              buttonVariants({ size: "lg" }),
              "group relative h-12 w-[280px] overflow-hidden rounded-full border-0 bg-clip-border text-sm font-semibold transition-[box-shadow] duration-200 [a]:hover:bg-primary hover:shadow-[6px_6px_0_0_#1f1916]"
            )}
          >
            <span
              aria-hidden
              className="absolute left-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-white/20 transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:translate-x-[232px] group-hover:rotate-[720deg]"
            >
              <ArrowRight className="size-4" />
            </span>
            <span className="absolute inset-y-0 left-12 right-5 flex items-center justify-center transition-transform duration-[900ms] ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:-translate-x-[42px]">
              Agendar demonstração
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

        <div className="relative mt-14 w-full max-w-3xl md:mt-20">
          <TabletMockup />
          <FloatingReservationCard />
          <FloatingMessageBubble />
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
            Tudo que vende, tudo que pergunta{" "}
            <span className="text-primary">num só painel</span>
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

