import Link from "next/link";
import { ArrowRight, Plus } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { requireStaffContext, listTasks } from "@/lib/data/staff";
import { TaskCategoryIcon, TaskStatusPill, TaskPriorityDot } from "../_components";
import { cn } from "@/lib/utils";

export const metadata = { title: "Tarefas · Hosteasy" };

type Filter = "all" | "pending" | "in_progress" | "done";

export default async function StaffTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: Filter }>;
}) {
  const { filter = "all" } = await searchParams;
  const { profile, hostId } = await requireStaffContext();

  const statuses: ("pending" | "in_progress" | "done" | "blocked" | "cancelled")[] | undefined =
    filter === "pending"
      ? ["pending", "blocked"]
      : filter === "in_progress"
        ? ["in_progress"]
        : filter === "done"
          ? ["done"]
          : undefined;

  const tasks = await listTasks({
    hostId,
    userId: profile.id,
    scope: profile.role === "host_staff" ? "mine" : "all",
    statuses,
  });

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <Topbar
        subtitle="Tarefas"
        title={profile.role === "host_staff" ? "Suas tarefas" : "Todas as tarefas"}
        actions={
          <Link
            href="/staff/tasks/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:shadow-md"
          >
            <Plus className="size-3.5" /> Nova tarefa
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 px-6 pt-6 md:px-10">
        {(
          [
            ["all", "Todas"],
            ["pending", "Pendentes"],
            ["in_progress", "Em andamento"],
            ["done", "Concluídas"],
          ] as const
        ).map(([key, label]) => {
          const active = filter === key;
          return (
            <Link
              key={key}
              href={key === "all" ? "/staff/tasks" : `/staff/tasks?filter=${key}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
                active
                  ? "bg-foreground/90 text-white"
                  : "border border-border/60 bg-card text-foreground/70 hover:bg-muted/50",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="px-6 pt-4 md:px-10">
        {tasks.length === 0 ? (
          <EmptyState
            title="Nenhuma tarefa neste filtro"
            description={profile.role === "host_staff" ? "Quando o anfitrião atribuir tarefas pra você, elas aparecem aqui." : "Crie uma tarefa nova ou ajuste o filtro."}
          />
        ) : (
          <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {tasks.map((t) => {
              const overdue =
                t.due_at &&
                t.status !== "done" &&
                t.status !== "cancelled" &&
                new Date(t.due_at) < new Date();
              return (
                <li key={t.id}>
                  <Link
                    href={`/staff/tasks/${t.id}`}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <TaskCategoryIcon category={t.category} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <TaskPriorityDot priority={t.priority} />
                        <p className="truncate text-sm font-semibold">{t.title}</p>
                      </div>
                      <p className="truncate text-[11px] text-foreground/60">
                        {t.property_name ?? "Sem imóvel"}
                        {t.due_at ? (
                          <>
                            {" · "}
                            <span className={overdue ? "font-semibold text-destructive" : ""}>
                              {new Date(t.due_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                              {overdue ? " (atrasada)" : ""}
                            </span>
                          </>
                        ) : null}
                        {profile.role !== "host_staff" && t.assignee_name ? ` · ${t.assignee_name}` : ""}
                      </p>
                    </div>
                    <TaskStatusPill status={t.status} />
                    <ArrowRight className="size-3.5 text-foreground/30" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
