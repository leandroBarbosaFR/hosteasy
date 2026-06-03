"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const lateCheckoutSchema = z.object({
  property_id: z.string().uuid(),
  late_checkout_enabled: z.string().optional(),
  late_checkout_price: z.coerce.number().min(0).max(99999).optional(),
  late_checkout_until: z.string().optional(),
});

const reviewLinksSchema = z.object({
  property_id: z.string().uuid(),
  review_link_airbnb: z.string().url().optional().or(z.literal("")),
  review_link_booking: z.string().url().optional().or(z.literal("")),
  review_link_google: z.string().url().optional().or(z.literal("")),
});

export async function updatePropertyROISettings(formData: FormData) {
  const { hostId, profile } = await requireHostContext();
  if (profile.role === "host_staff") {
    return { ok: false, error: "Sem permissão." };
  }
  const section = formData.get("section") as string;

  const supabase = await createSupabaseServerClient();

  if (section === "late_checkout") {
    const parsed = lateCheckoutSchema.safeParse({
      property_id: formData.get("property_id"),
      late_checkout_enabled: formData.get("late_checkout_enabled") || undefined,
      late_checkout_price: formData.get("late_checkout_price") || undefined,
      late_checkout_until: formData.get("late_checkout_until") || undefined,
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Inválido" };
    }
    const { error } = await supabase
      .from("properties")
      .update({
        late_checkout_enabled: !!parsed.data.late_checkout_enabled,
        late_checkout_price: parsed.data.late_checkout_price ?? null,
        late_checkout_until: parsed.data.late_checkout_until ?? null,
      })
      .eq("id", parsed.data.property_id)
      .eq("host_id", hostId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/dashboard/properties/${parsed.data.property_id}`);
    return { ok: true };
  }

  if (section === "review_links") {
    const parsed = reviewLinksSchema.safeParse({
      property_id: formData.get("property_id"),
      review_link_airbnb: formData.get("review_link_airbnb") ?? "",
      review_link_booking: formData.get("review_link_booking") ?? "",
      review_link_google: formData.get("review_link_google") ?? "",
    });
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Link inválido" };
    }
    const { error } = await supabase
      .from("properties")
      .update({
        review_link_airbnb: parsed.data.review_link_airbnb || null,
        review_link_booking: parsed.data.review_link_booking || null,
        review_link_google: parsed.data.review_link_google || null,
      })
      .eq("id", parsed.data.property_id)
      .eq("host_id", hostId);
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/dashboard/properties/${parsed.data.property_id}`);
    return { ok: true };
  }

  return { ok: false, error: "Seção desconhecida." };
}
