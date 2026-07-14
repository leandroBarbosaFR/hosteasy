import { Topbar } from "@/components/app/topbar";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { SettingsClient } from "./settings-client";

export const metadata = { title: "Ajustes · Hosteasy" };

export default async function SettingsPage() {
  const { hostId, profile } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: members }, { data: templates }, { data: host }] =
    await Promise.all([
      supabase
        .from("host_members")
        .select(
          "id, role, specialty, user_id, created_at, profiles:user_id(full_name, email)",
        )
        .eq("host_id", hostId)
        .order("created_at", { ascending: true }),
      supabase
        .from("message_templates")
        .select("*")
        .eq("host_id", hostId)
        .order("created_at", { ascending: false }),
      supabase
        .from("hosts")
        .select(
          "pix_key, pix_instructions, whatsapp_number, notify_email, notify_whatsapp",
        )
        .eq("id", hostId)
        .maybeSingle(),
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
              specialty: m.specialty ?? "general",
              user_id: m.user_id,
              profiles: Array.isArray(m.profiles)
                ? (m.profiles[0] ?? null)
                : m.profiles,
            })) as Array<{
              id: string;
              role: "host_admin" | "host_staff";
              specialty: import("@/types/db").WorkerSpecialty;
              user_id: string;
              profiles: { full_name: string | null; email: string | null } | null;
            }>
          }
          templates={(templates ?? []) as never[]}
          pix={{
            pix_key: host?.pix_key ?? null,
            pix_instructions: host?.pix_instructions ?? null,
          }}
          notify={{
            whatsapp_number: host?.whatsapp_number ?? null,
            notify_email: host?.notify_email ?? true,
            notify_whatsapp: host?.notify_whatsapp ?? true,
          }}
        />
      </div>
    </>
  );
}
