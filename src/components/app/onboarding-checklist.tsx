import Link from "next/link";
import { Check, CaretRight as ChevronRight, Rocket } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

export type OnboardingStep = {
  key: string;
  label: string;
  description: string;
  href: string;
  done: boolean;
};

// First-run checklist on the host dashboard. Renders nothing once every step
// is done — it's scaffolding, not furniture.
export function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const remaining = steps.filter((s) => !s.done);
  if (remaining.length === 0) return null;
  const doneCount = steps.length - remaining.length;
  const pct = Math.round((doneCount / steps.length) * 100);

  return (
    <section className="rounded-3xl border border-primary/25 bg-primary/[0.04] p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-primary" />
          <h2 className="text-sm font-semibold">
            Deixe o Hosteasy rodando sozinho
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-foreground/55">
          {doneCount}/{steps.length} concluído
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {steps.map((s) => (
          <li key={s.key}>
            <Link
              href={s.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-2.5 transition-colors",
                s.done
                  ? "border-transparent bg-emerald-500/5 text-foreground/50"
                  : "border-border/60 bg-card hover:bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border text-[10px]",
                  s.done
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700"
                    : "border-foreground/20 text-transparent",
                )}
              >
                <Check className="size-3" />
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block truncate text-sm font-medium",
                    s.done && "line-through decoration-foreground/30",
                  )}
                >
                  {s.label}
                </span>
                {!s.done ? (
                  <span className="block truncate text-[11px] text-foreground/55">
                    {s.description}
                  </span>
                ) : null}
              </span>
              {!s.done ? (
                <ChevronRight className="size-3.5 shrink-0 text-foreground/35" />
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
