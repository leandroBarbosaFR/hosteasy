"use client";

import { useEffect, useState } from "react";
import { Maximize2 } from "lucide-react";

// Shown on tablet routes when the page is loaded in a regular browser tab
// (i.e. not installed as a PWA). On first tap, request fullscreen via the
// Fullscreen API so the browser chrome disappears. Auto-skips when the page
// is already running in standalone / fullscreen display mode (installed PWA
// or kiosk browser).
export function TabletKioskGate({ tabletCode }: { tabletCode: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      // iOS Safari quirk
      ("standalone" in window.navigator &&
        (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (standalone) return;

    // Already fullscreen? skip.
    if (document.fullscreenElement) return;

    // Don't pester the same session twice.
    if (sessionStorage.getItem("hosteasy:tablet-gate-dismissed") === "1") return;

    setShow(true);
  }, []);

  if (!show) return null;

  async function enter() {
    try {
      const el = document.documentElement;
      if (el.requestFullscreen) {
        await el.requestFullscreen({ navigationUI: "hide" });
      } else if (
        "webkitRequestFullscreen" in el &&
        typeof (el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen === "function"
      ) {
        await (el as HTMLElement & { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      }
    } catch {
      // Some browsers (iOS Safari) don't expose the Fullscreen API. The
      // overlay still dismisses and the page works normally; the user can
      // also Add to Home Screen for a real fullscreen install.
    }
    sessionStorage.setItem("hosteasy:tablet-gate-dismissed", "1");
    setShow(false);
  }

  return (
    <button
      type="button"
      onClick={enter}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#FAF7F4] via-[#F4ECE3] to-[#F5DDD0] text-foreground transition-opacity"
      aria-label="Toque para começar"
    >
      <div className="grid size-16 place-items-center rounded-2xl bg-primary/15 text-primary">
        <Maximize2 className="size-7" />
      </div>
      <div className="px-8 text-center">
        <p className="font-display text-3xl font-medium tracking-tight md:text-4xl">
          Toque para começar
        </p>
        <p className="mt-2 text-sm text-foreground/65">
          Tablet <span className="font-mono">{tabletCode}</span> · Hosteasy
        </p>
      </div>
      <span className="absolute bottom-12 inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-xs font-medium text-foreground/70 backdrop-blur">
        Modo apresentação
      </span>
    </button>
  );
}
