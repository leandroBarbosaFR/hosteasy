"use client";

import { useState, useTransition } from "react";
import { Clock, Check, ArrowRight } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { requestLateCheckout } from "@/app/(tablet)/tablet/[tabletCode]/actions";

export function LateCheckoutCard({
  tabletCode,
  price,
  until,
}: {
  tabletCode: string;
  price: number;
  until: string;
}) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<"idle" | "requested" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (state === "requested") {
    return (
      <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50/80 p-5 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-700">
            <Check className="size-5" />
          </div>
          <div>
            <p className="font-display text-lg font-medium tracking-tight">
              Pedido enviado
            </p>
            <p className="text-sm text-foreground/65">
              Avisamos o anfitrião. Você recebe a confirmação aqui.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-white via-white to-primary/5 p-5 shadow-sm backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
            <Clock className="size-3" /> Oferta para você
          </p>
          <h3 className="mt-3 font-display text-2xl font-medium tracking-tight">
            Precisa de mais tempo?
          </h3>
          <p className="mt-1 text-sm text-foreground/65">
            Estenda sua estadia até <strong>{until}</strong> de hoje.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
            Preço
          </p>
          <p className="font-display text-xl font-medium tracking-tight">
            {formatBRL(price)}
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError(null);
            const res = await requestLateCheckout(tabletCode);
            if (res.ok) setState("requested");
            else {
              setError(res.error ?? "Erro ao enviar");
              setState("error");
            }
          })
        }
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Solicitar late check-out"}
        <ArrowRight className="size-4" />
      </button>

      {error ? (
        <p className="mt-2 text-center text-[11px] text-destructive">{error}</p>
      ) : null}

      <p className="mt-2 text-center text-[10px] text-foreground/55">
        Sujeito à disponibilidade · pagamento confirmado pelo anfitrião
      </p>
    </div>
  );
}
