import type { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getPayment, mercadoPagoEnabled } from "@/lib/mercadopago";
import { notifyHostAdmins } from "@/lib/notify";
import { formatBRL } from "@/lib/format";

// Mercado Pago payment webhook. Register this URL in the MP dashboard
// (Your integrations → Webhooks → payment events):
//   https://<your-domain>/api/webhooks/mercadopago
//
// Security model: we never trust the webhook payload itself — we only take
// the payment id from it and fetch the payment from the MP API with our
// access token. A spoofed request can at most make us do a lookup.
export async function POST(request: NextRequest) {
  if (!mercadoPagoEnabled()) {
    return Response.json({ ok: false, error: "not configured" }, { status: 503 });
  }

  // MP sends the id as ?data.id=... and/or in the JSON body {data:{id}}.
  const url = request.nextUrl;
  const body = (await request.json().catch(() => null)) as {
    type?: string;
    action?: string;
    data?: { id?: string | number };
  } | null;

  const type = url.searchParams.get("type") ?? body?.type ?? "";
  const paymentId =
    url.searchParams.get("data.id") ??
    (body?.data?.id != null ? String(body.data.id) : null);

  if (type !== "payment" || !paymentId) {
    return Response.json({ ok: true, ignored: true });
  }

  const payment = await getPayment(paymentId);
  if (!payment) return Response.json({ ok: true, ignored: true });

  if (payment.status !== "approved") {
    console.log(`[webhooks/mercadopago] payment ${paymentId} status=${payment.status}, no-op`);
    return Response.json({ ok: true, status: payment.status });
  }

  const admin = createSupabaseAdminClient();
  const orderId = payment.externalReference;

  // Match by our stored payment_id first, external_reference as fallback.
  let query = admin
    .from("extra_orders")
    .select("id, host_id, total, status, extras(title)")
    .in("status", ["pending", "approved", "pending_payment"])
    .limit(1);
  query = orderId
    ? query.or(`payment_id.eq.${paymentId},id.eq.${orderId}`)
    : query.eq("payment_id", paymentId);
  const { data: order } = await query.maybeSingle();

  if (!order) {
    console.log(`[webhooks/mercadopago] payment ${paymentId} approved but no open order matched`);
    return Response.json({ ok: true, matched: false });
  }

  await admin
    .from("extra_orders")
    .update({ status: "paid", payment_id: paymentId, payment_provider: "mercadopago" })
    .eq("id", order.id);

  const extraRel = Array.isArray(order.extras) ? order.extras[0] : order.extras;
  await notifyHostAdmins({
    hostId: order.host_id,
    type: "new_order",
    title: `Pagamento recebido: ${(extraRel as { title?: string } | null)?.title ?? "Extra"}`,
    body: `${formatBRL(Number(order.total))} via PIX (Mercado Pago).`,
    entityType: "extra_order",
    entityId: order.id,
    actionPath: "/dashboard/extras",
  });

  console.log(`[webhooks/mercadopago] order ${order.id} marked paid (payment ${paymentId})`);
  return Response.json({ ok: true, matched: true });
}
