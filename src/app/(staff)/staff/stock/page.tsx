import { Package } from "@phosphor-icons/react/ssr";
import { Topbar } from "@/components/app/topbar";
import { AutoRefresh } from "@/components/app/auto-refresh";
import { EmptyState } from "@/components/app/empty-state";
import { StockCountForm } from "@/components/app/stock-count-form";
import { requireStaffContext } from "@/lib/data/staff";
import { listInventoryItems } from "@/lib/data/inventory";

export const metadata = { title: "Estoque · Hosteasy" };

export default async function StaffStockPage() {
  const { hostId } = await requireStaffContext();
  const items = await listInventoryItems(hostId);

  // Group by property (host-wide items first) so the cleaner counts one
  // apartment at a time.
  const groups = new Map<string, typeof items>();
  for (const item of items) {
    const key = item.property_name ?? "Estoque geral";
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }

  return (
    <>
      <AutoRefresh intervalMs={30_000} />
      <Topbar subtitle="Estoque" title="Quanto sobrou?" />
      <p className="px-6 pt-2 text-xs text-foreground/55 md:px-10">
        Atualize as quantidades depois de cada limpeza. O anfitrião recebe
        alerta automático quando algo chega no mínimo.
      </p>

      <div className="space-y-4 px-6 pt-6 md:px-10">
        {items.length === 0 ? (
          <EmptyState
            icon={<Package className="size-5" />}
            title="Nenhum item cadastrado"
            description="O anfitrião ainda não cadastrou itens de estoque."
          />
        ) : (
          [...groups.entries()].map(([groupName, groupItems]) => (
            <StockCountForm
              key={groupName}
              items={groupItems}
              title={groupName}
              hint="Conte o que sobrou e salve item por item."
            />
          ))
        )}
      </div>
    </>
  );
}
