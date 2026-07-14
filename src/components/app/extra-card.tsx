"use client";

import { useState, useTransition } from "react";
import { Coffee, Clock, Car, Basket as ShoppingBasket, Sparkle as Sparkles, Plus, Check, Gift as GiftIcon, AppleLogo as Apple } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { formatBRL } from "@/lib/format";
import type { Extra, ExtraCategory } from "@/types/db";

const CATEGORY_META: Record<
  ExtraCategory,
  { Icon: typeof Coffee; cta: string }
> = {
  late_checkout:   { Icon: Clock,          cta: "Solicitar late check-out" },
  breakfast:       { Icon: Coffee,         cta: "Pedir café da manhã" },
  transfer:        { Icon: Car,            cta: "Reservar transfer" },
  welcome_basket:  { Icon: GiftIcon,       cta: "Pedir cesta de boas-vindas" },
  groceries:       { Icon: ShoppingBasket, cta: "Pedir compras prontas" },
  custom:          { Icon: Sparkles,       cta: "Pedir agora" },
};

// Legacy icon strings still seen in seed data
const LEGACY_ICONS: Record<string, typeof Coffee> = {
  coffee: Coffee,
  clock: Clock,
  car: Car,
  basket: ShoppingBasket,
  apple: Apple,
};

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

  const meta = CATEGORY_META[extra.category] ?? CATEGORY_META.custom;
  const Icon: typeof Coffee =
    (extra.icon && LEGACY_ICONS[extra.icon]) || meta.Icon;
  const cta = meta.cta;

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
      {/* Image header */}
      <div
        className={cn(
          "relative aspect-[16/10] w-full",
          extra.image_url ? "" : "bg-gradient-to-br from-primary/15 via-white to-primary/10",
        )}
      >
        {extra.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={extra.image_url}
            alt={extra.title}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-primary">
            <Icon className="size-10" />
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold backdrop-blur">
          {formatBRL(extra.price)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold tracking-tight">
          {extra.title}
        </h3>
        {extra.description ? (
          <p className="mt-1 line-clamp-3 text-sm text-foreground/65">
            {extra.description}
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          {manageHref ? (
            <a
              href={manageHref}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10"
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
                "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-sm font-semibold transition-colors",
                done
                  ? "bg-emerald-500 text-white"
                  : "bg-foreground text-white hover:opacity-90",
              )}
            >
              {done ? (
                <>
                  <Check className="size-4" /> Pedido enviado
                </>
              ) : pending ? (
                "Enviando…"
              ) : (
                <>
                  <Plus className="size-4" /> {cta}
                </>
              )}
            </button>
          ) : null}

          {error ? (
            <p className="mt-2 text-[11px] text-destructive">{error}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
