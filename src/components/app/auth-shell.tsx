import Link from "next/link";
import { ReactNode } from "react";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle?: string;
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center text-sm font-medium text-foreground/70 hover:text-foreground"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/host-app-logo.svg"
            alt="hosteasy"
            className="h-6 w-auto"
            draggable={false}
          />
        </Link>

        <div className="rounded-3xl border border-border/60 bg-card p-8 md:p-10">
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 text-sm leading-relaxed text-foreground/70">
              {subtitle}
            </p>
          ) : null}

          <div className="mt-6">{children}</div>

          {footer ? (
            <div className="mt-6 border-t border-border/60 pt-6 text-xs text-foreground/55">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55"
      >
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && !error ? (
        <p className="mt-1.5 text-[11px] text-foreground/55">{hint}</p>
      ) : null}
      {error ? (
        <p className="mt-1.5 text-[11px] font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30";

export const primaryButtonClass =
  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1f1916] py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)] disabled:opacity-60 disabled:hover:shadow-none";

export function FormMessage({
  kind = "error",
  children,
}: {
  kind?: "error" | "success" | "info";
  children: ReactNode;
}) {
  const palette =
    kind === "error"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : kind === "success"
        ? "border-sage/30 bg-sage/10 text-foreground"
        : "border-border/60 bg-muted/40 text-foreground/80";
  return (
    <div className={`rounded-2xl border px-3 py-2 text-xs ${palette}`}>
      {children}
    </div>
  );
}
