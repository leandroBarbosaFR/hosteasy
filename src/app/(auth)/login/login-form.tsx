"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { loginAction, type ActionState } from "../actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<ActionState | null, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      <Field label="E-mail" htmlFor="email">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="seu@email.com.br"
          className={inputClass}
        />
      </Field>

      <Field label="Senha" htmlFor="password">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>

      {state && !state.ok ? (
        <FormMessage>{state.error}</FormMessage>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Entrando…" : "Entrar"}
      <span className="grid size-7 place-items-center rounded-full bg-white/15">
        <ArrowRight className="size-3.5" />
      </span>
    </button>
  );
}
