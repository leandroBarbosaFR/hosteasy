"use client";

import { useState, useTransition } from "react";
import { FlaskConical } from "lucide-react";
import { setHostBeta } from "../../beta/actions";

export function HostBetaToggle({
  hostId,
  initial,
}: {
  hostId: string;
  initial: boolean;
}) {
  const [enabled, setEnabled] = useState(initial);
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FlaskConical className="size-5" />
        </div>
        <div>
          <p className="font-display text-base font-medium tracking-tight">
            Programa beta
          </p>
          <p className="text-xs text-foreground/65">
            Hosts marcados como beta aparecem no painel{" "}
            <span className="font-mono">/admin/beta</span> com checklist e ROI em tempo real.
          </p>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <span className="font-medium">Beta</span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={pending}
          onChange={(e) => {
            const next = e.target.checked;
            setEnabled(next);
            start(async () => {
              const res = await setHostBeta(hostId, next);
              if (!res.ok) setEnabled(!next);
            });
          }}
          className="size-4 rounded accent-primary"
        />
      </label>
    </div>
  );
}
