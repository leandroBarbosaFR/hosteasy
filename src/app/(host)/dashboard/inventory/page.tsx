import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { listInventoryItems, listRecentMovements } from "@/lib/data/inventory";
import { InventoryClient } from "./inventory-client";

export const metadata = { title: "Estoque · Hosteasy" };

export default async function InventoryPage() {
  const { hostId, profile } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [items, movements, { data: properties }] = await Promise.all([
    listInventoryItems(hostId, { activeOnly: false }),
    listRecentMovements(hostId, 20),
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
  ]);

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <Topbar
        subtitle="Estoque"
        title="Controle de estoque"
      />
      <p className="px-6 pt-2 text-xs text-foreground/55 md:px-10">
        A equipe reporta o que sobrou a cada limpeza; você recebe alerta quando
        um item chega no mínimo.
      </p>
      <div className="px-6 pt-6 md:px-10">
        <InventoryClient
          items={items}
          movements={movements}
          properties={properties ?? []}
          canManage={profile.role !== "host_staff"}
        />
      </div>
    </>
  );
}
