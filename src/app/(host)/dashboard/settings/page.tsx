import { Topbar } from "@/components/app/topbar";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Ajustes · Hosteasy" };

export default async function SettingsPage() {
  const { hostId, profile } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: members }, { data: templates }] = await Promise.all([
    supabase
      .from("host_members")
      .select("id, role, user_id, created_at, profiles:user_id(full_name, email)")
      .eq("host_id", hostId)
      .order("created_at", { ascending: true }),
    supabase
      .from("message_templates")
      .select("*")
      .eq("host_id", hostId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <Topbar subtitle="Ajustes" title="Ajustes da conta" />
      <div className="px-6 pt-6 md:px-10">
        <SettingsClient
          canManageTeam={profile.role !== "host_staff"}
          profile={profile}
          members={
            (members ?? []).map((m) => ({
              id: m.id,
              role: m.role,
              user_id: m.user_id,
              profiles: Array.isArray(m.profiles)
                ? (m.profiles[0] ?? null)
                : m.profiles,
            })) as Array<{
              id: string;
              role: "host_admin" | "host_staff";
              user_id: string;
              profiles: { full_name: string | null; email: string | null } | null;
            }>
          }
          templates={(templates ?? []) as never[]}
        />
      </div>
    </>
  );
}
