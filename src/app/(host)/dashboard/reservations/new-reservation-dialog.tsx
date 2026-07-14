"use client";

import { ReactNode, useState, useTransition } from "react";
import { createReservation } from "./actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { X } from "@phosphor-icons/react/ssr";

type Property = { id: string; name: string; unit_code: string | null };

export function NewReservationDialog({
  properties,
  trigger,
  defaultOpen,
}: {
  properties: Property[];
  trigger: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(!!defaultOpen);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setError(null);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {trigger}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-bold tracking-tight">
                Nova reserva
              </h2>
              <button
                type="button"
                onClick={close}
                className="grid size-8 place-items-center rounded-full text-foreground/60 hover:bg-muted"
                aria-label="Fechar"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              action={(fd) =>
                start(async () => {
                  setError(null);
                  const res = await createReservation(fd);
                  if (res.ok) close();
                  else setError(res.error ?? "Erro");
                })
              }
              className="mt-4 space-y-3"
            >
              <Field label="Imóvel" htmlFor="property_id">
                <select
                  id="property_id"
                  name="property_id"
                  required
                  className={inputClass}
                  defaultValue={properties[0]?.id}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.unit_code ? ` · ${p.unit_code}` : ""}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Hóspede" htmlFor="guest_name">
                <input id="guest_name" name="guest_name" required className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Check-in" htmlFor="check_in">
                  <input
                    id="check_in"
                    name="check_in"
                    type="date"
                    required
                    className={inputClass}
                  />
                </Field>
                <Field label="Check-out" htmlFor="check_out">
                  <input
                    id="check_out"
                    name="check_out"
                    type="date"
                    required
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field label="Valor (R$)" htmlFor="amount">
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={inputClass}
                />
              </Field>
              <Field label="Origem" htmlFor="source">
                <select id="source" name="source" className={inputClass} defaultValue="manual">
                  <option value="manual">Manual</option>
                  <option value="airbnb">Airbnb</option>
                  <option value="booking">Booking</option>
                  <option value="other">Outra</option>
                </select>
              </Field>

              {error ? <FormMessage>{error}</FormMessage> : null}

              <button type="submit" disabled={pending} className={primaryButtonClass}>
                {pending ? "Salvando…" : "Criar reserva"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
