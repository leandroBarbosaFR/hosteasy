import "server-only";

// Mercado Pago PIX, env-gated. Without MERCADOPAGO_ACCESS_TOKEN the app keeps
// the manual flow (host's static PIX key from Ajustes). With it, approving an
// order creates a real PIX charge and the tablet shows the copia-e-cola code +
// QR; the webhook flips the order to `paid` when Mercado Pago confirms.
//
//   MERCADOPAGO_ACCESS_TOKEN   — production or test access token
//   (webhook URL to register in the MP dashboard: /api/webhooks/mercadopago)

const MP_API = "https://api.mercadopago.com";

export function mercadoPagoEnabled() {
  return !!process.env.MERCADOPAGO_ACCESS_TOKEN;
}

export type PixPayment = {
  id: string;
  status: string;
  qrCode: string | null; // PIX copia-e-cola
  qrCodeBase64: string | null; // QR image, base64 PNG
  expiresAt: string | null;
  externalReference: string | null;
};

function parsePayment(raw: unknown): PixPayment {
  const p = raw as {
    id: number | string;
    status?: string;
    date_of_expiration?: string | null;
    external_reference?: string | null;
    point_of_interaction?: {
      transaction_data?: { qr_code?: string; qr_code_base64?: string };
    };
  };
  return {
    id: String(p.id),
    status: p.status ?? "unknown",
    qrCode: p.point_of_interaction?.transaction_data?.qr_code ?? null,
    qrCodeBase64: p.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
    expiresAt: p.date_of_expiration ?? null,
    externalReference: p.external_reference ?? null,
  };
}

export async function createPixPayment(opts: {
  amount: number;
  description: string;
  orderId: string; // used as external_reference and idempotency key
  payerEmail?: string | null;
}): Promise<{ ok: true; payment: PixPayment } | { ok: false; error: string }> {
  if (!mercadoPagoEnabled()) return { ok: false, error: "Mercado Pago não configurado." };
  try {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const res = await fetch(`${MP_API}/v1/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
        "X-Idempotency-Key": `hosteasy-order-${opts.orderId}`,
      },
      body: JSON.stringify({
        transaction_amount: Math.round(opts.amount * 100) / 100,
        description: opts.description,
        payment_method_id: "pix",
        external_reference: opts.orderId,
        date_of_expiration: expires.toISOString().replace("Z", "-00:00"),
        payer: {
          // MP requires a payer e-mail; guests often don't give one, so fall
          // back to a per-order placeholder.
          email: opts.payerEmail || `guest+${opts.orderId.slice(0, 8)}@hosteasy.com.br`,
        },
      }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok || !body) {
      const message =
        (body as { message?: string } | null)?.message ?? `HTTP ${res.status}`;
      console.error("[mercadopago] create failed", res.status, body);
      return { ok: false, error: `Mercado Pago: ${message}` };
    }
    return { ok: true, payment: parsePayment(body) };
  } catch (err) {
    console.error("[mercadopago] create error", err);
    return { ok: false, error: "Falha ao falar com o Mercado Pago." };
  }
}

export async function getPayment(
  paymentId: string,
): Promise<PixPayment | null> {
  if (!mercadoPagoEnabled()) return null;
  try {
    const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return parsePayment(await res.json());
  } catch {
    return null;
  }
}
