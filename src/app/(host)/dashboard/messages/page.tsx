import Link from "next/link";
import { Topbar } from "@/components/app/topbar";
import { EmptyState } from "@/components/app/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireHostContext } from "@/lib/data/host";
import { cn } from "@/lib/utils";
import { ThreadView } from "./thread-view";

export const metadata = { title: "Mensagens · Hosteasy" };

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ r?: string }>;
}) {
  const { r: selectedId } = await searchParams;
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const { data: threads } = await supabase
    .from("reservations")
    .select(
      "id, guest_name, properties(name, unit_code), messages(id, body, sender_type, read_at, created_at)",
    )
    .eq("host_id", hostId)
    .order("created_at", { ascending: false });

  type Thread = NonNullable<typeof threads>[number];

  const enriched = (threads ?? [])
    .map((t: Thread) => {
      const sorted = [...(t.messages ?? [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
      const last = sorted[0];
      const unread =
        (t.messages ?? []).filter(
          (m) => m.sender_type === "guest" && !m.read_at,
        ).length;
      return { ...t, last, unread };
    })
    .filter((t) => t.last)
    .sort(
      (a, b) =>
        new Date(b.last!.created_at).getTime() -
        new Date(a.last!.created_at).getTime(),
    );

  const selected = enriched.find((t) => t.id === selectedId) ?? enriched[0];

  let thread: { id: string; body: string; sender_type: "guest" | "host" | "system"; created_at: string }[] = [];
  if (selected) {
    const { data } = await supabase
      .from("messages")
      .select("id, body, sender_type, created_at")
      .eq("reservation_id", selected.id)
      .order("created_at", { ascending: true });
    thread = data ?? [];
  }

  return (
    <>
      <Topbar
        subtitle="Mensagens"
        title="Caixa de entrada"
      />

      <div className="grid gap-4 px-6 pt-6 md:grid-cols-[300px_1fr] md:px-10">
        <aside className="rounded-3xl border border-border/50 bg-card shadow-sm">
          {enriched.length === 0 ? (
            <div className="p-4">
              <EmptyState title="Sem mensagens" description="Quando um hóspede escrever, a conversa aparece aqui." />
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {enriched.map((t) => {
                const isActive = selected?.id === t.id;
                return (
                  <li key={t.id}>
                    <Link
                      href={`/dashboard/messages?r=${t.id}`}
                      className={cn(
                        "block px-4 py-3 transition-colors hover:bg-muted/40",
                        isActive && "bg-muted/60",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold">{t.guest_name}</p>
                        {t.unread > 0 ? (
                          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                            {t.unread}
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-[11px] text-foreground/55">
                        {propertyName(t.properties)}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-foreground/70">
                        {t.last?.body}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        <section>
          {selected ? (
            <ThreadView
              reservationId={selected.id}
              guestName={selected.guest_name}
              propertyName={propertyName(selected.properties) ?? ""}
              initial={thread}
            />
          ) : (
            <EmptyState title="Selecione uma conversa" />
          )}
        </section>
      </div>
    </>
  );
}

function propertyName(
  rel: { name: string; unit_code: string | null } | Array<{ name: string; unit_code: string | null }> | null | undefined,
): string | undefined {
  if (!rel) return undefined;
  return Array.isArray(rel) ? rel[0]?.name : rel.name;
}
