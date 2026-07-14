"use client";

import { useState } from "react";
import { Copy, Check, QrCode } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { orderStatusMeta, isAwaitingPayment } from "@/lib/orders";
import { formatBRL } from "@/lib/format";

export type GuestOrder = {
  id: string;
  title: string;
  total: number;
  status: string;
  payment_qr: string | null;
  payment_qr_base64: string | null;
};

// The guest's orders for the active stay: status per order and, once the host
// approves, how to pay — a real Mercado Pago PIX QR when available, otherwise
// the host's static PIX key.
export function GuestOrders({
  orders,
  pixKey,
  pixInstructions,
}: {
  orders: GuestOrder[];
  pixKey: string | null;
  pixInstructions: string | null;
}) {
  if (orders.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold">Seus pedidos</h2>
      <ul className="mt-3 space-y-3">
        {orders.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            pixKey={pixKey}
            pixInstructions={pixInstructions}
          />
        ))}
      </ul>
    </section>
  );
}

function OrderCard({
  order,
  pixKey,
  pixInstructions,
}: {
  order: GuestOrder;
  pixKey: string | null;
  pixInstructions: string | null;
}) {
  const meta = orderStatusMeta(order.status);
  const awaiting = isAwaitingPayment(order.status);
  return (
    <li className="rounded-3xl border border-border/50 bg-white/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{order.title}</p>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{formatBRL(order.total)}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              meta.cls,
            )}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {awaiting ? (
        order.payment_qr ? (
          <PixPanel qr={order.payment_qr} qrBase64={order.payment_qr_base64} />
        ) : pixKey ? (
          <ManualPixPanel pixKey={pixKey} instructions={pixInstructions} />
        ) : (
          <p className="mt-2 text-xs text-foreground/60">
            Aprovado! O anfitrião vai combinar o pagamento com você.
          </p>
        )
      ) : null}
    </li>
  );
}

function PixPanel({ qr, qrBase64 }: { qr: string; qrBase64: string | null }) {
  return (
    <div className="mt-3 rounded-2xl bg-background/70 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
        <QrCode className="size-3.5" /> Pague com PIX para confirmar
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        {qrBase64 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`data:image/png;base64,${qrBase64}`}
            alt="QR code PIX"
            className="size-36 rounded-xl border border-border/50 bg-white p-1.5"
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-foreground/55">
            Escaneie o QR ou copie o código abaixo no app do seu banco. A
            confirmação aparece aqui sozinha.
          </p>
          <CopyField value={qr} label="Copiar código PIX" />
        </div>
      </div>
    </div>
  );
}

function ManualPixPanel({
  pixKey,
  instructions,
}: {
  pixKey: string;
  instructions: string | null;
}) {
  return (
    <div className="mt-3 rounded-2xl bg-background/70 p-4">
      <p className="text-xs font-semibold text-foreground/70">
        Pague com PIX para confirmar
      </p>
      <CopyField value={pixKey} label="Copiar chave PIX" />
      {instructions ? (
        <p className="mt-2 text-[11px] text-foreground/55">{instructions}</p>
      ) : null}
    </div>
  );
}

function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-xl bg-foreground/5 px-3 py-2 text-[11px]">
        {value}
      </code>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard unavailable in some kiosk browsers */
          }
        }}
        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-foreground/90 px-3 py-2 text-[11px] font-semibold text-white hover:bg-foreground"
      >
        {copied ? (
          <>
            <Check className="size-3" /> Copiado
          </>
        ) : (
          <>
            <Copy className="size-3" /> {label}
          </>
        )}
      </button>
    </div>
  );
}
