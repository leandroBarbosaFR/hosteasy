import "server-only";

// Outbound delivery channels for notifications. Everything here is
// best-effort and env-gated: with no keys configured the functions no-op, so
// the in-app notification (already written to the DB) remains the source of
// truth.
//
//   RESEND_API_KEY            — enables e-mail via Resend
//   NOTIFY_EMAIL_FROM         — sender, e.g. "Hosteasy <avisos@hosteasy.com.br>"
//   WHATSAPP_ACCESS_TOKEN     — Meta Cloud API token
//   WHATSAPP_PHONE_NUMBER_ID  — the sending phone-number id
//   WHATSAPP_TEMPLATE_NAME    — optional approved template with one {{1}} body
//                               param; without it we send plain text, which
//                               Meta only delivers inside a 24h session window.

export function emailDeliveryEnabled() {
  return !!process.env.RESEND_API_KEY;
}

export function whatsappDeliveryEnabled() {
  return (
    !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID
  );
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<boolean> {
  if (!emailDeliveryEnabled()) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.NOTIFY_EMAIL_FROM ?? "Hosteasy <onboarding@resend.dev>",
        to: [opts.to],
        subject: opts.subject,
        text: opts.text,
      }),
    });
    if (!res.ok) {
      console.error("[deliver] resend failed", res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error("[deliver] resend error", err);
    return false;
  }
}

// `to` in E.164 without the plus, e.g. "5548999998888".
export async function sendWhatsApp(opts: {
  to: string;
  text: string;
}): Promise<boolean> {
  if (!whatsappDeliveryEnabled()) return false;
  const to = opts.to.replace(/\D/g, "");
  if (!to) return false;

  const template = process.env.WHATSAPP_TEMPLATE_NAME;
  const payload = template
    ? {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: template,
          language: { code: process.env.WHATSAPP_TEMPLATE_LANG ?? "pt_BR" },
          components: [
            {
              type: "body",
              parameters: [{ type: "text", text: opts.text }],
            },
          ],
        },
      }
    : {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: opts.text, preview_url: false },
      };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      console.error("[deliver] whatsapp failed", res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error("[deliver] whatsapp error", err);
    return false;
  }
}
