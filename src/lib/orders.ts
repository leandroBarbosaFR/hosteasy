import type { ExtraOrderStatus } from "@/types/db";

// Canonical extra-order lifecycle, shared by the host dashboard, the staff
// view and the tablet.
//
//   pending ──(host aprova)──▶ pending_payment ──(pagou)──▶ paid ──▶ delivered
//      └──────────────────────── cancelled ◀───────────────────┘
//
// 'approved' is a legacy value from before the ROI engine; treat it exactly
// like pending_payment.

export const ORDER_STATUS_META: Record<
  ExtraOrderStatus,
  { label: string; cls: string }
> = {
  pending:         { label: "Pendente",           cls: "bg-amber-500/15 text-amber-700" },
  approved:        { label: "Aguard. pagamento",  cls: "bg-orange-500/15 text-orange-700" },
  pending_payment: { label: "Aguard. pagamento",  cls: "bg-orange-500/15 text-orange-700" },
  paid:            { label: "Pago",               cls: "bg-emerald-500/15 text-emerald-700" },
  delivered:       { label: "Entregue",           cls: "bg-emerald-500/15 text-emerald-700" },
  cancelled:       { label: "Cancelado",          cls: "bg-foreground/10 text-foreground/60" },
};

export function orderStatusMeta(status: string) {
  return (
    ORDER_STATUS_META[status as ExtraOrderStatus] ?? {
      label: status,
      cls: "bg-foreground/10 text-foreground/60",
    }
  );
}

export function isOpenOrder(status: string) {
  return status === "pending" || status === "approved" || status === "pending_payment";
}

export function isPaidOrder(status: string) {
  return status === "paid" || status === "delivered";
}

export function isAwaitingPayment(status: string) {
  return status === "approved" || status === "pending_payment";
}

export function canCancelOrder(status: string) {
  return isOpenOrder(status);
}
