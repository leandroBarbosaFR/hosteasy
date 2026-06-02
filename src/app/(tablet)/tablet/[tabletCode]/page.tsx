import Link from "next/link";
import { CalendarDays, ChevronRight, Sparkles, BookOpen, Globe2, MessageCircle } from "lucide-react";
import { resolveTabletContext } from "@/lib/data/tablet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function TabletHomePage({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  const admin = createSupabaseAdminClient();

  const [{ data: categories }, { count: unreadCount }] = await Promise.all([
    ctx.property
      ? admin
          .from("guide_categories")
          .select("id, title, subtitle, icon")
          .eq("property_id", ctx.property.id)
          .order("sort_order")
          .limit(4)
      : Promise.resolve({ data: [] }),
    ctx.reservation
      ? admin
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("reservation_id", ctx.reservation.id)
          .eq("sender_type", "host")
          .is("read_at", null)
      : Promise.resolve({ count: 0 }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-5 pt-10">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            Olá, bem-vindo
          </p>
          <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
            {ctx.reservation
              ? ctx.reservation.guest_name.split(" ")[0]
              : ctx.property?.name ?? ctx.host.name}
          </h1>
          {ctx.property ? (
            <p className="mt-1 text-sm text-foreground/65">
              {ctx.property.name}
              {ctx.property.unit_code ? ` · ${ctx.property.unit_code}` : ""}
            </p>
          ) : null}
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-medium text-foreground/65 backdrop-blur">
          {tabletCode}
        </span>
      </header>

      {ctx.reservation ? (
        <section className="mt-6 rounded-3xl border border-white/50 bg-white/60 p-5 shadow-sm backdrop-blur-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            Sua estadia
          </p>
          <div className="mt-2 flex items-center gap-3">
            <CalendarDays className="size-5 text-primary" />
            <div>
              <p className="font-display text-lg font-medium tracking-tight">
                {new Date(ctx.reservation.check_in).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
                {" – "}
                {new Date(ctx.reservation.check_out).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
              </p>
              <p className="text-xs text-foreground/60">
                {ctx.reservation.nights} {ctx.reservation.nights === 1 ? "noite" : "noites"} · {ctx.reservation.status === "in_stay" ? "Em estadia" : "Confirmada"}
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-3xl border border-dashed border-foreground/15 bg-white/40 p-5 text-sm text-foreground/60">
          Sem estadia ativa neste tablet agora.
        </section>
      )}

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile href={`/tablet/${tabletCode}/extras`}  icon={<Sparkles className="size-5" />}     label="Extras" />
        <Tile href={`/tablet/${tabletCode}/guides`}  icon={<BookOpen className="size-5" />}     label="Guia da casa" />
        <Tile href={`/tablet/${tabletCode}/web`}     icon={<Globe2 className="size-5" />}       label="Web" />
        <Tile
          href={`/tablet/${tabletCode}/contact`}
          icon={<MessageCircle className="size-5" />}
          label="Contato"
          badge={unreadCount && unreadCount > 0 ? unreadCount : undefined}
        />
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Guia rápido
          </h2>
          <Link
            href={`/tablet/${tabletCode}/guides`}
            className="text-xs font-medium text-foreground/65 hover:text-foreground"
          >
            Ver tudo
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/tablet/${tabletCode}/guides/${c.id}`}
              className="flex items-center justify-between rounded-3xl border border-white/50 bg-white/60 px-4 py-3.5 shadow-sm backdrop-blur-xl"
            >
              <div>
                <p className="text-sm font-semibold">{c.title}</p>
                {c.subtitle ? (
                  <p className="text-[11px] text-foreground/60">{c.subtitle}</p>
                ) : null}
              </div>
              <ChevronRight className="size-4 text-foreground/40" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Tile({
  href,
  icon,
  label,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-start gap-2 rounded-3xl border border-white/50 bg-white/60 p-4 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md"
    >
      <div className="grid size-10 place-items-center rounded-2xl bg-primary/15 text-primary">
        {icon}
      </div>
      <span className="text-sm font-semibold">{label}</span>
      {badge ? (
        <span className="absolute right-3 top-3 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
