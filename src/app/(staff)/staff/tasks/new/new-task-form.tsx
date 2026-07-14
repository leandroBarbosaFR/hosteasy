"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { createTask } from "../../actions";

type PropertyOpt = { id: string; name: string; unit_code: string | null };
type MemberOpt = { id: string; name: string; email: string };

export function NewTaskForm({
  properties,
  members,
  currentUserId,
  canAssignOthers,
}: {
  properties: PropertyOpt[];
  members: MemberOpt[];
  currentUserId: string;
  canAssignOthers: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  return (
    <form
      action={(fd) =>
        start(async () => {
          setErr(null);
          if (!canAssignOthers) fd.set("assignee_id", currentUserId);
          const res = await createTask(fd);
          if (res.ok && res.id) {
            router.push(`/staff/tasks/${res.id}`);
          } else {
            setErr(res.error ?? "Erro");
          }
        })
      }
      className="max-w-xl space-y-3 rounded-3xl border border-border/50 bg-card p-6 shadow-sm"
    >
      <Field label="Título" htmlFor="title">
        <input
          id="title"
          name="title"
          required
          minLength={2}
          maxLength={160}
          className={inputClass}
          placeholder="Limpeza Vilas do Luiz 102"
        />
      </Field>

      <Field label="Descrição" htmlFor="description">
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={2000}
          placeholder="Detalhes, observações, fotos por enquanto no comentário..."
          className={`${inputClass} rounded-2xl`}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Categoria" htmlFor="category">
          <select id="category" name="category" defaultValue="cleaning" className={inputClass}>
            <option value="cleaning">Limpeza</option>
            <option value="maintenance">Manutenção</option>
            <option value="supplies">Repor amenities</option>
            <option value="check_in">Check-in</option>
            <option value="check_out">Check-out</option>
            <option value="other">Outro</option>
          </select>
        </Field>
        <Field label="Prioridade" htmlFor="priority">
          <select id="priority" name="priority" defaultValue="normal" className={inputClass}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </Field>
      </div>

      <Field label="Imóvel (opcional)" htmlFor="property_id">
        <select id="property_id" name="property_id" defaultValue="" className={inputClass}>
          <option value="">— Sem imóvel —</option>
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
              {p.unit_code ? ` · ${p.unit_code}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Prazo (opcional)" htmlFor="due_at">
        <input
          id="due_at"
          name="due_at"
          type="datetime-local"
          className={inputClass}
        />
      </Field>

      {canAssignOthers ? (
        <Field label="Atribuir a" htmlFor="assignee_id">
          <select id="assignee_id" name="assignee_id" defaultValue="" className={inputClass}>
            <option value="">— Sem responsável —</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} {m.email ? `· ${m.email}` : ""}
              </option>
            ))}
          </select>
        </Field>
      ) : (
        <p className="text-[11px] text-foreground/55">
          A tarefa será atribuída a você automaticamente.
        </p>
      )}

      {err ? <FormMessage>{err}</FormMessage> : null}

      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Criando…" : "Criar tarefa"}
        <span className="grid size-7 place-items-center rounded-full bg-white/15">
          <ArrowRight className="size-3.5" />
        </span>
      </button>
    </form>
  );
}
