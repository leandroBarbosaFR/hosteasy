"use client";

import { useEffect } from "react";
import { MessageThread } from "@/components/app/message-thread";
import { sendHostMessage, markThreadRead } from "./actions";
import type { Message } from "@/types/db";

type ThreadMessage = Pick<Message, "id" | "body" | "sender_type" | "created_at">;

export function ThreadView({
  reservationId,
  guestName,
  propertyName,
  initial,
}: {
  reservationId: string;
  guestName: string;
  propertyName: string;
  initial: ThreadMessage[];
}) {
  useEffect(() => {
    void markThreadRead(reservationId);
  }, [reservationId]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-border/50 bg-card px-4 py-3 shadow-sm">
        <p className="text-sm font-semibold">{guestName}</p>
        <p className="text-[11px] text-foreground/55">{propertyName}</p>
      </div>
      <MessageThread
        initialMessages={initial}
        selfSide="host"
        emptyHint="Sem mensagens nessa reserva ainda."
        placeholder="Responder…"
        onSend={async (body) => {
          const res = await sendHostMessage(reservationId, body);
          return res;
        }}
      />
    </div>
  );
}
