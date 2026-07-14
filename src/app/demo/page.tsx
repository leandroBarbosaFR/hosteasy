import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChatCircle as MessageCircle, Calendar, Clock, CheckCircle as CheckCircle2, ShieldCheck } from "@phosphor-icons/react/ssr";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { CONTACT_EMAIL, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Agendar demo · Hosteasy",
  description:
    "15 minutos comigo, com o painel real rodando no seu imóvel. Sem pitch, sem deck.",
};

// Pre-filled WhatsApp message specific to "agendar demo" intent. Different
// from the generic /contato message so we can attribute leads later.
const WHATSAPP_DEMO_HREF = whatsappLink(
  "Oi Leandro! Quero agendar 15 min de demo do Hosteasy. " +
    "Posso falar [coloque seu melhor horário].",
);

export default function DemoPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Booking />
        <WhatToExpect />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" />
          Demo
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          15 minutos comigo —{" "}
          <span className="text-primary">com o painel rodando</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Não é deck, não é pitch. Te mostro um tablet ligado num imóvel
          real aqui de Floripa e como a receita aparece no painel do
          anfitrião.
        </p>
      </div>
    </section>
  );
}

function Booking() {
  return (
    <section className="bg-background pb-14 md:pb-[60px]">
      <div className="mx-auto max-w-3xl px-6">
        <div className="overflow-hidden rounded-3xl border border-foreground/10 bg-card shadow-sm">
          <div className="grid items-stretch gap-0 md:grid-cols-[1fr_1fr]">
            {/* Left: pitch */}
            <div className="border-b border-border/60 p-7 md:border-b-0 md:border-r">
              <div className="flex items-center gap-2">
                <Calendar className="size-5 text-primary" weight="light" />
                <h2 className="font-display text-xl font-bold tracking-tight">
                  Agendar pelo WhatsApp
                </h2>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Forma mais rápida. Você manda seu melhor horário, eu confirmo
                em até 10 min em horário comercial.
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-foreground/75">
                <Bullet>15 minutos, sem deck</Bullet>
                <Bullet>Painel real, dados reais</Bullet>
                <Bullet>Resposta em ~10 min</Bullet>
              </ul>
              <Link
                href={WHATSAPP_DEMO_HREF}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle className="size-4" />
                Marcar pelo WhatsApp
                <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* Right: alternative channels */}
            <div className="p-7">
              <div className="flex items-center gap-2">
                <Clock className="size-5 text-foreground/60" weight="light" />
                <h2 className="font-display text-xl font-bold tracking-tight">
                  Prefere outro canal?
                </h2>
              </div>
              <div className="mt-4 space-y-3">
                <Link
                  href={`mailto:${CONTACT_EMAIL}?subject=Demo%20Hosteasy`}
                  className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium hover:bg-muted/40"
                >
                  <span>E-mail</span>
                  <ArrowRight className="size-4 text-foreground/40" />
                </Link>
                <Link
                  href="/contato"
                  className="flex items-center justify-between rounded-2xl border border-border/60 px-4 py-3 text-sm font-medium hover:bg-muted/40"
                >
                  <span>Ver todos os canais</span>
                  <ArrowRight className="size-4 text-foreground/40" />
                </Link>
              </div>
              <p className="mt-6 inline-flex items-center gap-1.5 text-xs text-foreground/55">
                <ShieldCheck className="size-3.5" />
                Sem cadastro, sem cobrança.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WhatToExpect() {
  const steps = [
    {
      title: "1 · Conta sua operação",
      desc: "Quantos imóveis, quais OTAs, onde você perde tempo hoje.",
    },
    {
      title: "2 · Vejo seu painel rodando",
      desc: "Compartilho a tela com Marina, Tiago e Família Oliveira em estadia.",
    },
    {
      title: "3 · Math no fim",
      desc: "Quanto Hosteasy gera vs. quanto custa — pra você decidir.",
    },
  ];
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center font-display text-3xl font-bold leading-[1.05] tracking-tight md:text-4xl">
          O que cabe em 15 minutos
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div
              key={s.title}
              className="rounded-3xl border border-border/60 bg-card p-6"
            >
              <h3 className="font-display text-lg font-bold tracking-tight">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2">
      <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
      <span>{children}</span>
    </li>
  );
}
