"use client";

import { useState, useTransition } from "react";
import { Trash2, UserPlus, Save } from "lucide-react";
import type { MessageTemplate, Profile } from "@/types/db";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import {
  changePassword,
  updateProfileName,
  inviteMember,
  removeMember,
  saveMessageTemplate,
} from "./actions";

type MemberRow = {
  id: string;
  role: "host_admin" | "host_staff";
  user_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export function SettingsClient({
  canManageTeam,
  profile,
  members,
  templates,
}: {
  canManageTeam: boolean;
  profile: Profile;
  members: MemberRow[];
  templates: MessageTemplate[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ProfileCard profile={profile} />
      <PasswordCard />
      {canManageTeam ? <TeamCard members={members} /> : null}
      {canManageTeam ? <TemplatesCard templates={templates} /> : null}
      <NotificationsCard />
      <PaymentsCard />
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-medium tracking-tight">
        {title}
      </h2>
      {description ? (
        <p className="mt-1 text-sm text-foreground/65">{description}</p>
      ) : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ProfileCard({ profile }: { profile: Profile }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <Section title="Perfil" description="Como seu nome aparece na conta.">
      <form
        action={(fd) =>
          start(async () => {
            const res = await updateProfileName(fd);
            setMsg({ ok: res.ok, text: res.ok ? "Salvo." : res.error ?? "Erro" });
          })
        }
        className="space-y-3"
      >
        <Field label="Nome completo" htmlFor="full_name">
          <input
            id="full_name"
            name="full_name"
            defaultValue={profile.full_name ?? ""}
            className={inputClass}
          />
        </Field>
        {msg ? (
          <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
        ) : null}
        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando…" : (<><Save className="size-4" /> Salvar</>)}
        </button>
      </form>
    </Section>
  );
}

function PasswordCard() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <Section title="Trocar senha">
      <form
        action={(fd) =>
          start(async () => {
            const res = await changePassword(fd);
            setMsg({ ok: res.ok, text: res.ok ? "Senha atualizada." : res.error ?? "Erro" });
            if (res.ok) {
              const el = document.getElementById("new-password") as HTMLInputElement | null;
              if (el) el.value = "";
            }
          })
        }
        className="space-y-3"
      >
        <Field label="Nova senha" htmlFor="new-password">
          <input
            id="new-password"
            name="password"
            type="password"
            minLength={6}
            required
            className={inputClass}
          />
        </Field>
        {msg ? (
          <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
        ) : null}
        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando…" : "Atualizar senha"}
        </button>
      </form>
    </Section>
  );
}

function TeamCard({ members }: { members: MemberRow[] }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <Section title="Time" description="Convide colegas e gerencie permissões.">
      <ul className="mb-4 divide-y divide-border/60 rounded-2xl border border-border/50">
        {members.length === 0 ? (
          <li className="px-3 py-3 text-sm text-foreground/55">
            Nenhum membro ainda.
          </li>
        ) : (
          members.map((m) => (
            <li key={m.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {m.profiles?.full_name ?? m.profiles?.email ?? "Membro"}
                </p>
                <p className="truncate text-[11px] text-foreground/55">
                  {m.profiles?.email} · {m.role === "host_admin" ? "Admin" : "Equipe"}
                </p>
              </div>
              <form
                action={() =>
                  start(async () => {
                    await removeMember(m.id);
                  })
                }
              >
                <button
                  type="submit"
                  className="grid size-8 place-items-center rounded-full text-foreground/55 hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remover"
                >
                  <Trash2 className="size-4" />
                </button>
              </form>
            </li>
          ))
        )}
      </ul>

      <form
        action={(fd) =>
          start(async () => {
            setErr(null);
            const res = await inviteMember(fd);
            if (!res.ok) setErr(res.error ?? "Erro");
            else (document.getElementById("invite-email") as HTMLInputElement).value = "";
          })
        }
        className="space-y-3"
      >
        <Field label="E-mail" htmlFor="invite-email">
          <input
            id="invite-email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="colega@email.com"
          />
        </Field>
        <Field label="Papel" htmlFor="invite-role">
          <select
            id="invite-role"
            name="role"
            defaultValue="host_staff"
            className={inputClass}
          >
            <option value="host_staff">Equipe</option>
            <option value="host_admin">Admin</option>
          </select>
        </Field>
        {err ? <FormMessage>{err}</FormMessage> : null}
        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Enviando…" : (<><UserPlus className="size-4" /> Convidar</>)}
        </button>
      </form>
    </Section>
  );
}

function TemplatesCard({ templates }: { templates: MessageTemplate[] }) {
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  return (
    <Section
      title="Templates de mensagem"
      description="Respostas prontas para reusar nas conversas."
    >
      <ul className="mb-4 space-y-2">
        {templates.map((t) => (
          <li
            key={t.id}
            className="rounded-2xl border border-border/50 bg-background/60 p-3"
          >
            <p className="text-xs font-semibold">{t.title}</p>
            <p className="mt-1 text-xs text-foreground/70">{t.body}</p>
          </li>
        ))}
      </ul>
      <form
        action={(fd) =>
          start(async () => {
            setErr(null);
            const res = await saveMessageTemplate(fd);
            if (res.ok) {
              (document.getElementById("tmpl-title") as HTMLInputElement).value = "";
              (document.getElementById("tmpl-body") as HTMLTextAreaElement).value = "";
            } else setErr(res.error ?? "Erro");
          })
        }
        className="space-y-3"
      >
        <Field label="Título" htmlFor="tmpl-title">
          <input id="tmpl-title" name="title" required className={inputClass} />
        </Field>
        <Field label="Mensagem" htmlFor="tmpl-body">
          <textarea
            id="tmpl-body"
            name="body"
            required
            rows={3}
            className={`${inputClass} rounded-2xl`}
          />
        </Field>
        {err ? <FormMessage>{err}</FormMessage> : null}
        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando…" : "Salvar template"}
        </button>
      </form>
    </Section>
  );
}

function NotificationsCard() {
  return (
    <Section title="Notificações" description="Em breve: e-mail e push para hóspede e equipe.">
      <p className="text-sm text-foreground/60">
        Avisos automáticos para check-in, novas mensagens e novos pedidos vão entrar aqui.
      </p>
    </Section>
  );
}

function PaymentsCard() {
  return (
    <Section title="Pagamentos" description="Em breve: cobrar extras direto no cartão do hóspede.">
      <p className="text-sm text-foreground/60">
        Integração com gateway será habilitada quando seu plano permitir.
      </p>
    </Section>
  );
}
