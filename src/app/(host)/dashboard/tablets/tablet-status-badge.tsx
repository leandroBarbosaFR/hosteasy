"use client";

import { effectiveTabletStatus } from "@/lib/format";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

export function TabletStatusBadge({
  status,
  lastSeenAt,
}: {
  status: string;
  lastSeenAt: string | null;
}) {
  const now = useNow();
  const effective = now
    ? effectiveTabletStatus({ status, last_seen_at: lastSeenAt }, now)
    : status;

  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        effective === "online"
          ? "bg-emerald-500/15 text-emerald-700"
          : effective === "maintenance"
            ? "bg-amber-500/15 text-amber-700"
            : "bg-foreground/10 text-foreground/60",
      )}
    >
      {effective}
    </span>
  );
}
