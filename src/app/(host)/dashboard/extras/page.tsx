import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ExtrasClient } from "./extras-client";
import type { Extra } from "@/types/db";

export const metadata = { title: "Extras · Hosteasy" };

export default async function HostExtrasPage() {
  const { hostId, profile } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: extras }, { data: orders }, { data: properties }] = await Promise.all([
    supabase
      .from("extras")
      .select("*")
      .eq("host_id", hostId)
      .order("category"),
    supabase
      .from("extra_orders")
      .select(
        "id, total, status, created_at, extras(title, category), reservations(guest_name, properties(name, unit_code))",
      )
      .eq("host_id", hostId)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
  ]);

  const monthRevenue = (orders ?? [])
    .filter((o) => o.status === "paid" || o.status === "delivered")
    .filter(
      (o) =>
        new Date(o.created_at).getMonth() === new Date().getMonth() &&
        new Date(o.created_at).getFullYear() === new Date().getFullYear(),
    )
    .reduce((sum, o) => sum + Number(o.total ?? 0), 0);

  return (
    <>
      <AutoRefresh intervalMs={20_000} />
      <Topbar
        subtitle="Extras"
        title="Vender mais em cada estadia"
      />

      <div className="px-6 pt-6 md:px-10">
        <ExtrasClient
          extras={(extras ?? []) as Extra[]}
          orders={(orders ?? []).map((raw) => {
            const o = raw as unknown as {
              id: string;
              total: number;
              status: string;
              created_at: string;
              extras:
                | { title?: string; category?: string }
                | { title?: string; category?: string }[]
                | null;
              reservations:
                | { guest_name?: string; properties?: unknown }
                | { guest_name?: string; properties?: unknown }[]
                | null;
            };
            const extraRel = Array.isArray(o.extras) ? o.extras[0] : o.extras;
            const resRel = Array.isArray(o.reservations) ? o.reservations[0] : o.reservations;
            return {
              id: o.id,
              total: Number(o.total ?? 0),
              status: o.status,
              created_at: o.created_at,
              extra_title: extraRel?.title ?? "",
              extra_category: extraRel?.category ?? "custom",
              guest_name: resRel?.guest_name ?? "—",
              property_name: extractPropertyName(resRel?.properties ?? null),
            };
          })}
          properties={properties ?? []}
          monthRevenue={monthRevenue}
          canManage={profile.role !== "host_staff"}
        />
      </div>
    </>
  );
}

function extractPropertyName(rel: unknown): string {
  if (!rel) return "";
  if (Array.isArray(rel)) {
    return (rel[0] as { name?: string })?.name ?? "";
  }
  return (rel as { name?: string }).name ?? "";
}
