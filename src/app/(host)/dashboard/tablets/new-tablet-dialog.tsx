"use client";

import { ReactNode, useState, useTransition } from "react";
import { X } from "@phosphor-icons/react/ssr";
import { createTablet } from "./actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

type Property = { id: string; name: string; unit_code: string | null };

export function NewTabletDialog({
  properties,
  trigger,
}: {
  properties: Property[];
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
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
                Novo tablet
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
                  const res = await createTablet(fd);
                  if (res.ok) close();
                  else setError(res.error ?? "Erro");
                })
              }
              className="mt-4 space-y-3"
            >
              <Field
                label="Código do tablet (opcional)"
                htmlFor="tablet_code"
                hint="Deixe vazio para gerar um código seguro automaticamente."
              >
                <input
                  id="tablet_code"
                  name="tablet_code"
                  placeholder="Gerado automaticamente"
                  className={inputClass}
                />
              </Field>
              <Field
                label="Imóvel (opcional)"
                htmlFor="property_id"
                hint="Pode atribuir depois."
              >
                <select id="property_id" name="property_id" className={inputClass} defaultValue="">
                  <option value="">— Sem imóvel —</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.unit_code ? ` · ${p.unit_code}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              {error ? <FormMessage>{error}</FormMessage> : null}

              <button type="submit" disabled={pending} className={primaryButtonClass}>
                {pending ? "Cadastrando…" : "Cadastrar tablet"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
