import Link from "next/link";
import { UserPlus, Chats as MessagesSquare } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { TeamContactList } from "@/components/app/team-contact-list";
import { TeamChatPanel } from "@/components/app/team-chat";
import { requireHostContext } from "@/lib/data/host";
import { listTeamContacts, getDmThread } from "@/lib/data/chat";

export const metadata = { title: "Equipe · Hosteasy" };

export default async function TeamChatPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;
  const { profile, hostId } = await requireHostContext();
  const contacts = await listTeamContacts(hostId, profile.id);

  const active = contacts.find((c) => c.userId === u) ?? null;
  const thread = active
    ? await getDmThread(hostId, profile.id, active.userId)
    : [];

  return (
    <>
      <AutoRefresh intervalMs={15_000} />
      <Topbar
        subtitle="Equipe"
        title="Conversas com o time"
        actions={
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-4 py-2 text-xs font-semibold text-foreground/80 shadow-sm hover:bg-muted/50"
          >
            <UserPlus className="size-3.5" /> Convidar membro
          </Link>
        }
      />

      <div className="px-6 pt-6 md:px-10">
        {contacts.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare className="size-5" />}
            title="Nenhum membro no time ainda"
            description="Convide sua equipe de limpeza e manutenção em Ajustes → Time. Cada membro entra com o próprio login."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-[300px_1fr]">
            <TeamContactList
              contacts={contacts}
              activeUserId={active?.userId ?? null}
              basePath="/dashboard/team"
            />
            {active ? (
              <TeamChatPanel
                key={`${active.userId}-${thread[thread.length - 1]?.id ?? "empty"}`}
                selfId={profile.id}
                otherId={active.userId}
                initialMessages={thread}
              />
            ) : (
              <div className="grid min-h-[40vh] place-items-center rounded-3xl border border-dashed border-foreground/15 bg-white/40 text-sm text-foreground/55">
                Escolha alguém do time para conversar.
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
