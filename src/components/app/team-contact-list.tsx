import Link from "next/link";
import { cn } from "@/lib/utils";
import { initialOf } from "@/lib/format";
import { SPECIALTY_LABELS } from "@/lib/labels";
import type { TeamContact } from "@/lib/data/chat";

// Conversation list for the team chat. Server-rendered; selection travels via
// the `u` query param so the page stays a server component.
export function TeamContactList({
  contacts,
  activeUserId,
  basePath,
}: {
  contacts: TeamContact[];
  activeUserId: string | null;
  basePath: string;
}) {
  return (
    <ul className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-sm">
      {contacts.map((c) => {
        const active = c.userId === activeUserId;
        return (
          <li key={c.userId}>
            <Link
              href={`${basePath}?u=${c.userId}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40",
                active && "bg-muted/50",
              )}
            >
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {initialOf(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{c.name}</p>
                  <span className="shrink-0 rounded-full bg-foreground/5 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-foreground/55">
                    {c.role === "host_admin"
                      ? "Admin"
                      : SPECIALTY_LABELS[c.specialty]}
                  </span>
                </div>
                <p className="truncate text-[11px] text-foreground/55">
                  {c.lastMessage
                    ? c.lastMessage.body
                    : (c.email ?? "Sem mensagens ainda")}
                </p>
              </div>
              {c.unreadCount > 0 ? (
                <span className="grid min-w-[18px] shrink-0 place-items-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {c.unreadCount}
                </span>
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
