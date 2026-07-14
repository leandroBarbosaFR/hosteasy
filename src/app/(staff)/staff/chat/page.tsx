import { Chats as MessagesSquare } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { TeamContactList } from "@/components/app/team-contact-list";
import { TeamChatPanel } from "@/components/app/team-chat";
import { requireStaffContext } from "@/lib/data/staff";
import { listTeamContacts, getDmThread } from "@/lib/data/chat";

export const metadata = { title: "Chat · Hosteasy" };

export default async function StaffChatPage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }>;
}) {
  const { u } = await searchParams;
  const { profile, hostId } = await requireStaffContext();
  const contacts = await listTeamContacts(hostId, profile.id);

  // Workers land on the host admin by default so "message the boss" is
  // one tap.
  const active =
    contacts.find((c) => c.userId === u) ??
    (u ? null : (contacts.find((c) => c.role === "host_admin") ?? null));
  const thread = active
    ? await getDmThread(hostId, profile.id, active.userId)
    : [];

  return (
    <>
      <AutoRefresh intervalMs={15_000} />
      <Topbar subtitle="Chat" title="Fale com o anfitrião e o time" />

      <div className="px-6 pt-6 md:px-10">
        {contacts.length === 0 ? (
          <EmptyState
            icon={<MessagesSquare className="size-5" />}
            title="Ninguém pra conversar ainda"
            description="Quando o anfitrião adicionar mais gente ao time, as conversas aparecem aqui."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-[300px_1fr]">
            <TeamContactList
              contacts={contacts}
              activeUserId={active?.userId ?? null}
              basePath="/staff/chat"
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
