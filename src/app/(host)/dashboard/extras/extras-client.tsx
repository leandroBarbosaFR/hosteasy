"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, X, UploadSimple as Upload, Check, Warning as AlertTriangle } from "@phosphor-icons/react/ssr";
import { ExtraCard } from "@/components/app/extra-card";
import { EmptyState } from "@/components/app/empty-state";
import { StatCard } from "@/components/app/stat-card";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  orderStatusMeta,
  isOpenOrder,
  isPaidOrder,
  isAwaitingPayment,
  canCancelOrder,
} from "@/lib/orders";
import {
  saveExtra,
  deleteExtra,
  uploadExtraImage,
  approveExtraOrder,
  markOrderPaid,
  markOrderDelivered,
  cancelOrder,
} from "./actions";
import type { Extra, ExtraCategory } from "@/types/db";

const CATEGORY_LABELS: Record<ExtraCategory, string> = {
  late_checkout: "Late check-out",
  breakfast: "Café da manhã",
  transfer: "Transfer",
  welcome_basket: "Cesta de boas-vindas",
  groceries: "Compras prontas",
  custom: "Outro",
};

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  extra_title: string;
  extra_category: string;
  guest_name: string;
  property_name: string;
};

export function ExtrasClient({
  extras,
  orders,
  properties,
  monthRevenue,
  canManage,
}: {
  extras: Extra[];
  orders: Order[];
  properties: { id: string; name: string; unit_code: string | null }[];
  monthRevenue: number;
  canManage: boolean;
}) {
  const [editing, setEditing] = useState<Extra | "new" | null>(null);

  const pendingCount = orders.filter((o) => isOpenOrder(o.status)).length;
  const paidCount = orders.filter((o) => isPaidOrder(o.status)).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Receita do mês" value={formatBRL(monthRevenue)} />
        <StatCard label="Pedidos pagos" value={String(paidCount)} />
        <StatCard label="Aguardando" value={String(pendingCount)} />
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Catálogo</h2>
          {canManage ? (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" /> Novo extra
            </button>
          ) : null}
        </div>

        {extras.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="Nenhum extra cadastrado"
              description="Adicione 3-4 extras com fotos boas. Café da manhã e late check-out costumam vender mais."
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {extras.map((e) => (
              <div key={e.id} className="relative">
                <ExtraCard extra={e} />
                {canManage ? (
                  <button
                    type="button"
                    onClick={() => setEditing(e)}
                    className="absolute right-3 top-3 rounded-full bg-foreground/85 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 transition-opacity hover:opacity-100 focus:opacity-100"
                  >
                    Editar
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold">Pedidos recentes</h2>
        {orders.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-foreground/15 bg-white/40 px-4 py-6 text-center text-sm text-foreground/55">
            Sem pedidos ainda. Quando um hóspede pedir no tablet, aparece aqui.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {orders.map((o) => (
              <OrderRow key={o.id} order={o} canManage={canManage} />
            ))}
          </ul>
        )}
      </section>

      {editing ? (
        <ExtraEditor
          extra={editing === "new" ? null : editing}
          properties={properties}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function OrderRow({ order, canManage }: { order: Order; canManage: boolean }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {order.extra_title}{" "}
          <span className="font-normal text-foreground/55">· {order.guest_name}</span>
        </p>
        <p className="truncate text-[11px] text-foreground/55">
          {order.property_name} · {new Date(order.created_at).toLocaleString("pt-BR")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold">{formatBRL(order.total)}</span>
        <StatusPill status={order.status} />
        {canManage ? (
          <div className="flex gap-1">
            {order.status === "pending" ? (
              <ActionButton
                label="Aprovar"
                onClick={() =>
                  start(async () => {
                    const r = await approveExtraOrder(order.id);
                    if (!r.ok) setErr(r.error ?? "Erro");
                  })
                }
                pending={pending}
              />
            ) : null}
            {isAwaitingPayment(order.status) ? (
              <ActionButton
                label="Marcar pago"
                onClick={() =>
                  start(async () => {
                    const r = await markOrderPaid(order.id);
                    if (!r.ok) setErr(r.error ?? "Erro");
                  })
                }
                pending={pending}
                primary
              />
            ) : null}
            {order.status === "paid" ? (
              <ActionButton
                label="Entregue"
                onClick={() =>
                  start(async () => {
                    const r = await markOrderDelivered(order.id);
                    if (!r.ok) setErr(r.error ?? "Erro");
                  })
                }
                pending={pending}
                primary
              />
            ) : null}
            {canCancelOrder(order.status) ? (
              <ActionButton
                label="Cancelar"
                onClick={() =>
                  start(async () => {
                    const r = await cancelOrder(order.id);
                    if (!r.ok) setErr(r.error ?? "Erro");
                  })
                }
                pending={pending}
                danger
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {err ? (
        <p className="basis-full text-[11px] text-destructive">{err}</p>
      ) : null}
    </li>
  );
}

function ActionButton({
  label,
  onClick,
  pending,
  primary,
  danger,
}: {
  label: string;
  onClick: () => void;
  pending?: boolean;
  primary?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors",
        primary
          ? "bg-emerald-600 text-white hover:bg-emerald-700"
          : danger
            ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
            : "bg-foreground/5 text-foreground hover:bg-foreground/10",
      )}
    >
      {label}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const m = orderStatusMeta(status);
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        m.cls,
      )}
    >
      {m.label}
    </span>
  );
}

function ExtraEditor({
  extra,
  properties,
  onClose,
}: {
  extra: Extra | null;
  properties: { id: string; name: string; unit_code: string | null }[];
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(extra?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [savedId, setSavedId] = useState<string | null>(extra?.id ?? null);

  async function handleUpload(file: File) {
    if (!savedId) {
      setErr("Salve o extra antes de subir a imagem.");
      return;
    }
    setUploading(true);
    setErr(null);
    const fd = new FormData();
    fd.set("file", file);
    const res = await uploadExtraImage(savedId, fd);
    setUploading(false);
    if (res.ok && res.url) setImageUrl(res.url);
    else setErr(res.error ?? "Erro no upload.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl">
        <div className="flex items-start justify-between p-6 pb-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {extra ? "Editar extra" : "Novo extra"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-8 place-items-center rounded-full text-foreground/60 hover:bg-muted"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          action={(fd) =>
            start(async () => {
              setErr(null);
              if (extra?.id) fd.set("id", extra.id);
              const res = await saveExtra(fd);
              if (!res.ok) {
                setErr(res.error ?? "Erro");
                return;
              }
              if (res.id) setSavedId(res.id);
            })
          }
          className="space-y-3 px-6 pb-6"
        >
          <Field label="Título" htmlFor="title">
            <input
              id="title"
              name="title"
              required
              defaultValue={extra?.title}
              className={inputClass}
              placeholder="Café da manhã"
            />
          </Field>
          <Field label="Descrição" htmlFor="description">
            <textarea
              id="description"
              name="description"
              defaultValue={extra?.description ?? ""}
              rows={2}
              className={`${inputClass} rounded-2xl`}
              placeholder="O que o hóspede recebe?"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria" htmlFor="category">
              <select
                id="category"
                name="category"
                defaultValue={extra?.category ?? "breakfast"}
                className={inputClass}
              >
                {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Preço (R$)" htmlFor="price">
              <input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={extra?.price ?? 35}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Imóvel (opcional)" htmlFor="property_id">
            <select
              id="property_id"
              name="property_id"
              defaultValue={extra?.property_id ?? ""}
              className={inputClass}
            >
              <option value="">Todos os imóveis</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.unit_code ? ` · ${p.unit_code}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm">
            <span>Ativo no tablet</span>
            <input
              type="checkbox"
              name="active"
              defaultChecked={extra?.active ?? true}
              className="size-4 rounded accent-primary"
            />
          </label>

          {/* Image upload */}
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              Foto
            </p>
            {imageUrl ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ) : null}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={!savedId || uploading}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10 disabled:opacity-60"
            >
              <Upload className="size-3.5" />{" "}
              {uploading
                ? "Enviando…"
                : !savedId
                  ? "Salve o extra para enviar foto"
                  : imageUrl
                    ? "Trocar foto"
                    : "Enviar foto"}
            </button>
            {!savedId ? (
              <p className="inline-flex items-center gap-1 text-[11px] text-foreground/55">
                <AlertTriangle className="size-3" /> Salve primeiro para liberar o upload.
              </p>
            ) : null}
          </div>

          {err ? <FormMessage>{err}</FormMessage> : null}

          <div className="flex gap-2 pt-2">
            <button disabled={pending} className={primaryButtonClass}>
              {pending ? "Salvando…" : (<><Check className="size-4" /> Salvar</>)}
            </button>
            {extra?.id ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await deleteExtra(extra.id);
                    if (r.ok) onClose();
                    else setErr(r.error ?? "Erro");
                  })
                }
                className="rounded-full bg-destructive/10 px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15"
              >
                Excluir
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
