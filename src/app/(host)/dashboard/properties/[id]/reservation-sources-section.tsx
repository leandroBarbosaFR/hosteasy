"use client";

import { useState, useTransition } from "react";
import { Plus, RefreshCw, Trash2, CheckCircle2, AlertTriangle, ExternalLink } from "lucide-react";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { useNow } from "@/lib/use-now";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  addReservationSource,
  syncReservationSource,
  deleteReservationSource,
} from "./reservation-sources-actions";
import type { ReservationSourceRow } from "@/types/db";

export function ReservationSourcesSection({
  propertyId,
  sources,
  importedCount,
}: {
  propertyId: string;
  sources: ReservationSourceRow[];
  importedCount: number;
}) {
  const [adding, setAdding] = useState<"airbnb" | "booking" | null>(null);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const now = useNow(60_000);

  return (
    <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight">
            Importar reservas automaticamente
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            Conecte o calendário do Airbnb ou Booking.com e o Hosteasy passa a
            saber quem vai chegar — sem digitar uma reserva.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          {importedCount} importadas
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {sources.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-foreground/15 bg-background/60 px-4 py-3 text-sm text-foreground/55">
            Nenhum calendário conectado ainda.
          </li>
        ) : (
          sources.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/50 bg-background/60 px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-foreground/70">
                    {s.source_type}
                  </span>
                  <span className="text-sm font-semibold">
                    {s.source_name ?? labelFor(s.source_type)}
                  </span>
                  {s.last_sync_status === "success" ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                  ) : s.last_sync_status === "error" ? (
                    <AlertTriangle className="size-3.5 text-destructive" />
                  ) : null}
                </div>
                <p className="mt-0.5 truncate text-[11px] text-foreground/55">
                  {now
                    ? s.last_synced_at
                      ? `Última sincronização ${formatRelative(s.last_synced_at, now)}`
                      : "Ainda não sincronizado"
                    : ""}
                </p>
                {s.last_sync_error ? (
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-destructive">
                    {s.last_sync_error}
                  </p>
                ) : null}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      setMsg(null);
                      const res = await syncReservationSource(s.id);
                      setMsg({
                        ok: res.ok,
                        text: res.ok
                          ? `Sincronizado: ${("imported" in res && res.imported) || 0} novas, ${("updated" in res && res.updated) || 0} atualizadas.`
                          : ("error" in res && res.error) || "Erro",
                      });
                    })
                  }
                  className="inline-flex items-center gap-1 rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-foreground/10"
                >
                  <RefreshCw className="size-3.5" /> Sincronizar
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    start(async () => {
                      await deleteReservationSource(s.id);
                    })
                  }
                  className="grid size-8 place-items-center rounded-full text-foreground/55 hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remover"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {!adding ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAdding("airbnb")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="size-3.5" /> Conectar Airbnb
          </button>
          <button
            type="button"
            onClick={() => setAdding("booking")}
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-2 text-xs font-semibold text-white hover:bg-foreground"
          >
            <Plus className="size-3.5" /> Conectar Booking.com
          </button>
        </div>
      ) : (
        <form
          action={(fd) =>
            start(async () => {
              setMsg(null);
              fd.set("property_id", propertyId);
              fd.set("source_type", adding!);
              const res = await addReservationSource(fd);
              if (res.ok) {
                setAdding(null);
                setMsg({ ok: true, text: "Calendário conectado e sincronizado." });
              } else {
                setMsg({ ok: false, text: res.error ?? "Erro" });
              }
            })
          }
          className="mt-4 space-y-3 rounded-2xl border border-border/50 bg-background/60 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground/55">
            Conectar {adding === "airbnb" ? "Airbnb" : "Booking.com"}
          </p>
          <p className="text-xs text-foreground/65">
            {adding === "airbnb" ? (
              <>
                No Airbnb, vá em <strong>Calendário → Disponibilidade → Sincronizar com outros sites</strong> e copie o link
                de exportação para Hosteasy.{" "}
                <a
                  href="https://www.airbnb.com.br/help/article/99"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
                >
                  Ajuda <ExternalLink className="size-3" />
                </a>
              </>
            ) : (
              <>
                No Booking.com Extranet, vá em <strong>Tarifas e disponibilidade → Sincronização de calendários</strong> e
                copie o link iCal de exportação.
              </>
            )}
          </p>

          <Field label="URL do calendário (.ics)" htmlFor="ical_url">
            <input
              id="ical_url"
              name="ical_url"
              type="url"
              required
              placeholder="https://www.airbnb.com.br/calendar/ical/12345.ics?s=..."
              className={inputClass}
            />
          </Field>
          <Field label="Apelido (opcional)" htmlFor="source_name">
            <input
              id="source_name"
              name="source_name"
              placeholder="Ex: Calendário Airbnb"
              className={inputClass}
            />
          </Field>

          {msg && !msg.ok ? <FormMessage>{msg.text}</FormMessage> : null}

          <div className="flex gap-2">
            <button type="submit" disabled={pending} className={primaryButtonClass}>
              {pending ? "Conectando…" : "Conectar e sincronizar"}
            </button>
            <button
              type="button"
              onClick={() => setAdding(null)}
              className="rounded-full bg-foreground/5 px-4 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {msg && msg.ok ? (
        <div className={cn("mt-3")}>
          <FormMessage kind="success">{msg.text}</FormMessage>
        </div>
      ) : null}
    </section>
  );
}

function labelFor(t: string) {
  if (t === "airbnb") return "Airbnb";
  if (t === "booking") return "Booking.com";
  return "Outro";
}
