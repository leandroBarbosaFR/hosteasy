"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash as Trash2, UserPlus, FloppyDisk as Save, Bell } from "@phosphor-icons/react/ssr";
import type { MessageTemplate, Profile, WorkerSpecialty } from "@/types/db";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { SPECIALTY_LABELS } from "@/lib/labels";
import {
  changePassword,
  updateProfileName,
  inviteMember,
  removeMember,
  updateMemberSpecialty,
  saveMessageTemplate,
  updateHostPix,
  updateHostNotifications,
} from "./actions";

type MemberRow = {
  id: string;
  role: "host_admin" | "host_staff";
  specialty: WorkerSpecialty;
  user_id: string;
  profiles: { full_name: string | null; email: string | null } | null;
};

export function SettingsClient({
  canManageTeam,
  profile,
  members,
  templates,
  pix,
  notify,
}: {
  canManageTeam: boolean;
  profile: Profile;
  members: MemberRow[];
  templates: MessageTemplate[];
  pix: { pix_key: string | null; pix_instructions: string | null };
  notify: {
    whatsapp_number: string | null;
    notify_email: boolean;
    notify_whatsapp: boolean;
  };
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ProfileCard profile={profile} />
      <PasswordCard />
      {canManageTeam ? <TeamCard members={members} /> : null}
      {canManageTeam ? <TemplatesCard templates={templates} /> : null}
      {canManageTeam ? <NotificationsCard notify={notify} /> : null}
      {canManageTeam ? <PixCard pix={pix} /> : null}
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
      <h2 className="font-display text-lg font-bold tracking-tight">
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
              <div className="flex shrink-0 items-center gap-1.5">
                <select
                  defaultValue={m.specialty}
                  onChange={(e) =>
                    start(async () => {
                      await updateMemberSpecialty(m.id, e.target.value);
                    })
                  }
                  className="rounded-full border border-border/60 bg-background px-2 py-1 text-[11px] font-medium"
                  aria-label="Especialidade"
                >
                  {(
                    Object.entries(SPECIALTY_LABELS) as [WorkerSpecialty, string][]
                  ).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
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
              </div>
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
        <div className="grid grid-cols-2 gap-3">
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
          <Field label="Especialidade" htmlFor="invite-specialty">
            <select
              id="invite-specialty"
              name="specialty"
              defaultValue="cleaning"
              className={inputClass}
            >
              {(
                Object.entries(SPECIALTY_LABELS) as [WorkerSpecialty, string][]
              ).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </Field>
        </div>
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

function NotificationsCard({
  notify,
}: {
  notify: {
    whatsapp_number: string | null;
    notify_email: boolean;
    notify_whatsapp: boolean;
  };
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <Section
      title="Notificações"
      description="Novas reservas, estoque baixo, pedidos e tarefas — no app, por e-mail e WhatsApp."
    >
      <form
        action={(fd) =>
          start(async () => {
            const res = await updateHostNotifications(fd);
            setMsg({ ok: res.ok, text: res.ok ? "Salvo." : res.error ?? "Erro" });
          })
        }
        className="space-y-3"
      >
        <Field
          label="WhatsApp do anfitrião"
          htmlFor="notify-whatsapp-number"
          hint="Com DDI e DDD, ex.: 5548999998888."
        >
          <input
            id="notify-whatsapp-number"
            name="whatsapp_number"
            inputMode="tel"
            defaultValue={notify.whatsapp_number ?? ""}
            className={inputClass}
            placeholder="5548999998888"
          />
        </Field>
        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm">
          <span>Receber por e-mail</span>
          <input
            type="checkbox"
            name="notify_email"
            defaultChecked={notify.notify_email}
            className="size-4 rounded accent-primary"
          />
        </label>
        <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm">
          <span>Receber por WhatsApp</span>
          <input
            type="checkbox"
            name="notify_whatsapp"
            defaultChecked={notify.notify_whatsapp}
            className="size-4 rounded accent-primary"
          />
        </label>
        {msg ? (
          <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
        ) : null}
        <div className="flex items-center gap-2">
          <button disabled={pending} className={primaryButtonClass}>
            {pending ? "Salvando…" : (<><Save className="size-4" /> Salvar</>)}
          </button>
          <Link
            href="/dashboard/notifications"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground hover:bg-foreground/10"
          >
            <Bell className="size-3.5" /> Abrir notificações
          </Link>
        </div>
      </form>
    </Section>
  );
}

function PixCard({
  pix,
}: {
  pix: { pix_key: string | null; pix_instructions: string | null };
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <Section
      title="Pagamentos via PIX"
      description="O tablet mostra sua chave PIX quando o hóspede pede um extra."
    >
      <form
        action={(fd) =>
          start(async () => {
            const res = await updateHostPix(fd);
            setMsg({ ok: res.ok, text: res.ok ? "Salvo." : res.error ?? "Erro" });
          })
        }
        className="space-y-3"
      >
        <Field label="Chave PIX" htmlFor="pix-key">
          <input
            id="pix-key"
            name="pix_key"
            defaultValue={pix.pix_key ?? ""}
            className={inputClass}
            placeholder="email, CPF/CNPJ ou chave aleatória"
          />
        </Field>
        <Field label="Instruções para o hóspede" htmlFor="pix-instructions">
          <textarea
            id="pix-instructions"
            name="pix_instructions"
            rows={2}
            defaultValue={pix.pix_instructions ?? ""}
            className={`${inputClass} rounded-2xl`}
            placeholder="Ex.: Envie o comprovante pelo chat do tablet."
          />
        </Field>
        {msg ? (
          <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
        ) : null}
        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando…" : (<><Save className="size-4" /> Salvar PIX</>)}
        </button>
      </form>
    </Section>
  );
}
