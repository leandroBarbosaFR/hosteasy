"use client";

import { useState, useTransition } from "react";
import { Check } from "@phosphor-icons/react/ssr";
import { updateTabletSettings } from "../actions";
import { Field, FormMessage } from "@/components/app/auth-shell";
import type { TabletSettings } from "@/types/db";

export function SettingsForm({
  tabletCode,
  defaults,
}: {
  tabletCode: string;
  defaults: TabletSettings;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setMsg(null);
          const res = await updateTabletSettings(tabletCode, fd);
          setMsg({ ok: res.ok, text: res.ok ? "Ajustes salvos." : res.error ?? "Erro" });
        })
      }
      className="space-y-5 rounded-3xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-xl"
    >
      <Field label="Idioma" htmlFor="language">
        <select
          id="language"
          name="language"
          defaultValue={defaults.language}
          className="w-full rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm outline-none"
        >
          <option value="pt-BR">Português</option>
          <option value="en-US">English</option>
          <option value="es-ES">Español</option>
        </select>
      </Field>

      <RangeField label="Volume" name="volume" defaultValue={defaults.volume} />
      <RangeField label="Brilho" name="brightness" defaultValue={defaults.brightness} />

      <Field label="Notificações" htmlFor="notifications">
        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm">
          <span>Receber notificações do anfitrião</span>
          <input
            id="notifications"
            name="notifications"
            type="checkbox"
            defaultChecked={defaults.notifications}
            className="size-4 rounded accent-primary"
          />
        </label>
      </Field>

      {msg ? (
        <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-foreground py-1.5 px-5 text-sm font-semibold text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Salvando…" : (<><Check className="size-4" /> Salvar ajustes</>)}
      </button>
    </form>
  );
}

function RangeField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: number;
}) {
  const [v, setV] = useState(defaultValue);
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          {label}
        </span>
        <span className="text-xs font-semibold">{v}%</span>
      </div>
      <input
        name={name}
        type="range"
        min={0}
        max={100}
        value={v}
        onChange={(e) => setV(Number(e.target.value))}
        className="mt-2 w-full accent-primary"
      />
    </div>
  );
}
