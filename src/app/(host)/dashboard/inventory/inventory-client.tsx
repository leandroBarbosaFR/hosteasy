"use client";

import { useState, useTransition } from "react";
import { Plus, X, Check, Minus, Warning as AlertTriangle, Package } from "@phosphor-icons/react/ssr";
import { StatCard } from "@/components/app/stat-card";
import { EmptyState } from "@/components/app/empty-state";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { cn } from "@/lib/utils";
import { INVENTORY_CATEGORY_LABELS } from "@/lib/labels";
import {
  saveInventoryItem,
  deleteInventoryItem,
  recordInventoryMovement,
  createShoppingListTask,
} from "@/lib/actions/inventory";
import type { InventoryItemWithProperty } from "@/lib/data/inventory";
import type { MovementWithItem } from "@/lib/data/inventory";
import type { InventoryCategory } from "@/types/db";

const REASON_LABELS: Record<string, string> = {
  restock: "Reposição",
  consumption: "Consumo",
  count: "Contagem",
  adjustment: "Ajuste",
};

export function InventoryClient({
  items,
  movements,
  properties,
  canManage,
}: {
  items: InventoryItemWithProperty[];
  movements: MovementWithItem[];
  properties: { id: string; name: string; unit_code: string | null }[];
  canManage: boolean;
}) {
  const [editing, setEditing] = useState<InventoryItemWithProperty | "new" | null>(null);

  const low = items.filter((i) => Number(i.current_qty) <= Number(i.min_qty));

  // Group by property; host-wide items (no property) come first.
  const groups = new Map<string, InventoryItemWithProperty[]>();
  for (const item of items) {
    const key = item.property_name ?? "Estoque geral";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Itens ativos" value={String(items.length)} />
        <StatCard label="Estoque baixo" value={String(low.length)} />
        <StatCard
          label="Últ. movimentação"
          value={
            movements[0]
              ? new Date(movements[0].created_at).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })
              : "—"
          }
        />
      </section>

      {low.length > 0 ? (
        <LowStockBanner low={low} canManage={canManage} />
      ) : null}

      <section>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Itens</h2>
          {canManage ? (
            <button
              type="button"
              onClick={() => setEditing("new")}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="size-3.5" /> Novo item
            </button>
          ) : null}
        </div>

        {items.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<Package className="size-5" />}
              title="Nenhum item no estoque"
              description="Cadastre amenities, produtos de limpeza e roupa de cama. A equipe reporta o que sobrou a cada limpeza."
            />
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {[...groups.entries()].map(([groupName, groupItems]) => (
              <div key={groupName}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                  {groupName}
                </p>
                <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
                  {groupItems.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      onEdit={canManage ? () => setEditing(item) : undefined}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold">Movimentações recentes</h2>
        {movements.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-foreground/15 bg-white/40 px-4 py-4 text-center text-sm text-foreground/55">
            Nenhuma movimentação ainda.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {m.item_name}
                    <span className="ml-2 text-[11px] text-foreground/55">
                      {REASON_LABELS[m.reason] ?? m.reason}
                      {m.by_name ? ` · ${m.by_name}` : ""}
                      {m.note ? ` · ${m.note}` : ""}
                    </span>
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm">
                  <span
                    className={cn(
                      "font-semibold",
                      Number(m.delta) >= 0 ? "text-emerald-600" : "text-destructive",
                    )}
                  >
                    {Number(m.delta) >= 0 ? "+" : ""}
                    {Number(m.delta)}
                  </span>
                  <span className="text-[11px] text-foreground/55">
                    → {Number(m.qty_after)} ·{" "}
                    {new Date(m.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing ? (
        <ItemEditor
          item={editing === "new" ? null : editing}
          properties={properties}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function LowStockBanner({
  low,
  canManage,
}: {
  low: InventoryItemWithProperty[];
  canManage: boolean;
}) {
  const [pending, start] = useTransition();
  const [created, setCreated] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>{low.length}</strong>{" "}
            {low.length === 1 ? "item precisa" : "itens precisam"} de reposição:{" "}
            {low.map((i) => i.name).join(", ")}.
          </span>
        </p>
        {canManage ? (
          created ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              <Check className="size-3" /> Lista criada em Tarefas
            </span>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setErr(null);
                  const r = await createShoppingListTask();
                  if (r.ok) setCreated(true);
                  else setErr(r.error ?? "Erro");
                })
              }
              className="rounded-full bg-amber-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {pending ? "Criando…" : "Criar lista de compras"}
            </button>
          )
        ) : null}
      </div>
      {err ? <p className="mt-1 text-[11px] text-destructive">{err}</p> : null}
    </div>
  );
}

function ItemRow({
  item,
  onEdit,
}: {
  item: InventoryItemWithProperty;
  onEdit?: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const isLow = Number(item.current_qty) <= Number(item.min_qty);

  function move(mode: "restock" | "consumption") {
    setErr(null);
    start(async () => {
      const r = await recordInventoryMovement({
        item_id: item.id,
        mode,
        amount: 1,
      });
      if (!r.ok) setErr(r.error ?? "Erro");
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">
          {item.name}
          {isLow ? (
            <span className="ml-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
              Baixo
            </span>
          ) : null}
        </p>
        <p className="truncate text-[11px] text-foreground/55">
          {INVENTORY_CATEGORY_LABELS[item.category]} · mínimo {Number(item.min_qty)}{" "}
          {item.unit}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pending || Number(item.current_qty) <= 0}
          onClick={() => move("consumption")}
          className="grid size-7 place-items-center rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 disabled:opacity-40"
          aria-label="Consumir 1"
        >
          <Minus className="size-3.5" />
        </button>
        <span
          className={cn(
            "min-w-[64px] text-center text-sm font-semibold",
            isLow && "text-destructive",
          )}
        >
          {Number(item.current_qty)} {item.unit}
        </span>
        <button
          type="button"
          disabled={pending}
          onClick={() => move("restock")}
          className="grid size-7 place-items-center rounded-full bg-foreground/5 text-foreground hover:bg-foreground/10 disabled:opacity-40"
          aria-label="Repor 1"
        >
          <Plus className="size-3.5" />
        </button>
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full bg-foreground/5 px-2.5 py-1 text-[11px] font-semibold text-foreground hover:bg-foreground/10"
          >
            Editar
          </button>
        ) : null}
      </div>
      {err ? <p className="basis-full text-[11px] text-destructive">{err}</p> : null}
    </li>
  );
}

function ItemEditor({
  item,
  properties,
  onClose,
}: {
  item: InventoryItemWithProperty | null;
  properties: { id: string; name: string; unit_code: string | null }[];
  onClose: () => void;
}) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-4 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border/60 bg-card shadow-xl">
        <div className="flex items-start justify-between p-6 pb-3">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {item ? "Editar item" : "Novo item"}
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
              if (item?.id) fd.set("id", item.id);
              const res = await saveInventoryItem(fd);
              if (!res.ok) setErr(res.error ?? "Erro");
              else onClose();
            })
          }
          className="space-y-3 px-6 pb-6"
        >
          <Field label="Nome" htmlFor="inv-name">
            <input
              id="inv-name"
              name="name"
              required
              defaultValue={item?.name}
              className={inputClass}
              placeholder="Papel higiênico"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Categoria" htmlFor="inv-category">
              <select
                id="inv-category"
                name="category"
                defaultValue={item?.category ?? "amenities"}
                className={inputClass}
              >
                {(
                  Object.entries(INVENTORY_CATEGORY_LABELS) as [
                    InventoryCategory,
                    string,
                  ][]
                ).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Unidade" htmlFor="inv-unit">
              <input
                id="inv-unit"
                name="unit"
                defaultValue={item?.unit ?? "un"}
                className={inputClass}
                placeholder="un, rolo, litro…"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {!item ? (
              <Field label="Qtd. inicial" htmlFor="inv-qty">
                <input
                  id="inv-qty"
                  name="current_qty"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
            ) : null}
            <Field label="Qtd. mínima (alerta)" htmlFor="inv-min">
              <input
                id="inv-min"
                name="min_qty"
                type="number"
                min="0"
                step="1"
                defaultValue={item?.min_qty ?? 1}
                className={inputClass}
              />
            </Field>
          </div>
          <Field label="Imóvel (opcional)" htmlFor="inv-property">
            <select
              id="inv-property"
              name="property_id"
              defaultValue={item?.property_id ?? ""}
              className={inputClass}
            >
              <option value="">Estoque geral</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.unit_code ? ` · ${p.unit_code}` : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Observações" htmlFor="inv-notes">
            <textarea
              id="inv-notes"
              name="notes"
              rows={2}
              defaultValue={item?.notes ?? ""}
              className={`${inputClass} rounded-2xl`}
              placeholder="Marca preferida, onde comprar…"
            />
          </Field>
          <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm">
            <span>Ativo</span>
            <input
              type="checkbox"
              name="active"
              defaultChecked={item?.active ?? true}
              className="size-4 rounded accent-primary"
            />
          </label>

          {err ? <FormMessage>{err}</FormMessage> : null}

          <div className="flex gap-2 pt-2">
            <button disabled={pending} className={primaryButtonClass}>
              {pending ? "Salvando…" : (<><Check className="size-4" /> Salvar</>)}
            </button>
            {item?.id ? (
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await deleteInventoryItem(item.id);
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
