import type { NextRequest } from "next/server";
import { syncAllActiveSources } from "@/lib/sync";
import { sweepCleaningTasks } from "@/lib/cleaning";

// Hourly cron (see vercel.json). Pulls every active Airbnb/Booking iCal feed,
// imports new reservations and notifies host admins, then sweeps upcoming
// check-outs for missing cleaning tasks (properties with a default cleaner).
// Vercel sends `Authorization: Bearer ${CRON_SECRET}` automatically when the
// env var is set.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const summary = await syncAllActiveSources();
  const cleaning = await sweepCleaningTasks();
  console.log(
    `[cron/sync-reservations] sources=${summary.total} ok=${summary.succeeded} failed=${summary.failed} imported=${summary.imported} cleaningTasks=${cleaning.created}`,
  );
  return Response.json({ ok: true, ...summary, cleaningTasksCreated: cleaning.created });
}
