"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireStaffContext } from "@/lib/data/staff";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { notifyHostAdmins } from "@/lib/notify";

const INVENTORY_PATHS = ["/dashboard/inventory", "/staff/stock"];

function revalidateInventory(taskId?: string | null) {
  for (const p of INVENTORY_PATHS) revalidatePath(p);
  if (taskId) revalidatePath(`/staff/tasks/${taskId}`);
}

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  property_id: z.string().uuid().optional().or(z.literal("")),
  name: z.string().min(2).max(80),
  category: z.enum([
    "amenities",
    "cleaning_supplies",
    "linens",
    "kitchen",
    "maintenance",
    "other",
  ]),
  unit: z.string().min(1).max(16),
  current_qty: z.coerce.number().min(0).max(999_999),
  min_qty: z.coerce.number().min(0).max(999_999),
  notes: z.string().max(500).optional().or(z.literal("")),
  active: z.string().optional(),
});

export async function saveInventoryItem(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const parsed = itemSchema.safeParse({
    id: formData.get("id") || undefined,
    property_id: formData.get("property_id") ?? "",
    name: formData.get("name"),
    category: formData.get("category"),
    unit: formData.get("unit") || "un",
    current_qty: formData.get("current_qty") ?? 0,
    min_qty: formData.get("min_qty") ?? 0,
    notes: formData.get("notes") ?? "",
    active: formData.get("active") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }

  const supabase = await createSupabaseServerClient();
  const payload = {
    host_id: hostId,
    property_id: parsed.data.property_id || null,
    name: parsed.data.name,
    category: parsed.data.category,
    unit: parsed.data.unit,
    min_qty: parsed.data.min_qty,
    notes: parsed.data.notes || null,
    active: !!parsed.data.active,
  };

  if (parsed.data.id) {
    // current_qty changes only through movements so the log stays truthful.
    const { error } = await supabase
      .from("inventory_items")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("host_id", hostId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await supabase
      .from("inventory_items")
      .insert({ ...payload, current_qty: parsed.data.current_qty });
    if (error) return { ok: false, error: error.message };
  }

  revalidateInventory();
  return { ok: true };
}

export async function deleteInventoryItem(id: string) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id)
    .eq("host_id", hostId);
  if (error) return { ok: false, error: error.message };
  revalidateInventory();
  return { ok: true };
}

// One tap on the low-stock banner: turn everything at/below minimum into a
// `supplies` task with the shopping list in the description.
export async function createShoppingListTask() {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false as const, error: "Sem permissão." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: items } = await supabase
    .from("inventory_items")
    .select("name, unit, current_qty, min_qty, properties(name, unit_code)")
    .eq("host_id", hostId)
    .eq("active", true);

  const low = (items ?? []).filter(
    (i) => Number(i.current_qty) <= Number(i.min_qty),
  );
  if (low.length === 0) {
    return { ok: false as const, error: "Nenhum item abaixo do mínimo." };
  }

  const lines = low.map((i) => {
    const rel = Array.isArray(i.properties) ? i.properties[0] : i.properties;
    const prop = rel as { name?: string; unit_code?: string | null } | null;
    const where = prop?.name
      ? ` (${prop.name}${prop.unit_code ? ` · ${prop.unit_code}` : ""})`
      : "";
    const need = Math.max(1, Math.ceil(Number(i.min_qty) * 2 - Number(i.current_qty)));
    return `• ${i.name}${where}: restam ${Number(i.current_qty)} ${i.unit}, comprar ~${need} ${i.unit}`;
  });

  const { data: task, error } = await supabase
    .from("staff_tasks")
    .insert({
      host_id: hostId,
      created_by_id: profile.id,
      title: `Lista de compras — ${low.length} ${low.length === 1 ? "item" : "itens"}`,
      description: `Itens no mínimo ou abaixo:\n\n${lines.join("\n")}`,
      category: "supplies",
      status: "pending",
      priority: "normal",
    })
    .select("id")
    .single();
  if (error || !task) return { ok: false as const, error: error?.message ?? "Erro" };

  revalidatePath("/dashboard/inventory");
  revalidatePath("/staff/tasks");
  return { ok: true as const, id: task.id };
}

const movementSchema = z.object({
  item_id: z.string().uuid(),
  mode: z.enum(["restock", "consumption", "count", "adjustment"]),
  amount: z.coerce.number().min(-999_999).max(999_999),
  note: z.string().max(300).optional().or(z.literal("")),
  task_id: z.string().uuid().optional().or(z.literal("")),
});

// One entry point for every stock change:
//   restock     → +amount        (host received supplies)
//   consumption → -amount        (used during a stay/clean)
//   count       → set to amount  (cleaner reports what's left)
//   adjustment  → signed amount  (corrections)
// Crossing the minimum threshold notifies the host admins.
export async function recordInventoryMovement(input: {
  item_id: string;
  mode: "restock" | "consumption" | "count" | "adjustment";
  amount: number;
  note?: string;
  task_id?: string;
}) {
  const { profile, hostId } = await requireStaffContext();
  const parsed = movementSchema.safeParse({
    item_id: input.item_id,
    mode: input.mode,
    amount: input.amount,
    note: input.note ?? "",
    task_id: input.task_id ?? "",
  });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Inválido" };
  }
  if (parsed.data.mode !== "adjustment" && parsed.data.amount < 0) {
    return { ok: false as const, error: "Quantidade não pode ser negativa." };
  }

  const supabase = await createSupabaseServerClient();
  const { data: item } = await supabase
    .from("inventory_items")
    .select("id, host_id, name, unit, current_qty, min_qty")
    .eq("id", parsed.data.item_id)
    .eq("host_id", hostId)
    .maybeSingle();
  if (!item) return { ok: false as const, error: "Item não encontrado." };

  const prevQty = Number(item.current_qty);
  const delta =
    parsed.data.mode === "count"
      ? parsed.data.amount - prevQty
      : parsed.data.mode === "consumption"
        ? -parsed.data.amount
        : parsed.data.amount;
  if (delta === 0 && parsed.data.mode !== "count") {
    return { ok: true as const, qty: prevQty };
  }

  const { data: movement, error } = await supabase
    .from("inventory_movements")
    .insert({
      item_id: item.id,
      host_id: hostId,
      delta,
      reason: parsed.data.mode,
      task_id: parsed.data.task_id || null,
      created_by: profile.id,
      note: parsed.data.note || null,
    })
    .select("qty_after")
    .single();
  if (error || !movement) {
    return { ok: false as const, error: error?.message ?? "Erro" };
  }

  const newQty = Number(movement.qty_after);
  const min = Number(item.min_qty);
  if (newQty <= min && prevQty > min) {
    await notifyHostAdmins({
      hostId,
      type: "low_stock",
      title: `Estoque baixo: ${item.name}`,
      body: `Restam ${newQty} ${item.unit} (mínimo ${min}). Reportado por ${profile.full_name ?? "equipe"}.`,
      entityType: "inventory_item",
      entityId: item.id,
      actionPath: "/dashboard/inventory",
    });
  }

  revalidateInventory(parsed.data.task_id || null);
  return { ok: true as const, qty: newQty };
}
