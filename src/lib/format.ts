export function formatBRL(value: number | string | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

export function initialOf(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

// Human relative time for "last seen". `now` is passed in so callers can
// keep render pure.
export function formatRelative(
  iso: string | null | undefined,
  now: number,
): string {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 30) return "agora há pouco";
  if (seconds < 60) return `${seconds}s atrás`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min atrás`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
}

// Derive an effective status. If the tablet hasn't heartbeat in 5 minutes,
// treat it as offline regardless of what the row says — unless a host has
// explicitly marked it under maintenance.
export function effectiveTabletStatus(
  tablet: { status: string; last_seen_at: string | null },
  now: number,
): "online" | "offline" | "maintenance" {
  if (tablet.status === "maintenance") return "maintenance";
  if (!tablet.last_seen_at) return "offline";
  const ageMs = now - new Date(tablet.last_seen_at).getTime();
  return ageMs > 5 * 60 * 1000 ? "offline" : "online";
}
