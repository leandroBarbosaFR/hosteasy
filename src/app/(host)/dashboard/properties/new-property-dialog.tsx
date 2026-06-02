"use client";

import { ReactNode, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createProperty } from "./actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function NewPropertyDialog({ trigger }: { trigger: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {trigger}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm md:items-center">
          <div className="w-full max-w-md rounded-3xl border border-border/60 bg-card p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="font-display text-xl font-medium tracking-tight">
                Novo imóvel
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
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
                  const res = await createProperty(fd);
                  if (res.ok) setOpen(false);
                  else setError(res.error ?? "Erro");
                })
              }
              className="mt-4 space-y-3"
            >
              <Field label="Nome" htmlFor="name">
                <input id="name" name="name" required className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Unidade" htmlFor="unit_code">
                  <input id="unit_code" name="unit_code" className={inputClass} placeholder="102" />
                </Field>
                <Field label="Cidade" htmlFor="city">
                  <input id="city" name="city" className={inputClass} placeholder="Florianópolis" />
                </Field>
              </div>
              <Field label="Endereço" htmlFor="address">
                <input id="address" name="address" className={inputClass} />
              </Field>
              <Field label="Estado" htmlFor="state">
                <input id="state" name="state" className={inputClass} placeholder="SC" />
              </Field>

              {error ? <FormMessage>{error}</FormMessage> : null}

              <button type="submit" disabled={pending} className={primaryButtonClass}>
                {pending ? "Salvando…" : "Salvar"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
