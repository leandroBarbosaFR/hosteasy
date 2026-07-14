"use client";

import { useState, useTransition } from "react";
import { Check } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { recordInventoryMovement } from "@/lib/actions/inventory";
import type { InventoryItem } from "@/types/db";

type CountItem = Pick<
  InventoryItem,
  "id" | "name" | "unit" | "current_qty" | "min_qty"
>;

// "How much is left?" — the cleaner types the remaining quantity per item and
// saves. Each save is a `count` movement (optionally linked to the task) so
// the host sees who reported what.
export function StockCountForm({
  items,
  taskId,
  title = "Reportar estoque",
  hint = "Conte o que sobrou e salve item por item.",
}: {
  items: CountItem[];
  taskId?: string;
  title?: string;
  hint?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-0.5 text-[11px] text-foreground/55">{hint}</p>
      <ul className="mt-3 divide-y divide-border/50">
        {items.map((item) => (
          <CountRow key={item.id} item={item} taskId={taskId} />
        ))}
      </ul>
    </section>
  );
}

function CountRow({ item, taskId }: { item: CountItem; taskId?: string }) {
  const [value, setValue] = useState(String(Number(item.current_qty)));
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const parsed = Number(value);
  const dirty = !Number.isNaN(parsed) && parsed !== Number(item.current_qty);
  const low = !Number.isNaN(parsed) && parsed <= Number(item.min_qty);

  function save() {
    setErr(null);
    start(async () => {
      const r = await recordInventoryMovement({
        item_id: item.id,
        mode: "count",
        amount: parsed,
        task_id: taskId,
        note: taskId ? "Contagem na limpeza" : "Contagem",
      });
      if (r.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setErr(r.error ?? "Erro");
      }
    });
  }

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className="text-[11px] text-foreground/55">
          Tinha {Number(item.current_qty)} {item.unit} · mínimo{" "}
          {Number(item.min_qty)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          className={cn(
            "w-20 rounded-xl border border-border/60 bg-background px-3 py-2 text-center text-sm font-semibold outline-none focus:border-primary",
            low && "border-destructive/50 text-destructive",
          )}
          aria-label={`Quantidade restante de ${item.name}`}
        />
        <span className="w-10 text-[11px] text-foreground/55">{item.unit}</span>
        <button
          type="button"
          disabled={pending || !dirty || Number.isNaN(parsed) || parsed < 0}
          onClick={save}
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors",
            saved
              ? "bg-emerald-500/15 text-emerald-700"
              : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40",
          )}
        >
          {saved ? (<><Check className="size-3" /> Salvo</>) : pending ? "Salvando…" : "Salvar"}
        </button>
      </div>
      {err ? <p className="basis-full text-[11px] text-destructive">{err}</p> : null}
    </li>
  );
}
