"use client";

import { useState, useTransition } from "react";
import { Clock, Check } from "lucide-react";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { updatePropertyROISettings } from "./roi-settings-actions";
import type { Property } from "@/types/db";

export function LateCheckoutSettings({ property }: { property: Property }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [enabled, setEnabled] = useState(property.late_checkout_enabled);

  return (
    <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Clock className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight">
            Vender late check-out
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            Quando o imóvel está livre, oferecer late check-out é receita pura.
            O Hosteasy mostra a oferta no tablet no dia do check-out.
          </p>
        </div>
      </div>

      <form
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("property_id", property.id);
            fd.set("section", "late_checkout");
            fd.set("late_checkout_enabled", enabled ? "1" : "");
            const res = await updatePropertyROISettings(fd);
            setMsg({ ok: res.ok, text: res.ok ? "Salvo." : res.error ?? "Erro" });
          })
        }
        className="mt-4 space-y-3"
      >
        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm">
          <span className="font-medium">Oferecer late check-out no tablet</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="size-4 rounded accent-primary"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço (R$)" htmlFor="late_checkout_price">
            <input
              id="late_checkout_price"
              name="late_checkout_price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={property.late_checkout_price ?? 89}
              className={inputClass}
              disabled={!enabled}
            />
          </Field>
          <Field label="Até que horas" htmlFor="late_checkout_until">
            <input
              id="late_checkout_until"
              name="late_checkout_until"
              type="time"
              defaultValue={property.late_checkout_until ?? "16:00"}
              className={inputClass}
              disabled={!enabled}
            />
          </Field>
        </div>

        {msg ? (
          <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
        ) : null}

        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando…" : (<><Check className="size-4" /> Salvar</>)}
        </button>
      </form>
    </section>
  );
}
