import { requireRole } from "@/lib/auth";
import { HostSidebar } from "@/components/app/host-sidebar";
import { initialOf } from "@/lib/format";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["host_admin", "host_staff", "super_admin"]);

  let subtitle = "Anfitrião";
  if (profile.host_id) {
    const supabase = await createSupabaseServerClient();
    const [{ count: propCount }] = await Promise.all([
      supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("host_id", profile.host_id),
    ]);
    subtitle = `${propCount ?? 0} ${propCount === 1 ? "imóvel" : "imóveis"}`;
  }

  return (
    <div className="flex min-h-svh bg-background">
      <HostSidebar
        user={{
          name: profile.full_name ?? "Anfitrião",
          subtitle,
          initial: initialOf(profile.full_name ?? profile.email),
        }}
      />
      <div className="flex-1 pb-12">{children}</div>
    </div>
  );
}
