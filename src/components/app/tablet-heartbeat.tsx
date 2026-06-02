"use client";

import { useEffect } from "react";
import { recordTabletHeartbeat } from "@/app/(tablet)/tablet/[tabletCode]/actions";

// Minimal Battery / Network API shapes (TS lib doesn't ship them).
type BatteryManager = {
  level: number;
  charging: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
};

type NetworkInformation = {
  type?: string;
  effectiveType?: string;
};

const INTERVAL_MS = 60_000;

// Mounts once per tablet route. Reports battery, network, and online state
// to the server every minute (and on initial mount, visibility change, and
// online/offline events). The server updates last_seen_at + telemetry.
export function TabletHeartbeat({ tabletCode }: { tabletCode: string }) {
  useEffect(() => {
    if (typeof navigator === "undefined") return;

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;
    let batteryRef: BatteryManager | null = null;

    async function readBattery(): Promise<{
      battery_percent: number | null;
      charging: boolean | null;
    }> {
      try {
        const nav = navigator as Navigator & {
          getBattery?: () => Promise<BatteryManager>;
        };
        if (!nav.getBattery) return { battery_percent: null, charging: null };
        if (!batteryRef) batteryRef = await nav.getBattery();
        return {
          battery_percent: Math.round((batteryRef?.level ?? 0) * 100),
          charging: batteryRef?.charging ?? null,
        };
      } catch {
        return { battery_percent: null, charging: null };
      }
    }

    function readWifi(): string | null {
      try {
        const nav = navigator as Navigator & {
          connection?: NetworkInformation;
        };
        if (!navigator.onLine) return "disconnected";
        const conn = nav.connection;
        if (conn?.type === "wifi") return "connected";
        if (conn?.type === "cellular") return "cellular";
        // Effective type is "4g", "3g", etc. — we map any working
        // connection to "connected" when no explicit type is known.
        if (conn?.effectiveType) return "connected";
        return navigator.onLine ? "connected" : "disconnected";
      } catch {
        return navigator.onLine ? "connected" : null;
      }
    }

    async function send() {
      if (cancelled) return;
      const battery = await readBattery();
      const wifi = readWifi();
      try {
        await recordTabletHeartbeat(tabletCode, {
          battery_percent: battery.battery_percent,
          wifi_status: wifi,
          online: navigator.onLine,
        });
      } catch {
        // Network blip; we'll catch up next tick.
      }
    }

    // Initial ping, then every minute.
    void send();
    timer = setInterval(send, INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void send();
    };
    const onOnline = () => void send();
    const onOffline = () => void send();

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [tabletCode]);

  return null;
}
