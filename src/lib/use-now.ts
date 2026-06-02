"use client";

import { useSyncExternalStore } from "react";

// Returns the current Date.now() and re-renders every `intervalMs`.
// SSR-safe (returns null on the server, real value after mount).
// Uses useSyncExternalStore so React 19's purity rules stay happy.
export function useNow(intervalMs = 30_000): number | null {
  return useSyncExternalStore<number | null>(
    (onChange) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    () => Date.now(),
    () => null,
  );
}
