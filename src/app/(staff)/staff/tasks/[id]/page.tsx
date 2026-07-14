import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Calendar, User } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { requireStaffContext } from "@/lib/data/staff";
import { listInventoryItems } from "@/lib/data/inventory";
import { StockCountForm } from "@/components/app/stock-count-form";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TaskStatusPill, TaskCategoryIcon, TaskCategoryLabel } from "../../_components";
import type { StaffTask, StaffTaskComment } from "@/types/db";
import { TaskActions } from "./task-actions";
import { CommentThread } from "./comment-thread";

export default async function StaffTaskDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, hostId } = await requireStaffContext();
  const supabase = await createSupabaseServerClient();

  const { data: task } = await supabase
    .from("staff_tasks")
    .select(
      "*, properties(name, unit_code), assignee:assignee_id(full_name, email), creator:created_by_id(full_name, email)",
    )
    .eq("id", id)
    .eq("host_id", hostId)
    .maybeSingle();

  if (!task) notFound();
  const t = task as unknown as StaffTask & {
    properties: { name?: string; unit_code?: string | null } | null;
    assignee: { full_name?: string | null; email?: string | null } | null;
    creator: { full_name?: string | null; email?: string | null } | null;
  };

  const { data: comments } = await supabase
    .from("staff_task_comments")
    .select("*, sender:sender_id(full_name, email)")
    .eq("task_id", id)
    .order("created_at", { ascending: true });

  // Cleaning-style tasks get the "how much is left?" stock report inline.
  const stockCategories = ["cleaning", "supplies", "check_out"];
  const stockItems =
    t.property_id && stockCategories.includes(t.category)
      ? await listInventoryItems(hostId, { propertyId: t.property_id })
      : [];

  const propRel = Array.isArray(t.properties) ? t.properties[0] : t.properties;
  const assigneeRel = Array.isArray(t.assignee) ? t.assignee[0] : t.assignee;
  const creatorRel = Array.isArray(t.creator) ? t.creator[0] : t.creator;

  const canEditStatus =
    profile.role !== "host_staff" || t.assignee_id === profile.id;

  return (
    <>
      <AutoRefresh intervalMs={20_000} />
      <Topbar
        subtitle={
          <Link href="/staff/tasks" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3" /> Tarefas
          </Link>
        }
        title={t.title}
      />

      <div className="grid gap-4 px-6 pt-6 md:grid-cols-[1fr_320px] md:px-10">
        {/* Main column ------------------------------------------------ */}
        <div className="space-y-4">
          <section className="rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <TaskCategoryIcon category={t.category} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-foreground/55">
                  <TaskCategoryLabel category={t.category} />
                  <span>·</span>
                  <span>Prioridade {t.priority}</span>
                </div>
                <h2 className="mt-1 font-display text-xl font-bold tracking-tight">
                  {t.title}
                </h2>
                {t.description ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/75">
                    {t.description}
                  </p>
                ) : null}
              </div>
              <TaskStatusPill status={t.status} />
            </div>
          </section>

          {stockItems.length > 0 ? (
            <StockCountForm
              items={stockItems}
              taskId={t.id}
              title="Reportar estoque"
              hint="Quanto sobrou de cada item depois desta tarefa?"
            />
          ) : null}

          <CommentThread
            taskId={t.id}
            currentUserId={profile.id}
            initial={(comments ?? []).map((c) => {
              const sender = Array.isArray((c as { sender?: unknown }).sender)
                ? ((c as { sender: { full_name?: string | null; email?: string | null }[] }).sender[0])
                : ((c as { sender: { full_name?: string | null; email?: string | null } | null }).sender);
              return {
                ...(c as StaffTaskComment),
                sender_name: sender?.full_name ?? sender?.email ?? "—",
              };
            })}
          />
        </div>

        {/* Sidebar column --------------------------------------------- */}
        <aside className="space-y-3">
          <div className="rounded-3xl border border-border/50 bg-card p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
              Detalhes
            </p>
            <dl className="mt-2 space-y-1.5 text-sm">
              <Row Icon={MapPin} label="Imóvel" value={propRel?.name ? `${propRel.name}${propRel.unit_code ? ` · ${propRel.unit_code}` : ""}` : "—"} />
              <Row Icon={Calendar} label="Prazo" value={t.due_at ? new Date(t.due_at).toLocaleString("pt-BR") : "—"} />
              <Row Icon={User} label="Responsável" value={assigneeRel?.full_name ?? assigneeRel?.email ?? "Sem responsável"} />
              <Row Icon={User} label="Criada por"  value={creatorRel?.full_name ?? creatorRel?.email ?? "—"} />
              {t.completed_at ? (
                <Row Icon={Calendar} label="Concluída em" value={new Date(t.completed_at).toLocaleString("pt-BR")} />
              ) : null}
            </dl>
          </div>

          {canEditStatus ? (
            <TaskActions
              taskId={t.id}
              currentStatus={t.status}
              canDelete={profile.role !== "host_staff"}
            />
          ) : (
            <div className="rounded-3xl border border-border/50 bg-card p-4 text-xs text-foreground/65">
              Apenas o responsável ou o anfitrião pode mudar o status desta tarefa.
            </div>
          )}
        </aside>
      </div>
    </>
  );
}

function Row({
  Icon,
  label,
  value,
}: {
  Icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-border/40 pb-1.5 last:border-0">
      <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-foreground/55">
        <Icon className="size-3" />
        {label}
      </span>
      <span className="text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}
