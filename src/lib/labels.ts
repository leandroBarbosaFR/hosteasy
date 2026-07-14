import type { InventoryCategory, WorkerSpecialty } from "@/types/db";

export const SPECIALTY_LABELS: Record<WorkerSpecialty, string> = {
  cleaning: "Limpeza",
  maintenance: "Manutenção",
  painting: "Pintura",
  laundry: "Lavanderia",
  gardening: "Jardinagem",
  pool: "Piscina",
  general: "Geral",
};

export const INVENTORY_CATEGORY_LABELS: Record<InventoryCategory, string> = {
  amenities: "Amenities",
  cleaning_supplies: "Produtos de limpeza",
  linens: "Roupa de cama e banho",
  kitchen: "Cozinha",
  maintenance: "Manutenção",
  other: "Outros",
};
