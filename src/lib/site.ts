// Central place for outward-facing contact details so they aren't scattered
// through marketing pages. Override per environment without a deploy diff.

export const CONTACT_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "5548991958826";

export const CONTACT_WHATSAPP_DISPLAY =
  process.env.NEXT_PUBLIC_CONTACT_WHATSAPP_DISPLAY ?? "+55 48 99195-8826";

export const CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "leobarbosacontact@gmail.com";

export function whatsappLink(message?: string) {
  const base = `https://wa.me/${CONTACT_WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
