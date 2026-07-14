import Link from "next/link";
import { WifiHigh as Wifi, ForkKnife as Utensils, Snowflake, SignOut as LogOut, CaretRight as ChevronRight, BookOpen } from "@phosphor-icons/react/ssr";
import type { GuideCategory } from "@/types/db";

const ICONS = {
  wifi: Wifi,
  utensils: Utensils,
  snowflake: Snowflake,
  "log-out": LogOut,
} as const;

export function GuideCard({
  category,
  href,
  count,
}: {
  category: GuideCategory;
  href: string;
  count?: number;
}) {
  const Icon: typeof BookOpen =
    (category.icon && ICONS[category.icon as keyof typeof ICONS]) || BookOpen;
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 rounded-3xl border border-border/50 bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-base font-bold tracking-tight">
          {category.title}
        </h3>
        {category.subtitle ? (
          <p className="truncate text-xs text-foreground/60">
            {category.subtitle}
          </p>
        ) : null}
        {count != null ? (
          <p className="mt-0.5 text-[10px] uppercase tracking-wider text-foreground/45">
            {count} {count === 1 ? "item" : "itens"}
          </p>
        ) : null}
      </div>
      <ChevronRight className="size-4 text-foreground/40 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
