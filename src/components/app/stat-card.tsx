import { ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  trend,
  delta,
  icon,
}: {
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  delta?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          {label}
        </p>
        {icon ?? null}
      </div>
      <p className="mt-3 font-display text-2xl font-bold tracking-tight">
        {value}
      </p>
      {delta ? (
        <div
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-[11px] font-semibold",
            trend === "down" ? "text-destructive" : "text-emerald-600",
          )}
        >
          {trend === "down" ? (
            <ArrowDownRight className="size-3.5" />
          ) : (
            <ArrowUpRight className="size-3.5" />
          )}
          {delta}
        </div>
      ) : null}
    </div>
  );
}
