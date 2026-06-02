"use client";

import { useState, useTransition } from "react";
import {
  Coffee,
  Clock,
  Car,
  ShoppingBasket,
  Sparkles,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Extra } from "@/types/db";

const ICONS = {
  coffee: Coffee,
  clock: Clock,
  car: Car,
  basket: ShoppingBasket,
} as const;

export function ExtraCard({
  extra,
  onOrder,
  manageHref,
}: {
  extra: Extra;
  onOrder?: (id: string) => Promise<{ ok: boolean; error?: string }>;
  manageHref?: string;
}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const Icon: typeof Sparkles =
    (extra.icon && ICONS[extra.icon as keyof typeof ICONS]) || Sparkles;

  return (
    <div className="flex flex-col rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <span className="text-sm font-semibold">{formatBRL(extra.price)}</span>
      </div>

      <h3 className="mt-3 font-display text-lg font-medium tracking-tight">
        {extra.title}
      </h3>
      {extra.description ? (
        <p className="mt-1 text-sm text-foreground/65">{extra.description}</p>
      ) : null}

      {manageHref ? (
        <a
          href={manageHref}
          className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10"
        >
          Editar
        </a>
      ) : onOrder ? (
        <button
          type="button"
          disabled={pending || done}
          onClick={() =>
            start(async () => {
              const res = await onOrder(extra.id);
              if (res.ok) setDone(true);
              else setError(res.error ?? "Não foi possível pedir.");
            })
          }
          className={cn(
            "mt-4 inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
            done
              ? "bg-emerald-500 text-white"
              : "bg-foreground/90 text-white hover:bg-foreground",
          )}
        >
          {done ? (
            <>
              <Check className="size-3.5" /> Pedido enviado
            </>
          ) : pending ? (
            "Enviando…"
          ) : (
            <>
              <Plus className="size-3.5" /> Pedir
            </>
          )}
        </button>
      ) : null}

      {error ? (
        <p className="mt-2 text-[11px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value));
}
