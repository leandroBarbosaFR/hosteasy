import { resolveTabletContext } from "@/lib/data/tablet";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { EmptyState } from "@/components/app/empty-state";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { ExtrasOrderClient } from "./extras-order-client";
import { GuestOrders, type GuestOrder } from "./guest-orders";
import type { Extra } from "@/types/db";

export default async function TabletExtrasPage({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  const ctx = await resolveTabletContext(tabletCode);
  const admin = createSupabaseAdminClient();

  const propertyFilter = ctx.property
    ? `property_id.is.null,property_id.eq.${ctx.property.id}`
    : "property_id.is.null";
  const [{ data: extras }, { data: orderRows }] = await Promise.all([
    admin
      .from("extras")
      .select("*")
      .eq("host_id", ctx.host.id)
      .or(propertyFilter)
      .neq("category", "late_checkout") // late checkout has its own card on the home page
      .eq("active", true)
      .order("price"),
    ctx.reservation
      ? admin
          .from("extra_orders")
          .select(
            "id, total, status, payment_qr, payment_qr_base64, extras(title)",
          )
          .eq("reservation_id", ctx.reservation.id)
          .neq("status", "cancelled")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: null }),
  ]);

  const list = (extras ?? []) as Extra[];
  const guestOrders: GuestOrder[] = (orderRows ?? []).map((o) => {
    const rel = Array.isArray(o.extras) ? o.extras[0] : o.extras;
    return {
      id: o.id as string,
      title: (rel as { title?: string } | null)?.title ?? "Extra",
      total: Number(o.total ?? 0),
      status: o.status as string,
      payment_qr: (o.payment_qr as string | null) ?? null,
      payment_qr_base64: (o.payment_qr_base64 as string | null) ?? null,
    };
  });

  return (
    <main className="mx-auto max-w-4xl px-5 pt-10">
      {guestOrders.length > 0 ? <AutoRefresh intervalMs={15_000} /> : null}
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
          Extras
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
          Peça com um toque
        </h1>
        <p className="mt-1 text-sm text-foreground/65">
          Tudo aparece direto no painel do anfitrião.
        </p>
      </header>

      {list.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="Sem extras disponíveis no momento." />
        </div>
      ) : (
        <ExtrasOrderClient tabletCode={tabletCode} extras={list} disabled={!ctx.reservation} />
      )}

      {!ctx.reservation ? (
        <p className="mt-4 text-center text-xs text-foreground/55">
          Pedidos só ficam disponíveis durante uma estadia ativa.
        </p>
      ) : null}

      <GuestOrders
        orders={guestOrders}
        pixKey={ctx.host.pix_key}
        pixInstructions={ctx.host.pix_instructions}
      />
    </main>
  );
}
