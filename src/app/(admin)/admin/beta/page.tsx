import Link from "next/link";
import { CheckCircle as CheckCircle2, XCircle, DeviceTablet as TabletIcon, Calendar, Sparkle as Sparkles, Star, Plug } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Beta · Admin" };

export default async function AdminBetaPage() {
  const admin = createSupabaseAdminClient();

  // Properties currently flagged beta_test=true OR whose host is beta.
  const { data: properties } = await admin
    .from("properties")
    .select(
      "id, name, unit_code, beta_test, host_id, late_checkout_enabled, review_link_airbnb, review_link_booking, review_link_google, hosts(name, beta_test)",
    )
    .or("beta_test.eq.true,hosts.beta_test.eq.true");

  const betaProps = properties ?? [];

  // Pull related data for each property in parallel
  const enriched = await Promise.all(
    betaProps.map(async (p) => {
      const [tabletRes, sourcesRes, extrasRes, ordersRes, reviewRes, reservationsRes] =
        await Promise.all([
          admin
            .from("tablets")
            .select("tablet_code, status, last_seen_at, battery_percent")
            .eq("property_id", p.id)
            .maybeSingle(),
          admin
            .from("reservation_sources")
            .select("id, source_type, last_synced_at, last_sync_status")
            .eq("property_id", p.id),
          admin
            .from("extras")
            .select("id", { count: "exact", head: true })
            .eq("host_id", p.host_id),
          admin
            .from("extra_orders")
            .select("id, total, status, created_at, reservations!inner(property_id)")
            .eq("host_id", p.host_id)
            .eq("reservations.property_id", p.id)
            .gte(
              "created_at",
              new Date(new Date().setUTCDate(1)).toISOString(),
            ),
          admin
            .from("review_requests")
            .select("id, rating", { count: "exact" })
            .eq("property_id", p.id)
            .gte(
              "created_at",
              new Date(new Date().setUTCDate(1)).toISOString(),
            ),
          admin
            .from("reservations")
            .select("id", { count: "exact", head: true })
            .eq("property_id", p.id)
            .in("status", ["confirmed", "in_stay"]),
        ]);

      const orders = ordersRes.data ?? [];
      const monthRevenue = orders
        .filter((o) => o.status === "paid" || o.status === "delivered")
        .reduce((s, o) => s + Number(o.total ?? 0), 0);

      const checklist = [
        { label: "Imóvel criado", done: true },
        { label: "Tablet pareado", done: !!tabletRes.data?.tablet_code },
        { label: "Calendário iCal conectado", done: (sourcesRes.data ?? []).length > 0 },
        { label: "Pelo menos 3 extras", done: (extrasRes.count ?? 0) >= 3 },
        { label: "Late check-out habilitado", done: !!p.late_checkout_enabled },
        {
          label: "Link de review configurado",
          done: !!(p.review_link_airbnb || p.review_link_booking || p.review_link_google),
        },
        {
          label: "Tablet online (últimos 5 min)",
          done: isFresh(tabletRes.data?.last_seen_at, 5 * 60_000),
        },
      ];
      const completion = checklist.filter((c) => c.done).length / checklist.length;

      return {
        property: p,
        tablet: tabletRes.data,
        sources: sourcesRes.data ?? [],
        ordersCount: orders.length,
        monthRevenue,
        reviewCount: reviewRes.count ?? 0,
        activeReservations: reservationsRes.count ?? 0,
        checklist,
        completion,
      };
    }),
  );

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <Topbar
        subtitle="Beta"
        title="Beta — pronto pra rodar?"
      />

      <div className="px-6 pt-6 md:px-10">
        {enriched.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/60 bg-white/40 px-6 py-12 text-center">
            <p className="text-sm text-foreground/65">
              Nenhum imóvel marcado como beta. Vá em <Link className="font-semibold underline" href="/admin/hosts">Anfitriões</Link> e marque um host (ou um imóvel) como beta.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {enriched.map((e) => (
              <li
                key={e.property.id}
                className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
                      {(e.property.hosts as { name?: string } | null)?.name ?? "—"}
                    </p>
                    <h3 className="mt-1 font-display text-lg font-bold tracking-tight">
                      {e.property.name}
                      {e.property.unit_code ? ` · ${e.property.unit_code}` : ""}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
                      Completude
                    </p>
                    <p className="font-display text-2xl font-bold tracking-tight">
                      {Math.round(e.completion * 100)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  <Metric label="Receita do mês" value={formatBRL(e.monthRevenue)} Icon={Sparkles} />
                  <Metric label="Pedidos extras" value={String(e.ordersCount)} Icon={Sparkles} />
                  <Metric label="Reviews coletadas" value={String(e.reviewCount)} Icon={Star} />
                  <Metric label="Reservas ativas" value={String(e.activeReservations)} Icon={Calendar} />
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {e.checklist.map((c) => (
                    <div key={c.label} className="flex items-center gap-2 text-xs">
                      {c.done ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-foreground/30" />
                      )}
                      <span className={cn(c.done ? "" : "text-foreground/55")}>
                        {c.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-foreground/55">
                  {e.tablet ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2 py-1">
                      <TabletIcon className="size-3" /> {e.tablet.tablet_code} ·{" "}
                      {e.tablet.status}
                      {e.tablet.last_seen_at
                        ? ` · ${new Date(e.tablet.last_seen_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </span>
                  ) : null}
                  {e.sources.map((s) => (
                    <span
                      key={s.id}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-1",
                        s.last_sync_status === "error"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted/60",
                      )}
                    >
                      <Plug className="size-3" /> {s.source_type}
                      {s.last_synced_at
                        ? ` · ${new Date(s.last_synced_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}`
                        : " (nunca)"}
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

// Helper isolated so the React purity rule doesn't trip on Date.now() inside
// the async server component body. Computing freshness server-side is the
// intent; the value updates per request, which is exactly what we want here.
function isFresh(iso: string | null | undefined, windowMs: number): boolean {
  if (!iso) return false;
  return new Date().getTime() - new Date(iso).getTime() < windowMs;
}

function Metric({
  label,
  value,
  Icon,
}: {
  label: string;
  value: string;
  Icon: typeof Star;
}) {
  return (
    <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-foreground/55" />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
          {label}
        </p>
      </div>
      <p className="mt-1 font-display text-base font-bold tracking-tight">{value}</p>
    </div>
  );
}
