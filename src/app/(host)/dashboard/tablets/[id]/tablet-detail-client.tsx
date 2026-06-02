"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, RefreshCw, Trash2, Wifi, WifiOff } from "lucide-react";
import type { Property, Tablet } from "@/types/db";
import { effectiveTabletStatus, formatRelative } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { updateTablet, rotateTabletCode, deleteTablet } from "../actions";

export function TabletDetailClient({
  tablet,
  properties,
  installUrl,
  canDelete,
}: {
  tablet: Tablet;
  properties: Property[];
  installUrl: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const now = useNow();

  const effectiveStatus = now
    ? effectiveTabletStatus(tablet, now)
    : tablet.status;
  const lastSeen = now ? formatRelative(tablet.last_seen_at, now) : "—";

  async function copy() {
    try {
      await navigator.clipboard.writeText(installUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Install card -------------------------------------------------- */}
      <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-medium tracking-tight">
          Instalar no tablet físico
        </h2>
        <p className="mt-1 text-sm text-foreground/65">
          Aponte a câmera do tablet para o QR ou cole a URL no navegador.
          Depois adicione à tela inicial para virar um app.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-[160px_1fr]">
          <div className="grid place-items-center rounded-2xl border border-border/60 bg-white p-3">
            <QRCodeSVG value={installUrl} size={140} level="M" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              URL
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <code className="flex-1 truncate rounded-xl bg-muted px-3 py-2 text-xs">
                {installUrl}
              </code>
              <button
                type="button"
                onClick={copy}
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-2 text-xs font-semibold text-white hover:bg-foreground"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" /> Copiar
                  </>
                )}
              </button>
            </div>
            <p className="mt-3 text-[11px] text-foreground/60">
              No Fire / iPad / Android: abra a URL e use{" "}
              <span className="font-semibold">Adicionar à tela inicial</span>{" "}
              para abrir em tela cheia, como um app.
            </p>
          </div>
        </div>
      </section>

      {/* Status card --------------------------------------------------- */}
      <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-medium tracking-tight">
          Status
        </h2>
        <dl className="mt-3 space-y-2 text-sm">
          <Row
            label="Status"
            value={
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                  effectiveStatus === "online"
                    ? "bg-emerald-500/15 text-emerald-700"
                    : effectiveStatus === "maintenance"
                      ? "bg-amber-500/15 text-amber-700"
                      : "bg-foreground/10 text-foreground/60",
                )}
              >
                {effectiveStatus}
              </span>
            }
          />
          <Row label="Bateria" value={tablet.battery_percent != null ? `${tablet.battery_percent}%` : "—"} />
          <Row
            label="Wi-Fi"
            value={
              <span className="inline-flex items-center gap-1">
                {tablet.wifi_status === "connected" ? (
                  <Wifi className="size-3.5 text-emerald-600" />
                ) : (
                  <WifiOff className="size-3.5 text-foreground/40" />
                )}
                {tablet.wifi_status ?? "—"}
              </span>
            }
          />
          <Row label="Última atividade" value={lastSeen} />
        </dl>
      </section>

      {/* Settings form ------------------------------------------------- */}
      <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm lg:col-span-2">
        <h2 className="font-display text-lg font-medium tracking-tight">
          Configuração
        </h2>
        <form
          action={(fd) =>
            start(async () => {
              setMsg(null);
              fd.set("id", tablet.id);
              const res = await updateTablet(fd);
              setMsg({ ok: res.ok, text: res.ok ? "Salvo." : res.error ?? "Erro" });
            })
          }
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          <Field label="Imóvel" htmlFor="property_id">
            <select
              id="property_id"
              name="property_id"
              defaultValue={tablet.property_id ?? ""}
              className={inputClass}
            >
              <option value="">— Sem imóvel —</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.unit_code ? ` · ${p.unit_code}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Status" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={tablet.status}
              className={inputClass}
            >
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="maintenance">Manutenção</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            {msg ? (
              <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
            ) : null}
            <button disabled={pending} className={`${primaryButtonClass} mt-3`}>
              {pending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </section>

      {/* Danger zone --------------------------------------------------- */}
      <section className="rounded-3xl border border-destructive/30 bg-card p-6 shadow-sm">
        <h2 className="font-display text-lg font-medium tracking-tight">
          Zona de risco
        </h2>
        <p className="mt-1 text-xs text-foreground/65">
          Rotacionar gera um novo código. O tablet físico precisa ser reconfigurado.
        </p>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              setMsg(null);
              const res = await rotateTabletCode(tablet.id);
              if (res.ok) {
                setMsg({ ok: true, text: `Novo código: ${res.code}` });
                router.refresh();
              } else {
                setMsg({ ok: false, text: res.error ?? "Erro" });
              }
            })
          }
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10"
        >
          <RefreshCw className="size-3.5" /> Rotacionar código
        </button>

        {canDelete ? (
          <>
            {confirmDelete ? (
              <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                Tem certeza? Isso apaga o tablet e desconecta todas as estadias.
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      start(async () => {
                        const res = await deleteTablet(tablet.id);
                        if (res.ok) router.push("/dashboard/tablets");
                        else setMsg({ ok: false, text: res.error ?? "Erro" });
                      })
                    }
                    className="rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Sim, excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15"
              >
                <Trash2 className="size-3.5" /> Excluir tablet
              </button>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
      <dt className="text-[11px] uppercase tracking-wider text-foreground/55">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground capitalize">
        {value}
      </dd>
    </div>
  );
}
