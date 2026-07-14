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

  const now = new Date();
  const monthStart = new Date(now);
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  // Same slice of the previous month (1st → same day) so the revenue delta
  // compares like with like.
  const prevMonthStart = new Date(monthStart);
  prevMonthStart.setMonth(prevMonthStart.getMonth() - 1);
  const prevMonthSameDay = new Date(prevMonthStart);
  prevMonthSameDay.setDate(now.getDate());

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const daysAgo = (n: number) => new Date(Date.now() - 1000 * 60 * 60 * 24 * n);

  const [
    { data: reservations },
    { data: prevMonthReservations },
    { data: upcoming },
    { data: properties },
    { count: activeReservations },
    { data: revenueRows },
    { data: prevRevenueRows },
    { data: ratings },
  ] = await Promise.all([
    supabase
      .from("reservations")
      .select("amount, status, check_in")
      .eq("host_id", hostId)
      .gte("check_in", iso(monthStart)),
    supabase
      .from("reservations")
      .select("amount, status")
      .eq("host_id", hostId)
      .gte("check_in", iso(prevMonthStart))
      .lte("check_in", iso(prevMonthSameDay)),
    supabase
      .from("reservations")
      .select("*, properties(name, unit_code)")
      .eq("host_id", hostId)
      .gte("check_in", iso(new Date()))
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
      .gte("check_in", iso(daysAgo(30))),
    supabase
      .from("reservations")
      .select("amount")
      .eq("host_id", hostId)
      .gte("check_in", iso(daysAgo(60)))
      .lt("check_in", iso(daysAgo(30))),
    supabase
      .from("review_requests")
      .select("rating")
      .eq("host_id", hostId)
      .not("rating", "is", null),
  ]);

  const sumRevenue = (
    rows: { amount: unknown; status?: string }[] | null | undefined,
  ) =>
    rows?.reduce(
      (acc, r) =>
        r.status === "cancelled" ? acc : acc + Number(r.amount ?? 0),
      0,
    ) ?? 0;

  const monthRevenue = sumRevenue(reservations);
  const prevMonthRevenue = sumRevenue(prevMonthReservations);
  // Percentage change vs the same window last month; null when there is no
  // baseline so the UI omits the badge instead of inventing a number.
  const monthRevenueDeltaPct =
    prevMonthRevenue > 0
      ? Math.round(((monthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100)
      : null;

  const total30d = sumRevenue(revenueRows);
  const prevTotal30d = sumRevenue(prevRevenueRows);
  const revenue30dDeltaPct =
    prevTotal30d > 0
      ? Math.round(((total30d - prevTotal30d) / prevTotal30d) * 100)
      : null;

  const ratingValues = (ratings ?? [])
    .map((r) => Number(r.rating))
    .filter((r) => r >= 1 && r <= 5);
  const avgRating =
    ratingValues.length > 0
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : null;

  const occupancy =
    properties && properties.length > 0
      ? properties.reduce((a, p) => a + Number(p.occupancy_rate ?? 0), 0) /
        properties.length
      : 0;

  return {
    profile,
    hostId,
    monthRevenue,
    monthRevenueDeltaPct,
    revenue30dDeltaPct,
    avgRating,
    ratingCount: ratingValues.length,
    occupancy,
    activeReservations: activeReservations ?? 0,
    upcoming: upcoming ?? [],
    revenueSeries: revenueRows ?? [],
  };
}

