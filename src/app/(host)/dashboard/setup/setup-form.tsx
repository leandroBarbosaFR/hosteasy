"use client";

import { useTransition, useState } from "react";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { createHostForCurrentUser } from "./actions";

export function SetupForm({ defaultName }: { defaultName: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const name = (fd.get("name") as string)?.trim();
          if (!name || name.length < 2) {
            setError("Diga o nome do negócio.");
            return;
          }
          try {
            await createHostForCurrentUser(name);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Falha.");
          }
        })
      }
      className="space-y-3"
    >
      <Field label="Nome do negócio" htmlFor="name">
        <input
          id="name"
          name="name"
          required
          minLength={2}
          defaultValue={defaultName}
          className={inputClass}
          placeholder="Pousada da Vila"
        />
      </Field>
      {error ? <FormMessage>{error}</FormMessage> : null}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Criando…" : "Continuar"}
        <span className="grid size-7 place-items-center rounded-full bg-white/15">
          <ArrowRight className="size-3.5" />
        </span>
      </button>
    </form>
  );
}
