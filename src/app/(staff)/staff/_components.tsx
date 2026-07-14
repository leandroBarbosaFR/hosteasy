import { Sparkle as Sparkles, Wrench, Package, Key as KeyRound, SignOut as LogOut, RadioButton as CircleDot, CheckCircle as CheckCircle2, Pause, XCircle, PlayCircle } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import type { StaffTaskCategory, StaffTaskStatus } from "@/types/db";

const CATEGORY_META: Record<StaffTaskCategory, { Icon: typeof Sparkles; label: string }> = {
  cleaning:    { Icon: Sparkles, label: "Limpeza" },
  maintenance: { Icon: Wrench,   label: "Manutenção" },
  supplies:    { Icon: Package,  label: "Repor" },
  check_in:    { Icon: KeyRound, label: "Check-in" },
  check_out:   { Icon: LogOut,   label: "Check-out" },
  other:       { Icon: CircleDot, label: "Outro" },
};

export function TaskCategoryIcon({ category }: { category: StaffTaskCategory }) {
  const m = CATEGORY_META[category];
  return (
    <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
      <m.Icon className="size-4" />
    </div>
  );
}

export function TaskCategoryLabel({ category }: { category: StaffTaskCategory }) {
  return <span>{CATEGORY_META[category].label}</span>;
}

const STATUS_META: Record<
  StaffTaskStatus,
  { label: string; cls: string; Icon: typeof CheckCircle2 }
> = {
  pending:     { label: "Pendente",      cls: "bg-amber-500/15 text-amber-700",     Icon: CircleDot },
  in_progress: { label: "Em andamento",  cls: "bg-blue-500/15 text-blue-700",       Icon: PlayCircle },
  done:        { label: "Concluída",     cls: "bg-emerald-500/15 text-emerald-700", Icon: CheckCircle2 },
  blocked:     { label: "Bloqueada",     cls: "bg-destructive/10 text-destructive", Icon: Pause },
  cancelled:   { label: "Cancelada",     cls: "bg-foreground/10 text-foreground/55", Icon: XCircle },
};

export function TaskStatusPill({ status }: { status: StaffTaskStatus }) {
  const m = STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        m.cls,
      )}
    >
      <m.Icon className="size-3" />
      {m.label}
    </span>
  );
}

export function TaskPriorityDot({ priority }: { priority: "low" | "normal" | "high" | "urgent" }) {
  const color =
    priority === "urgent"
      ? "bg-destructive"
      : priority === "high"
        ? "bg-amber-500"
        : priority === "low"
          ? "bg-foreground/30"
          : "bg-foreground/50";
  return <span className={`inline-block size-2 rounded-full ${color}`} aria-label={priority} />;
}
