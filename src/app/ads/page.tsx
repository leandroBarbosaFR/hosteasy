"use client";

import { useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import { TabletMockup } from "@/components/landing/tablet-mockup";
import { Wordmark } from "@/components/landing/logo";
import { cn } from "@/lib/utils";

const FORMATS = {
  square: { label: "Feed 1:1", aspect: "aspect-square" },
  portrait: { label: "Feed 4:5", aspect: "aspect-[4/5]" },
  story: { label: "Story 9:16", aspect: "aspect-[9/16]" },
} as const;

type FormatKey = keyof typeof FORMATS;

const VARIANTS = [
  {
    eyebrow: "Para anfitriões em Floripa",
    headline: "Mais receita por estadia.",
    accent: "Menos pergunta de hóspede.",
    metric: "+R$ 850/mês",
    metricLabel: "por imóvel",
    cta: "hosteasy.com.br",
  },
  {
    eyebrow: "27 minutos no tablet",
    headline: "O tempo certo pra",
    accent: "vender o late check-out.",
    metric: "−70%",
    metricLabel: "mensagens",
    cta: "Agende uma demo · 15 min",
  },
  {
    eyebrow: "Tablet com IA",
    headline: "Pare de viver no",
    accent: "WhatsApp do hóspede.",
    metric: "+200",
    metricLabel: "anfitriões",
    cta: "hosteasy.com.br",
  },
];

export default function AdsPage() {
  const [format, setFormat] = useState<FormatKey>("portrait");
  const [variant, setVariant] = useState(0);
  const v = VARIANTS[variant];

  return (
    <div className="min-h-screen bg-foreground/8 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
            Formato
          </p>
          {(Object.keys(FORMATS) as FormatKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFormat(k)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                format === k
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground/70 hover:bg-background/80"
              )}
            >
              {FORMATS[k].label}
            </button>
          ))}
          <span className="ml-4 inline-block h-4 w-px bg-foreground/15" />
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
            Headline
          </p>
          {VARIANTS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setVariant(i)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                variant === i
                  ? "bg-foreground text-background"
                  : "bg-background text-foreground/70 hover:bg-background/80"
              )}
            >
              v{i + 1}
            </button>
          ))}
          <span className="ml-auto rounded-full bg-background px-3 py-1 text-[11px] text-foreground/60">
            Capture: Cmd+Shift+4 → arraste no canvas
          </span>
        </div>

        <div
          className={cn(
            "relative mx-auto w-full overflow-hidden rounded-[28px] shadow-2xl shadow-black/20",
            FORMATS[format].aspect,
            format === "square" && "max-w-[680px]",
            format === "portrait" && "max-w-[600px]",
            format === "story" && "max-w-[420px]"
          )}
        >
          <AdCanvas format={format} v={v} />
        </div>
      </div>
    </div>
  );
}

function AdCanvas({
  format,
  v,
}: {
  format: FormatKey;
  v: (typeof VARIANTS)[number];
}) {
  return (
    <div className="absolute inset-0 bg-background">
      {/* warm glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-primary/15 blur-3xl"
      />

      {/* logo top-left */}
      <div className="absolute left-6 top-6 md:left-8 md:top-8">
        <Wordmark className="h-6 w-auto" />
      </div>

      {/* metric chip top-right */}
      <div className="absolute right-6 top-6 rounded-2xl bg-[#1f1916] px-3 py-2 text-white shadow-lg md:right-8 md:top-8">
        <p className="font-display text-lg font-medium leading-none">
          {v.metric}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/60">
          {v.metricLabel}
        </p>
      </div>

      {/* headline */}
      <div
        className={cn(
          "absolute left-6 right-6 md:left-8 md:right-8",
          format === "story"
            ? "top-[14%]"
            : format === "portrait"
              ? "top-[14%]"
              : "top-[16%]"
        )}
      >
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/60">
          {v.eyebrow}
        </p>
        <h2
          className={cn(
            "mt-2 text-balance font-display font-medium leading-[1.02] tracking-tight",
            format === "story"
              ? "text-3xl"
              : format === "portrait"
                ? "text-[28px]"
                : "text-2xl"
          )}
        >
          {v.headline}{" "}
          <span className="text-primary">{v.accent}</span>
        </h2>
      </div>

      {/* iPad with floating glass cards */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2",
          format === "story"
            ? "bottom-[18%] w-[88%]"
            : format === "portrait"
              ? "bottom-[14%] w-[90%]"
              : "bottom-[10%] w-[78%]"
        )}
      >
        <div className="relative">
          <TabletMockup />
          <FloatingReservationCard />
          <FloatingMessageBubble />
        </div>
      </div>

      {/* footer pill / CTA */}
      <div className="absolute inset-x-0 bottom-6 flex justify-center md:bottom-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1f1916] px-3.5 py-1.5 text-xs font-semibold text-white">
          <Star className="size-3.5 fill-primary text-primary" />
          {v.cta}
          <ArrowRight className="size-3.5" />
        </div>
      </div>
    </div>
  );
}

function FloatingReservationCard() {
  return (
    <div className="absolute -left-3 top-6 w-36 -rotate-[4deg] overflow-hidden rounded-2xl border border-white/40 bg-white/45 p-2.5 shadow-xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
      />
      <div className="relative flex items-center gap-2">
        <div className="grid size-6 place-items-center rounded-full bg-primary/20 text-[10px] font-semibold text-primary ring-1 ring-white/40">
          M
        </div>
        <div className="leading-tight">
          <p className="text-[10px] font-semibold text-foreground">
            Nova reserva
          </p>
          <p className="text-[9px] text-foreground/60">Vilas do Luiz</p>
        </div>
      </div>
      <div className="relative mt-1.5 rounded-md border border-white/40 bg-white/40 px-1.5 py-1 text-[9px] font-semibold leading-tight text-foreground/80 backdrop-blur">
        12–15 mai · R$ 1.620
      </div>
    </div>
  );
}

function FloatingMessageBubble() {
  return (
    <div className="absolute -bottom-4 -right-2 w-44 rotate-[3deg] overflow-hidden rounded-2xl rounded-bl-md border border-white/10 bg-[#1f1916]/70 p-2.5 text-white shadow-xl shadow-black/20 backdrop-blur-2xl backdrop-saturate-150">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      <p className="relative text-[9px] uppercase tracking-wider text-white/60">
        Marina · hóspede
      </p>
      <p className="relative mt-0.5 text-[11px] leading-snug">
        Early check-in às 13h? 🙏
      </p>
    </div>
  );
}
