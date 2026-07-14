import { ReactNode } from "react";

export function Topbar({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-3 px-6 pt-6 md:px-10 md:pt-10">
      <div>
        {subtitle ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            {subtitle}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          {title}
        </h1>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}
