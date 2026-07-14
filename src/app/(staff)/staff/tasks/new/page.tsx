import { Topbar } from "@/components/app/topbar";
import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import { requireStaffContext } from "@/lib/data/staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewTaskForm } from "./new-task-form";

export const metadata = { title: "Nova tarefa · Hosteasy" };

export default async function NewTaskPage() {
  const { hostId, profile } = await requireStaffContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: properties }, { data: members }] = await Promise.all([
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
    supabase
      .from("host_members")
      .select("user_id, role, profiles:user_id(full_name, email)")
      .eq("host_id", hostId)
      .order("created_at"),
  ]);

  const assignableMembers = (members ?? []).map((m) => {
    const p = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return {
      id: m.user_id as string,
      name: (p as { full_name?: string | null } | null)?.full_name ?? "—",
      email: (p as { email?: string | null } | null)?.email ?? "",
    };
  });

  return (
    <>
      <Topbar
        subtitle={
          <Link href="/staff/tasks" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3" /> Tarefas
          </Link>
        }
        title="Nova tarefa"
      />
      <div className="px-6 pt-6 md:px-10">
        <NewTaskForm
          properties={properties ?? []}
          members={assignableMembers}
          currentUserId={profile.id}
          canAssignOthers={profile.role !== "host_staff"}
        />
      </div>
    </>
  );
}
