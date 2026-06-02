import { Plus } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { PropertyCard } from "@/components/app/property-card";
import { EmptyState } from "@/components/app/empty-state";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { NewPropertyDialog } from "./new-property-dialog";
import type { Property, Tablet } from "@/types/db";

export const metadata = { title: "Imóveis · Hosteasy" };

export default async function PropertiesPage() {
  const { hostId } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: properties }, { data: tablets }] = await Promise.all([
    supabase.from("properties").select("*").eq("host_id", hostId).order("name"),
    supabase.from("tablets").select("*").eq("host_id", hostId),
  ]);

  const tabletByProperty = new Map<string, Tablet>();
  (tablets ?? []).forEach((t) => {
    if (t.property_id) tabletByProperty.set(t.property_id, t as Tablet);
  });

  return (
    <>
      <Topbar
        subtitle="Imóveis"
        title="Seus imóveis"
        actions={
          <NewPropertyDialog
            trigger={
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md">
                <Plus className="size-3.5" /> Novo imóvel
              </span>
            }
          />
        }
      />

      <div className="px-6 pt-6 md:px-10">
        {properties && properties.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(properties as Property[]).map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                tablet={tabletByProperty.get(p.id)}
                href={`/dashboard/properties/${p.id}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Sem imóveis cadastrados"
            description="Adicione seu primeiro imóvel para emparelhar com um tablet."
          />
        )}
      </div>
    </>
  );
}
