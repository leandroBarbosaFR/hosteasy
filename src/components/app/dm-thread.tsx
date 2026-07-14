"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PaperPlaneTilt as Send } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import type { StaffMessage } from "@/types/db";

type DmMessage = Pick<StaffMessage, "id" | "body" | "sender_id" | "created_at">;

// Direct-message thread between two team members. Sibling of MessageThread
// (guest chat), but "mine" is decided by sender_id instead of sender_type.
export function DmThread({
  selfId,
  initialMessages,
  onSend,
  emptyHint = "Sem mensagens ainda. Diga oi!",
  placeholder = "Escreva uma mensagem…",
}: {
  selfId: string;
  initialMessages: DmMessage[];
  onSend: (
    body: string,
  ) => Promise<{ ok: boolean; error?: string; message?: DmMessage }>;
  emptyHint?: string;
  placeholder?: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setError(null);
    start(async () => {
      const res = await onSend(body);
      if (res.ok && res.message) {
        setMessages((m) => [...m, res.message!]);
        setDraft("");
      } else {
        setError(res.error ?? "Não foi possível enviar.");
      }
    });
  }

  return (
    <div className="flex h-full min-h-[60vh] flex-col rounded-3xl border border-border/50 bg-card shadow-sm">
      <div className="flex-1 space-y-2 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-foreground/55">{emptyHint}</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === selfId;
            return (
              <div
                key={m.id}
                className={cn("flex", mine ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                    mine
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-muted text-foreground",
                  )}
                >
                  {m.body}
                  <div
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-foreground/45",
                    )}
                  >
                    {new Date(m.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border/60 p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-full bg-muted/60 px-4 py-2.5 text-sm outline-none placeholder:text-foreground/45 focus:bg-muted"
        />
        <button
          type="submit"
          disabled={pending || !draft.trim()}
          className="grid size-10 place-items-center rounded-full bg-foreground text-white transition-opacity disabled:opacity-50"
          aria-label="Enviar"
        >
          <Send className="size-4" />
        </button>
      </form>
      {error ? (
        <p className="border-t border-border/60 px-4 py-1.5 text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
