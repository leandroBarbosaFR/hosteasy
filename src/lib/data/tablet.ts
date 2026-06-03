import "server-only";
import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type {
  Reservation,
  Property,
  Tablet,
  Host,
} from "@/types/db";

// Tablet routes are unauthenticated and scoped purely by tablet_code.
// We use the service-role client server-side so the public anon role never
// touches host data. The client receives only guest-safe fields.

export type TabletContext = {
  tablet: Tablet;
  property: Property | null;
  host: Pick<Host, "id" | "name" | "pix_key" | "pix_instructions">;
  reservation:
    | (Pick<
        Reservation,
        | "id"
        | "guest_name"
        | "check_in"
        | "check_out"
        | "nights"
        | "status"
        | "tablet_id"
      > & { property_id: string })
    | null;
};

export async function resolveTabletContext(
  tabletCode: string,
): Promise<TabletContext> {
  const admin = createSupabaseAdminClient();
  const { data: tablet } = await admin
    .from("tablets")
    .select("*")
    .eq("tablet_code", tabletCode)
    .maybeSingle();
  if (!tablet) notFound();

  const [{ data: property }, { data: host }, { data: reservation }] =
    await Promise.all([
      tablet.property_id
        ? admin
            .from("properties")
            .select("*")
            .eq("id", tablet.property_id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      admin
        .from("hosts")
        .select("id, name, pix_key, pix_instructions")
        .eq("id", tablet.host_id)
        .single(),
      admin
        .from("reservations")
        .select(
          "id, guest_name, check_in, check_out, nights, status, tablet_id, property_id",
        )
        .eq("tablet_id", tablet.id)
        .in("status", ["confirmed", "in_stay"])
        .order("check_in", { ascending: true })
        .limit(1)
        .maybeSingle(),
    ]);

  return {
    tablet: tablet as Tablet,
    property: property as Property | null,
    host: host as TabletContext["host"],
    reservation:
      (reservation as TabletContext["reservation"] | null) ?? null,
  };
}
