"use client";

import { MessageThread } from "@/components/app/message-thread";
import { sendGuestMessage } from "../actions";

export function GuestThread({
  tabletCode,
  initial,
  disabled,
}: {
  tabletCode: string;
  initial: Array<{
    id: string;
    body: string;
    sender_type: "guest" | "host" | "system";
    created_at: string;
  }>;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div className="rounded-3xl border border-dashed border-foreground/15 bg-white/40 px-5 py-12 text-center text-sm text-foreground/60">
        O chat ficará disponível quando sua estadia começar.
      </div>
    );
  }
  return (
    <MessageThread
      initialMessages={initial}
      selfSide="guest"
      placeholder="Escreva pro anfitrião…"
      emptyHint="Mande a primeira mensagem."
      onSend={async (body) => sendGuestMessage(tabletCode, body)}
    />
  );
}
