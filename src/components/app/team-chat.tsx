"use client";

import { useEffect } from "react";
import { DmThread } from "@/components/app/dm-thread";
import { sendStaffMessage, markDmThreadRead } from "@/lib/actions/chat";
import type { StaffMessage } from "@/types/db";

// Client side of a team DM: marks the thread read on open and wires the send
// action to the selected contact.
export function TeamChatPanel({
  selfId,
  otherId,
  initialMessages,
}: {
  selfId: string;
  otherId: string;
  initialMessages: Pick<
    StaffMessage,
    "id" | "body" | "sender_id" | "created_at"
  >[];
}) {
  useEffect(() => {
    void markDmThreadRead(otherId);
  }, [otherId]);

  return (
    <DmThread
      selfId={selfId}
      initialMessages={initialMessages}
      onSend={(body) => sendStaffMessage(otherId, body)}
    />
  );
}
