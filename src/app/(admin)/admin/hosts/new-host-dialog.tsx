"use client";

import { ReactNode, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createHostAsAdmin } from "../actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function NewHostDialog({ trigger }: { trigger: ReactNode }) {
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
                Novo anfitrião
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
                  const res = await createHostAsAdmin(fd);
                  if (res.ok) setOpen(false);
                  else setError(res.error ?? "Erro");
                })
              }
              className="mt-4 space-y-3"
            >
              <Field label="Nome do host" htmlFor="name">
                <input id="name" name="name" required className={inputClass} />
              </Field>
              <Field
                label="E-mail do dono"
                htmlFor="owner_email"
                hint="Vamos enviar um convite para criar a senha. Pode deixar em branco e atribuir depois."
              >
                <input
                  id="owner_email"
                  name="owner_email"
                  type="email"
                  className={inputClass}
                />
              </Field>
              <Field label="Plano" htmlFor="plan">
                <select
                  id="plan"
                  name="plan"
                  defaultValue="free"
                  className={inputClass}
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="business">Business</option>
                </select>
              </Field>

              {error ? <FormMessage>{error}</FormMessage> : null}

              <button type="submit" disabled={pending} className={primaryButtonClass}>
                {pending ? "Criando…" : "Criar anfitrião"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
