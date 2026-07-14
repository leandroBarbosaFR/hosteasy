"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendUp as TrendingUp } from "@phosphor-icons/react/ssr";

/** Médias observadas por imóvel/mês — as mesmas usadas na seção de recursos. */
const EXTRAS_PER_PROPERTY = 400;
const PARTNERS_PER_PROPERTY = 220;
const COST_PER_PROPERTY = 99;

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function RoiCalculator() {
  const [properties, setProperties] = useState(3);
  const sliderId = useId();

  const extras = properties * EXTRAS_PER_PROPERTY;
  const partners = properties * PARTNERS_PER_PROPERTY;
  const cost = properties * COST_PER_PROPERTY;
  const net = extras + partners - cost;

  return (
    <section className="relative overflow-hidden bg-card/40 py-14 md:py-[60px]">
      <div className="relative mx-auto max-w-5xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Faça a conta
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Custa {brl.format(COST_PER_PROPERTY)}.{" "}
            <span className="text-primary">Volta muito mais.</span>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
            Arraste para o seu número de imóveis e veja a estimativa mensal.
          </p>
        </div>

        <div className="mx-auto mt-14 max-w-3xl overflow-hidden rounded-3xl border border-white/50 bg-white/50 p-7 shadow-[0_1px_2px_rgba(31,25,22,0.04)] backdrop-blur-2xl backdrop-saturate-150 md:p-10">
          <label
            htmlFor={sliderId}
            className="flex items-baseline justify-between gap-4"
          >
            <span className="text-sm font-medium text-foreground/70">
              Quantos imóveis você administra?
            </span>
            <span className="font-display text-3xl font-bold tracking-tight text-foreground">
              {properties}
              {properties === 20 && "+"}
            </span>
          </label>

          <input
            id={sliderId}
            type="range"
            min={1}
            max={20}
            step={1}
            value={properties}
            onChange={(e) => setProperties(Number(e.target.value))}
            className="mt-5 h-2 w-full cursor-pointer appearance-none rounded-full bg-foreground/10 accent-primary outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          />
          <div className="mt-2 flex justify-between text-[11px] font-medium text-foreground/40">
            <span>1 imóvel</span>
            <span>20+ imóveis</span>
          </div>

          <dl className="mt-9 grid gap-3 sm:grid-cols-3">
            <Row label="Extras vendidos no tablet" value={`+ ${brl.format(extras)}`} />
            <Row label="Comissão de parceiros" value={`+ ${brl.format(partners)}`} />
            <Row label="Custo do hosteasy" value={`− ${brl.format(cost)}`} muted />
          </dl>

          <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#1f1916] p-6 sm:flex-row sm:items-center">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/50">
                <TrendingUp className="size-3.5 text-primary" />
                Sobra no seu bolso, por mês
              </p>
              <p className="mt-1.5 font-display text-4xl font-bold tracking-tight text-primary">
                {brl.format(net)}
              </p>
              <p className="mt-1 text-xs text-white/45">
                {brl.format(net * 12)} por ano
              </p>
            </div>
            <Link
              href="/demo"
              className="group inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white transition-[box-shadow] duration-200 hover:shadow-[5px_5px_0_0_rgba(255,255,255,0.9)]"
            >
              Quero essa conta
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-foreground/45">
            Estimativa com base na média dos anfitriões ativos em Florianópolis.
            Resultado varia com ocupação, diária e mix de extras.
          </p>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/50 bg-white/50 p-4">
      <dt className="text-xs leading-snug text-foreground/55">{label}</dt>
      <dd
        className={`mt-1.5 font-display text-xl font-bold tracking-tight ${
          muted ? "text-foreground/70" : "text-foreground"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
