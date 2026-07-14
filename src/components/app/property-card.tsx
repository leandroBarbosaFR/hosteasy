import Link from "next/link";
import { MapPin, DeviceTablet as TabletIcon, WifiHigh as Wifi, WifiSlash as WifiOff } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import type { Property, Tablet } from "@/types/db";

export function PropertyCard({
  property,
  tablet,
  href,
}: {
  property: Property;
  tablet?: Tablet | null;
  href?: string;
}) {
  const status = tablet?.status ?? "offline";
  const dotColor =
    status === "online"
      ? "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.18)]"
      : status === "maintenance"
        ? "bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.18)]"
        : "bg-foreground/30";

  const card = (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            {property.unit_code ?? "Imóvel"}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold tracking-tight">
            {property.name}
          </h3>
          {property.city ? (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-foreground/55">
              <MapPin className="size-3" />
              {property.city}
              {property.state ? `, ${property.state}` : ""}
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-full", dotColor)} />
          <span className="text-[11px] font-medium text-foreground/65 capitalize">
            {status}
          </span>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <TabletIcon className="size-4 text-foreground/60" />
          <div className="leading-tight">
            <p className="text-[11px] font-semibold text-foreground">
              {tablet ? tablet.tablet_code : "Sem tablet"}
            </p>
            <p className="text-[10px] text-foreground/55">
              {tablet?.last_seen_at
                ? `Última atividade ${new Date(tablet.last_seen_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
                : "Atribuir um tablet"}
            </p>
          </div>
        </div>
        {tablet ? (
          status === "online" ? (
            <Wifi className="size-4 text-emerald-600" />
          ) : (
            <WifiOff className="size-4 text-foreground/40" />
          )
        ) : null}
      </div>

      {property.occupancy_rate != null ? (
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-foreground/55">Ocupação</span>
          <span className="font-semibold">
            {Number(property.occupancy_rate).toFixed(0)}%
          </span>
        </div>
      ) : null}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {card}
      </Link>
    );
  }
  return card;
}
