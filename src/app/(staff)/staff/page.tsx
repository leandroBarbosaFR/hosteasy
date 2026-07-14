import Link from "next/link";
import { ListChecks, CalendarDots as CalendarDays, Clock, WarningCircle as AlertCircle, ArrowRight } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { requireStaffContext, listTasks } from "@/lib/data/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TaskStatusPill, TaskCategoryIcon } from "./_components";

export const metadata = { title: "Hoje · Hosteasy" };

export default async function StaffHomePage() {
  const { profile, hostId } = await requireStaffContext();
  const supabase = await createSupabaseServerClient();

  // Tasks assigned to me, due in next 48h or already overdue/in-progress.
  const tasks = await listTasks({
    hostId,
    userId: profile.id,
    scope: profile.role === "host_admin" || profile.role === "super_admin" ? "all" : "mine",
    statuses: ["pending", "in_progress", "blocked"],
  });

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const inTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data: upcomingCheckouts } = await supabase
    .from("reservations")
    .select("id, guest_name, check_out, property_id, properties(name, unit_code)")
    .eq("host_id", hostId)
    .gte("check_out", today)
    .lte("check_out", inTwoDays)
    .in("status", ["confirmed", "in_stay"])
    .order("check_out", { ascending: true });

  const overdueCount = tasks.filter(
    (t) => t.due_at && new Date(t.due_at) < now && t.status !== "done",
  ).length;
  const dueTodayCount = tasks.filter(
    (t) => t.due_at?.startsWith(today),
  ).length;

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <Topbar
        subtitle={`Olá, ${profile.full_name?.split(" ")[0] ?? "equipe"}`}
        title={
          tasks.length === 0
            ? "Sem tarefas pendentes"
            : `Você tem ${tasks.length} ${tasks.length === 1 ? "tarefa" : "tarefas"} ativas`
        }
      />

      <section className="grid gap-3 px-6 pt-6 sm:grid-cols-3 md:px-10">
        <Stat label="Em atraso"      value={overdueCount}  tone={overdueCount > 0 ? "warn" : "ok"} Icon={AlertCircle} />
        <Stat label="Pra hoje"       value={dueTodayCount} tone="info" Icon={Clock} />
        <Stat label="Check-outs 48h" value={upcomingCheckouts?.length ?? 0} tone="info" Icon={CalendarDays} />
      </section>

      <section className="px-6 pt-6 md:px-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Suas tarefas</h2>
          <Link
            href="/staff/tasks"
            className="text-xs font-medium text-foreground/60 hover:text-foreground"
          >
            Ver todas
          </Link>
        </div>
        {tasks.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={<ListChecks className="size-5" />}
              title="Tudo em dia"
              description="Quando o anfitrião atribuir uma nova tarefa, aparece aqui."
            />
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {tasks.slice(0, 6).map((t) => (
              <li key={t.id}>
                <Link
                  href={`/staff/tasks/${t.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  <TaskCategoryIcon category={t.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{t.title}</p>
                    <p className="truncate text-[11px] text-foreground/60">
                      {t.property_name ?? "Sem imóvel"}
                      {t.due_at
                        ? ` · ${new Date(t.due_at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}`
                        : ""}
                    </p>
                  </div>
                  <TaskStatusPill status={t.status} />
                  <ArrowRight className="size-3.5 text-foreground/30" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="px-6 pt-6 md:px-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Check-outs nas próximas 48h</h2>
          <Link
            href="/staff/bookings"
            className="text-xs font-medium text-foreground/60 hover:text-foreground"
          >
            Ver reservas
          </Link>
        </div>
        {!upcomingCheckouts || upcomingCheckouts.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-foreground/15 bg-white/40 px-4 py-4 text-center text-sm text-foreground/55">
            Nenhum check-out marcado pra 48h.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
            {upcomingCheckouts.map((r) => {
              const propRel = Array.isArray(r.properties) ? r.properties[0] : r.properties;
              return (
                <li key={r.id} className="flex items-center justify-between px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{r.guest_name}</p>
                    <p className="truncate text-[11px] text-foreground/60">
                      {(propRel as { name?: string } | null)?.name ?? "—"}
                      {(propRel as { unit_code?: string | null } | null)?.unit_code
                        ? ` · ${(propRel as { unit_code?: string }).unit_code}`
                        : ""}
                    </p>
                  </div>
                  <span className="text-[11px] text-foreground/65">
                    Sai {new Date(r.check_out).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  tone,
  Icon,
}: {
  label: string;
  value: number;
  tone: "ok" | "warn" | "info";
  Icon: typeof Clock;
}) {
  const colors =
    tone === "warn"
      ? "border-destructive/30 bg-destructive/5 text-destructive"
      : tone === "info"
        ? "border-border/50 bg-card"
        : "border-emerald-500/30 bg-emerald-500/5";
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${colors}`}>
      <div className="flex items-center gap-1.5">
        <Icon className="size-3.5" />
        <p className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
          {label}
        </p>
      </div>
      <p className="mt-1 font-display text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
