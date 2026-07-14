import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { InventoryItem, InventoryMovement } from "@/types/db";

export type InventoryItemWithProperty = InventoryItem & {
  property_name: string | null;
};

export async function listInventoryItems(
  hostId: string,
  opts?: { propertyId?: string; activeOnly?: boolean },
): Promise<InventoryItemWithProperty[]> {
  const supabase = await createSupabaseServerClient();
  let q = supabase
    .from("inventory_items")
    .select("*, properties(name, unit_code)")
    .eq("host_id", hostId)
    .order("name", { ascending: true });
  // Property scope includes host-wide items (property_id null) so a cleaner
  // in unit 102 also counts shared supplies.
  if (opts?.propertyId) {
    q = q.or(`property_id.eq.${opts.propertyId},property_id.is.null`);
  }
  if (opts?.activeOnly !== false) q = q.eq("active", true);

  const { data } = await q;
  return (data ?? []).map((row) => {
    const rel = Array.isArray(row.properties) ? row.properties[0] : row.properties;
    const prop = rel as { name?: string; unit_code?: string | null } | null;
    return {
      ...(row as InventoryItem),
      property_name: prop?.name
        ? `${prop.name}${prop.unit_code ? ` · ${prop.unit_code}` : ""}`
        : null,
    };
  });
}

export function lowStockItems<T extends InventoryItem>(items: T[]): T[] {
  return items.filter((i) => Number(i.current_qty) <= Number(i.min_qty));
}

export type MovementWithItem = InventoryMovement & {
  item_name: string;
  by_name: string | null;
};

export async function listRecentMovements(
  hostId: string,
  limit = 20,
): Promise<MovementWithItem[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inventory_movements")
    .select("*, inventory_items(name), by:created_by(full_name, email)")
    .eq("host_id", hostId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).map((row) => {
    const itemRel = Array.isArray(row.inventory_items)
      ? row.inventory_items[0]
      : row.inventory_items;
    const byRel = Array.isArray(row.by) ? row.by[0] : row.by;
    return {
      ...(row as InventoryMovement),
      item_name: (itemRel as { name?: string } | null)?.name ?? "Item",
      by_name:
        (byRel as { full_name?: string | null; email?: string | null } | null)
          ?.full_name ??
        (byRel as { email?: string | null } | null)?.email ??
        null,
    };
  });
}
