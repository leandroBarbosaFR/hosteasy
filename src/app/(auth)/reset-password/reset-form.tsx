"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { resetPasswordAction, type ActionState } from "../actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState<ActionState | null, FormData>(
    resetPasswordAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field
        label="Nova senha"
        htmlFor="password"
        hint="Mínimo 6 caracteres."
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="••••••••"
          className={inputClass}
        />
      </Field>

      {state && !state.ok ? <FormMessage>{state.error}</FormMessage> : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButtonClass}>
      {pending ? "Salvando…" : "Salvar nova senha"}
      <span className="grid size-7 place-items-center rounded-full bg-white/15">
        <ArrowRight className="size-3.5" />
      </span>
    </button>
  );
}
