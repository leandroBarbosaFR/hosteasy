import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/auth";

export async function requireHostContext() {
  const profile = await getProfile();
  if (!profile) redirect("/login");
  if (!profile.host_id) redirect("/dashboard/setup");
  return { profile, hostId: profile.host_id };
}

export async function getHostDashboardData() {
  const { hostId, profile } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    { data: reservations },
    { data: upcoming },
    { data: properties },
    { count: activeReservations },
    { data: revenueRows },
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("amount, status, check_in")
      .eq("host_id", hostId)
      .gte("check_in", monthStart.toISOString().slice(0, 10)),
    supabase
      .from("reservations")
      .select("*, properties(name, unit_code)")
      .eq("host_id", hostId)
      .gte("check_in", new Date().toISOString().slice(0, 10))
      .order("check_in", { ascending: true })
      .limit(6),
    supabase
      .from("properties")
      .select("occupancy_rate")
      .eq("host_id", hostId),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .in("status", ["confirmed", "in_stay"]),
    supabase
      .from("reservations")
      .select("amount, check_in")
      .eq("host_id", hostId)
      .gte(
        "check_in",
        new Date(Date.now() - 1000 * 60 * 60 * 24 * 30)
          .toISOString()
          .slice(0, 10),
      ),
  ]);

  const monthRevenue =
    reservations?.reduce(
      (acc, r) =>
        r.status === "cancelled" ? acc : acc + Number(r.amount ?? 0),
      0,
    ) ?? 0;

  const occupancy =
    properties && properties.length > 0
      ? properties.reduce((a, p) => a + Number(p.occupancy_rate ?? 0), 0) /
        properties.length
      : 0;

  return {
    profile,
    hostId,
    monthRevenue,
    occupancy,
    activeReservations: activeReservations ?? 0,
    upcoming: upcoming ?? [],
    revenueSeries: revenueRows ?? [],
  };
}
