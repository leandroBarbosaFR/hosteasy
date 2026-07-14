"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

// Event-driven complement to AutoRefresh: subscribes to Postgres changes on
// the given tables (RLS decides which rows this user can see) and refreshes
// the route when something lands. Mounted in the dashboard/staff layouts so
// chat, notifications and badges update instantly instead of on the next
// polling tick. Bursts are coalesced into a single refresh.
export function RealtimeRefresh({ tables }: { tables: string[] }) {
  const router = useRouter();
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = tables.join(",");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase.channel(`refresh:${key}`);

    for (const table of key.split(",")) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        () => {
          if (pending.current) return;
          pending.current = setTimeout(() => {
            pending.current = null;
            router.refresh();
          }, 400);
        },
      );
    }
    channel.subscribe();

    return () => {
      if (pending.current) clearTimeout(pending.current);
      pending.current = null;
      void supabase.removeChannel(channel);
    };
  }, [key, router]);

  return null;
}
