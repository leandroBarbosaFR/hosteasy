"use client";

import { useState, useTransition } from "react";
import { Broom as BrushCleaning, Check } from "@phosphor-icons/react/ssr";
import { SPECIALTY_LABELS } from "@/lib/labels";
import { inputClass } from "@/components/app/auth-shell";
import { updateDefaultCleaner } from "../actions";
import type { WorkerSpecialty } from "@/types/db";

type Member = {
  userId: string;
  name: string;
  specialty: WorkerSpecialty;
};

// Pick who cleans this property. With a default cleaner set, every new
// reservation auto-creates the post-checkout cleaning task assigned to them.
export function DefaultCleanerSettings({
  propertyId,
  currentCleanerId,
  members,
}: {
  propertyId: string;
  currentCleanerId: string | null;
  members: Member[];
}) {
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <BrushCleaning className="size-4 text-foreground/60" />
        <h2 className="font-display text-lg font-bold tracking-tight">
          Limpeza automática
        </h2>
      </div>
      <p className="mt-1 text-sm text-foreground/65">
        Com uma pessoa padrão definida, cada nova reserva já cria a tarefa de
        limpeza pós check-out atribuída a ela — sem você fazer nada.
      </p>

      {members.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground/55">
          Convide alguém da equipe em Ajustes → Time para habilitar.
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-2">
          <select
            defaultValue={currentCleanerId ?? ""}
            disabled={pending}
            onChange={(e) => {
              setErr(null);
              setSaved(false);
              const value = e.target.value || null;
              start(async () => {
                const r = await updateDefaultCleaner(propertyId, value);
                if (r.ok) {
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2500);
                } else {
                  setErr(r.error ?? "Erro");
                }
              });
            }}
            className={inputClass}
            aria-label="Pessoa padrão de limpeza"
          >
            <option value="">— Sem limpeza automática —</option>
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.name} · {SPECIALTY_LABELS[m.specialty]}
              </option>
            ))}
          </select>
          {saved ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <Check className="size-3" /> Salvo
            </span>
          ) : null}
        </div>
      )}
      {err ? <p className="mt-2 text-[11px] text-destructive">{err}</p> : null}
    </div>
  );
}
