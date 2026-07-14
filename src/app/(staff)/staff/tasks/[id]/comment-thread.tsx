"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PaperPlaneTilt as Send } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { addTaskComment } from "../../actions";

type CommentWithSender = {
  id: string;
  body: string;
  created_at: string;
  sender_id: string | null;
  sender_name: string;
};

export function CommentThread({
  taskId,
  currentUserId,
  initial,
}: {
  taskId: string;
  currentUserId: string;
  initial: CommentWithSender[];
}) {
  const [comments, setComments] = useState<CommentWithSender[]>(initial);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setErr(null);
    start(async () => {
      const res = await addTaskComment(taskId, body);
      if (res.ok && res.comment) {
        setComments((cs) => [
          ...cs,
          { ...res.comment!, sender_name: "Você" },
        ]);
        setDraft("");
      } else {
        setErr(res.error ?? "Erro");
      }
    });
  }

  return (
    <section className="flex h-[60vh] flex-col rounded-3xl border border-border/50 bg-card shadow-sm">
      <div className="border-b border-border/60 px-5 py-3">
        <p className="text-sm font-semibold">Conversa</p>
        <p className="text-[11px] text-foreground/55">
          Mensagens entre anfitrião e equipe sobre esta tarefa.
        </p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-5">
        {comments.length === 0 ? (
          <p className="py-10 text-center text-sm text-foreground/55">
            Sem mensagens ainda. Deixe a primeira.
          </p>
        ) : (
          comments.map((c) => {
            const mine = c.sender_id === currentUserId;
            return (
              <div
                key={c.id}
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
                  {!mine ? (
                    <p className="text-[10px] font-semibold uppercase tracking-wider opacity-60">
                      {c.sender_name}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-line">{c.body}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px]",
                      mine ? "text-white/70" : "text-foreground/45",
                    )}
                  >
                    {new Date(c.created_at).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-center gap-2 border-t border-border/60 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escrever mensagem…"
          maxLength={2000}
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
      {err ? (
        <p className="border-t border-border/60 px-4 py-1.5 text-[11px] text-destructive">{err}</p>
      ) : null}
    </section>
  );
}
