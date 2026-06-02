"use client";

import { ExtraCard } from "@/components/app/extra-card";
import { orderExtra } from "../actions";
import type { Extra } from "@/types/db";

export function ExtrasOrderClient({
  tabletCode,
  extras,
  disabled,
}: {
  tabletCode: string;
  extras: Extra[];
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {extras.map((extra) => (
        <ExtraCard
          key={extra.id}
          extra={extra}
          onOrder={
            disabled
              ? undefined
              : async (id) => orderExtra(tabletCode, id, 1)
          }
        />
      ))}
    </div>
  );
}
