import Link from "next/link";
import { Plus } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { ReservationList } from "@/components/app/reservation-list";
import { EmptyState } from "@/components/app/empty-state";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireHostContext } from "@/lib/data/host";
import { NewReservationDialog } from "./new-reservation-dialog";

export const metadata = { title: "Reservas · Hosteasy" };

type Filter = "all" | "today" | "pending";

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: Filter; new?: string }>;
}) {
  const { filter, new: openNew } = await searchParams;
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  let query = supabase
    .from("reservations")
    .select("*, properties(name, unit_code)")
    .eq("host_id", hostId)
    .order("check_in", { ascending: true });

  const today = new Date().toISOString().slice(0, 10);
  if (filter === "today") query = query.eq("check_in", today);
  if (filter === "pending") query = query.eq("status", "confirmed");

  const [{ data: reservations }, { data: properties }] = await Promise.all([
    query,
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
  ]);

  return (
    <>
      <Topbar
        subtitle="Reservas"
        title="Reservas"
        actions={
          <NewReservationDialog
            properties={properties ?? []}
            defaultOpen={openNew === "1"}
            trigger={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md">
                <Plus className="size-3.5" /> Nova reserva
              </span>
            }
          />
        }
      />

      <div className="flex flex-wrap gap-2 px-6 pt-6 md:px-10">
        {(
          [
            ["all", "Todas"],
            ["today", "Check-in hoje"],
            ["pending", "Pendentes"],
          ] as const
        ).map(([key, label]) => {
          const active = (filter ?? "all") === key;
          return (
            <Link
              key={key}
              href={key === "all" ? "/dashboard/reservations" : `/dashboard/reservations?filter=${key}`}
              className={
                active
                  ? "rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-white"
                  : "rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs font-medium text-foreground/70 hover:bg-muted/50"
              }
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="px-6 pt-4 md:px-10">
        {reservations?.length ? (
          <ReservationList reservations={reservations} />
        ) : (
          <EmptyState
            title="Nenhuma reserva ainda"
            description="Crie uma reserva manual ou conecte um PMS."
          />
        )}
      </div>
    </>
  );
}
