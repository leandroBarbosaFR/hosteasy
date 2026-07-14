"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PlayCircle, CheckCircle as CheckCircle2, Pause, XCircle, Trash as Trash2, RadioButton as CircleDot } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";
import { updateTaskStatus, deleteTask } from "../../actions";
import type { StaffTaskStatus } from "@/types/db";

const NEXT_STATUS: Record<StaffTaskStatus, StaffTaskStatus[]> = {
  pending:     ["in_progress", "done", "blocked", "cancelled"],
  in_progress: ["done", "blocked", "pending", "cancelled"],
  blocked:     ["pending", "in_progress", "cancelled"],
  done:        ["in_progress"],
  cancelled:   ["pending"],
};

const LABEL: Record<StaffTaskStatus, { text: string; Icon: typeof CheckCircle2 }> = {
  pending:     { text: "Marcar pendente",  Icon: CircleDot },
  in_progress: { text: "Iniciar",          Icon: PlayCircle },
  done:        { text: "Concluir",         Icon: CheckCircle2 },
  blocked:     { text: "Bloqueada",        Icon: Pause },
  cancelled:   { text: "Cancelar",         Icon: XCircle },
};

export function TaskActions({
  taskId,
  currentStatus,
  canDelete,
}: {
  taskId: string;
  currentStatus: StaffTaskStatus;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const choices = NEXT_STATUS[currentStatus];

  return (
    <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
        Mudar status
      </p>
      <div className="mt-2 grid gap-2">
        {choices.map((s) => {
          const M = LABEL[s];
          return (
            <button
              key={s}
              type="button"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setErr(null);
                  const r = await updateTaskStatus(taskId, s);
                  if (!r.ok) setErr(r.error ?? "Erro");
                  else router.refresh();
                })
              }
              className={cn(
                "inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-colors",
                s === "done"
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : s === "cancelled"
                    ? "bg-destructive/10 text-destructive hover:bg-destructive/15"
                    : "bg-foreground/5 text-foreground hover:bg-foreground/10",
              )}
            >
              <M.Icon className="size-3.5" />
              {M.text}
            </button>
          );
        })}
      </div>

      {err ? <p className="mt-2 text-[11px] text-destructive">{err}</p> : null}

      {canDelete ? (
        confirmDelete ? (
          <div className="mt-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
            Tem certeza? A tarefa e os comentários serão removidos.
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const r = await deleteTask(taskId);
                    if (r.ok) router.push("/staff/tasks");
                    else setErr(r.error ?? "Erro");
                  })
                }
                className="rounded-full bg-destructive px-3 py-1.5 text-xs font-semibold text-white"
              >
                Sim, excluir
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full bg-foreground/5 px-3 py-1.5 text-xs font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/15"
          >
            <Trash2 className="size-3.5" /> Excluir tarefa
          </button>
        )
      ) : null}
    </div>
  );
}
