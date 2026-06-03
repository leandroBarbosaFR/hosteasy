import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_MONTHLY_COST = Number(process.env.HOSTEASY_MONTHLY_COST_BRL ?? 99);

export async function getRoiSnapshot(hostId: string) {
  const supabase = await createSupabaseServerClient();
  const monthStart = monthStartIso();

  const [
    { data: paidOrders },
    { count: pendingOrdersCount },
    { count: messageCount },
    { count: requestCount },
    { count: positiveCount },
    { count: complaintCount },
  ] = await Promise.all([
    supabase
      .from("extra_orders")
      .select("total, status, extras(category, title)")
      .eq("host_id", hostId)
      .gte("created_at", monthStart),
    supabase
      .from("extra_orders")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .in("status", ["pending", "approved", "pending_payment"])
      .gte("created_at", monthStart),
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .eq("sender_type", "guest")
      .gte("created_at", monthStart),
    supabase
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .gte("created_at", monthStart),
    supabase
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .gte("rating", 5)
      .gte("created_at", monthStart),
    supabase
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .lte("rating", 4)
      .not("private_feedback", "is", null)
      .gte("created_at", monthStart),
  ]);

  const paid = (paidOrders ?? []).filter(
    (o) => o.status === "paid" || o.status === "delivered",
  );
  const totalRevenue = paid.reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  // Group revenue by category for the breakdown card
  const byCategory: Record<string, number> = {};
  for (const o of paid) {
    const rel = (o as { extras?: { category?: string }[] | { category?: string } | null }).extras;
    const cat = Array.isArray(rel)
      ? rel[0]?.category ?? "custom"
      : rel?.category ?? "custom";
    byCategory[cat] = (byCategory[cat] ?? 0) + Number(o.total ?? 0);
  }

  // Conservative time saving: each guest message that didn't happen because
  // of self-service is ~2 minutes for the host. We approximate "saved"
  // interactions by counting *guest-sent* messages this month plus the
  // number of guides + extras + web-shortcut hits implied by typical kiosk
  // usage. For beta we use a simple proxy: 2 self-service interactions per
  // active reservation per day (very conservative).
  const monthDays = Math.max(
    1,
    Math.ceil((Date.now() - new Date(monthStart).getTime()) / 86_400_000),
  );
  const { count: activeReservationsThisMonth } = await supabase
    .from("reservations")
    .select("id", { count: "exact", head: true })
    .eq("host_id", hostId)
    .lte("check_in", new Date().toISOString().slice(0, 10))
    .gte("check_out", monthStart.slice(0, 10));

  const estimatedSelfServiceInteractions =
    (activeReservationsThisMonth ?? 0) * monthDays * 2;
  const estimatedMinutesSaved = estimatedSelfServiceInteractions * 2;

  const monthlyCost = DEFAULT_MONTHLY_COST;
  const roiMultiple = monthlyCost > 0 ? totalRevenue / monthlyCost : 0;

  return {
    totalRevenue,
    byCategory,
    paidOrdersCount: paid.length,
    pendingOrdersCount: pendingOrdersCount ?? 0,
    guestMessagesThisMonth: messageCount ?? 0,
    reviewRequests: requestCount ?? 0,
    positiveReviews: positiveCount ?? 0,
    privateComplaints: complaintCount ?? 0,
    estimatedMinutesSaved,
    monthlyCost,
    roiMultiple,
  };
}

function monthStartIso(): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
