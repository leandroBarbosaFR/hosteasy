"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { forgotPasswordAction, type ActionState } from "../actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState<ActionState | null, FormData>(
    forgotPasswordAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
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

      {state ? (
        state.ok ? (
          <FormMessage kind="success">{state.message}</FormMessage>
        ) : (
          <FormMessage>{state.error}</FormMessage>
        )
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Enviando…" : "Enviar link"}
      <span className="grid size-7 place-items-center rounded-full bg-white/15">
        <ArrowRight className="size-3.5" />
      </span>
    </button>
  );
}
