"use client";

import { useState } from "react";
import { Coins, MapPinned, Heart, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Coins,
    metric: "+R$ 400/mês",
    title: "Extras que se vendem sozinhos",
    body: "Hoje o hóspede sai sem nem saber que existia late check-out, café da manhã ou faxina extra. No tablet, ele toca, autorizamos no cartão, você confirma e fica com 90% do que entrou.",
  },
  {
    icon: MapPinned,
    metric: "+R$ 220/mês",
    title: "Comissão de parceiros locais",
    body: "iFood, restaurantes, escolas de surf, passeios de barco tudo pré-conectado por bairro de Floripa. Hóspede gasta sem sair do tablet, você recebe 20% no fim do mês. Sem precisar mover um dedo.",
  },
  {
    icon: Heart,
    metric: "+18% reservas diretas",
    title: "Menos Airbnb, mais hóspede seu",
    body: "Sua marca aparece em cada estadia, hóspede entra no seu CRM e recebe programa de indicação. Da próxima vez ele reserva direto com você sem você pagar 17% pra OTA.",
  },
  {
    icon: Headset,
    metric: "−70% mensagens",
    title: "Pare de responder “qual a senha do Wi-Fi”",
    body: "Vídeo-guia da casa (cafeteira, ar, TV), check-in digital e chat em 5 idiomas direto no tablet. Cada pergunta automatizada é uma noite sua sem o WhatsApp tocando.",
  },
];

export function Features() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-[60px]">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Recursos
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Quatro receitas que você está{" "}
            <span className="italic text-primary">perdendo todo mês</span>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
            Hóspedes passam em média{" "}
            <span className="font-semibold text-foreground">
              27 minutos no tablet
            </span>{" "}
            por estadia tempo de sobra pra IA priorizar os extras certos,
            responder as dúvidas óbvias e te trazer reservas diretas.
          </p>
        </div>

        {/* Mobile: stacked cards */}
        <div className="mt-14 grid gap-5 md:hidden">
          {features.map((f) => (
            <article
              key={f.title}
              className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/45 p-7 shadow-md shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150"
            >
              <div className="mb-5 flex items-center justify-between">
                <f.icon
                  className="size-6 text-[#1a1a1a]"
                  strokeWidth={1.75}
                />
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
                  {f.metric}
                </span>
              </div>
              <h3 className="font-display text-xl font-medium tracking-tight">
                {f.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                {f.body}
              </p>
            </article>
          ))}
        </div>

        {/* Desktop: horizontal expanding panels */}
        <div
          className="mt-14 hidden h-[420px] gap-5 md:flex"
          onMouseLeave={() => setActive(null)}
        >
          {features.map((f, i) => {
            const isActive = i === active;
            const shadowColor =
              i % 2 === 0 ? "var(--color-primary)" : "#1f1916";
            return (
              <article
                key={f.title}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                tabIndex={0}
                style={{
                  boxShadow: isActive
                    ? `6px 6px 0 0 ${shadowColor}`
                    : "0 0 0 0 transparent",
                }}
                className={cn(
                  "group relative cursor-pointer overflow-hidden rounded-3xl border transition-[flex-grow,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  "border-white/50 backdrop-blur-2xl backdrop-saturate-150 outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isActive
                    ? "flex-[5] bg-white/55"
                    : "flex-[1] bg-white/30 hover:bg-white/40"
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                />

                {/* Closed state: vertical title + icon */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col items-center gap-4 p-6 transition-opacity duration-300",
                    isActive
                      ? "pointer-events-none opacity-0"
                      : "opacity-100 delay-200"
                  )}
                >
                  <f.icon
                    className="size-6 shrink-0 text-[#1a1a1a]"
                    strokeWidth={1.75}
                  />
                  <span className="text-balance rounded-2xl bg-primary/10 px-2 py-1.5 text-center text-[10px] font-semibold leading-tight text-primary ring-1 ring-primary/15">
                    {f.metric}
                  </span>
                  <p
                    className="mt-auto font-display text-lg font-medium tracking-tight text-foreground"
                    style={{
                      writingMode: "vertical-rl",
                      transform: "rotate(180deg)",
                    }}
                  >
                    {f.title}
                  </p>
                </div>

                {/* Open state: full content */}
                <div
                  className={cn(
                    "absolute inset-0 flex flex-col p-7 transition-opacity duration-300",
                    isActive
                      ? "opacity-100 delay-200"
                      : "pointer-events-none opacity-0"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <f.icon
                      className="size-6 text-[#1a1a1a]"
                      strokeWidth={1.75}
                    />
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/15">
                      {f.metric}
                    </span>
                  </div>
                  <h3 className="mt-auto font-display text-2xl font-medium leading-tight tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                    {f.body}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
