"use client";

import { useState, useTransition } from "react";
import { Broom as BrushCleaning, Check } from "@phosphor-icons/react/ssr";
import { createCleaningFromReservation } from "@/app/(staff)/staff/actions";

// One-tap "schedule the post-checkout clean" on a reservation row.
export function ScheduleCleaningButton({
  reservationId,
}: {
  reservationId: string;
}) {
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <Check className="size-3" /> Limpeza agendada
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        title="Criar tarefa de limpeza pós check-out"
        onClick={() =>
          start(async () => {
            setErr(null);
            const r = await createCleaningFromReservation(reservationId, null);
            if (r.ok) setDone(true);
            else setErr(r.error ?? "Erro");
          })
        }
        className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-foreground/10 disabled:opacity-50"
      >
        <BrushCleaning className="size-3" />
        {pending ? "Agendando…" : "Limpeza"}
      </button>
      {err ? <span className="text-[10px] text-destructive">{err}</span> : null}
    </span>
  );
}
