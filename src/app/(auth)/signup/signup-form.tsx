"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ArrowRight } from "lucide-react";
import { signupAction, type ActionState } from "../actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function SignupForm() {
  const [state, formAction] = useActionState<ActionState | null, FormData>(
    signupAction,
    null,
  );

  return (
    <form action={formAction} className="space-y-3">
      <Field label="Nome" htmlFor="fullName">
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          required
          placeholder="Seu nome"
          className={inputClass}
        />
      </Field>

      <Field label="Nome do negócio" htmlFor="hostName" hint="Como aparece para hóspedes.">
        <input
          id="hostName"
          name="hostName"
          type="text"
          placeholder="Pousada da Vila"
          className={inputClass}
        />
      </Field>

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

      <Field label="Senha" htmlFor="password" hint="Mínimo 6 caracteres.">
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

      {state ? (
        state.ok ? (
          <FormMessage kind="success">{state.message ?? "Conta criada."}</FormMessage>
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
      {pending ? "Criando conta…" : "Criar conta"}
      <span className="grid size-7 place-items-center rounded-full bg-white/15">
        <ArrowRight className="size-3.5" />
      </span>
    </button>
  );
}
