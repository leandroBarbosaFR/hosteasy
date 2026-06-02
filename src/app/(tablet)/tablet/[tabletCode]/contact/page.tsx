import { resolveTabletContext } from "@/lib/data/tablet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { GuestThread } from "./guest-thread";

export default async function TabletContactPage({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  const admin = createSupabaseAdminClient();

  let initial: Array<{
    id: string;
    body: string;
    sender_type: "guest" | "host" | "system";
    created_at: string;
  }> = [];
  if (ctx.reservation) {
    const { data } = await admin
      .from("messages")
      .select("id, body, sender_type, created_at")
      .eq("reservation_id", ctx.reservation.id)
      .order("created_at", { ascending: true });
    initial = data ?? [];
  }

  return (
    <main className="mx-auto max-w-3xl px-5 pt-10">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          Contato
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
          Fala com {ctx.host.name.split("·")[0]?.trim() ?? ctx.host.name}
        </h1>
        <p className="mt-1 text-sm text-foreground/65">
          Resposta do anfitrião direto neste tablet.
        </p>
      </header>

      <div className="mt-6">
        <GuestThread
          tabletCode={tabletCode}
          initial={initial}
          disabled={!ctx.reservation}
        />
      </div>
    </main>
  );
}
