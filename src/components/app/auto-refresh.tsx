"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Drop into a server-component page to make it re-fetch its data every
// `intervalMs`. Pauses while the tab is hidden so we don't burn cycles.
export function AutoRefresh({ intervalMs = 15_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
