import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AssignTabletForm } from "./assign-tablet-form";
import { ReservationSourcesSection } from "./reservation-sources-section";
import { LateCheckoutSettings } from "./late-checkout-settings";
import { ReviewLinksSettings } from "./review-links-settings";
import type { ReservationSourceRow, Property } from "@/types/db";

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("host_id", hostId)
    .maybeSingle();

  if (!property) notFound();
  const prop = property as Property;

  const [{ data: tablet }, { data: sources }, { count: importedCount }] = await Promise.all([
    supabase.from("tablets").select("*").eq("property_id", id).maybeSingle(),
    supabase
      .from("reservation_sources")
      .select("*")
      .eq("property_id", id)
      .order("created_at"),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("property_id", id)
      .eq("imported_from_ical", true),
  ]);

  return (
    <>
      <Topbar
        subtitle={
          <Link
            href="/dashboard/properties"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Imóveis
          </Link>
        }
        title={prop.name}
      />

      <div className="grid gap-4 px-6 pt-6 md:grid-cols-2 md:px-10">
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Informações
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Unidade" value={prop.unit_code} />
            <Row label="Cidade" value={prop.city} />
            <Row label="Estado" value={prop.state} />
            <Row label="Endereço" value={prop.address} />
            <Row
              label="Ocupação"
              value={
                prop.occupancy_rate != null
                  ? `${Number(prop.occupancy_rate).toFixed(0)}%`
                  : "—"
              }
            />
          </dl>
        </div>

        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
          <h2 className="font-display text-lg font-medium tracking-tight">
            Tablet
          </h2>
          {tablet ? (
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Código" value={tablet.tablet_code} />
              <Row label="Status" value={tablet.status} />
              <Row label="Bateria" value={tablet.battery_percent != null ? `${tablet.battery_percent}%` : "—"} />
              <Row label="Wi-Fi" value={tablet.wifi_status ?? "—"} />
              <Row
                label="Última atividade"
                value={
                  tablet.last_seen_at
                    ? new Date(tablet.last_seen_at).toLocaleString("pt-BR")
                    : "—"
                }
              />
              <Link
                href={`/tablet/${tablet.tablet_code}`}
                className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-foreground/90 px-3 py-2 text-xs font-semibold text-white hover:bg-foreground"
              >
                Abrir tablet
              </Link>
            </div>
          ) : (
            <AssignTabletForm propertyId={prop.id} />
          )}
        </div>

        <div className="md:col-span-2">
          <ReservationSourcesSection
            propertyId={prop.id}
            sources={(sources ?? []) as ReservationSourceRow[]}
            importedCount={importedCount ?? 0}
          />
        </div>

        <LateCheckoutSettings property={prop} />
        <ReviewLinksSettings property={prop} />
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/40 pb-1.5 last:border-0">
      <dt className="text-[11px] uppercase tracking-wider text-foreground/55">
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value ?? "—"}</dd>
    </div>
  );
}
