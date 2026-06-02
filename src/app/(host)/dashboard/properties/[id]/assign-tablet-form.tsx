"use client";

import { useState, useTransition } from "react";
import { assignTabletToProperty } from "../actions";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";

export function AssignTabletForm({ propertyId }: { propertyId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setError(null);
          const code = (fd.get("tablet_code") as string) ?? "";
          const res = await assignTabletToProperty(propertyId, code);
          if (!res.ok) setError(res.error ?? "Erro");
        })
      }
      className="mt-3 space-y-3"
    >
      <p className="text-sm text-foreground/70">
        Nenhum tablet emparelhado. Digite o código impresso no tablet.
      </p>
      <Field label="Código do tablet" htmlFor="tablet_code">
        <input
          id="tablet_code"
          name="tablet_code"
          required
          placeholder="TAB-102"
          className={inputClass}
        />
      </Field>
      {error ? <FormMessage>{error}</FormMessage> : null}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Atribuindo…" : "Atribuir tablet"}
      </button>
    </form>
  );
}
