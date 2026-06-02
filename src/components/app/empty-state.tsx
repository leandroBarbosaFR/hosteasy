import { ReactNode } from "react";
import { Inbox } from "lucide-react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-3xl border border-dashed border-border/60 bg-white/40 px-6 py-12 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-muted text-foreground/60">
        {icon ?? <Inbox className="size-5" />}
      </div>
      <h3 className="mt-4 font-display text-lg font-medium tracking-tight">
        {title}
      </h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm text-foreground/65">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
