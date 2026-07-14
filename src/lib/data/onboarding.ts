import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { OnboardingStep } from "@/components/app/onboarding-checklist";

// What "fully set up" means for a host: property → iCal → tablet → team →
// auto-cleaning → extras → PIX. Mirrors the go-live checklist in /admin/beta,
// but host-facing.
export async function getOnboardingSteps(
  hostId: string,
): Promise<OnboardingStep[]> {
  const supabase = await createSupabaseServerClient();

  const [
    { count: propertyCount },
    { count: sourceCount },
    { count: pairedTabletCount },
    { count: memberCount },
    { count: autoCleanCount },
    { count: extraCount },
    { data: host },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId),
    supabase
      .from("reservation_sources")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .eq("is_active", true),
    supabase
      .from("tablets")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .not("property_id", "is", null),
    supabase
      .from("host_members")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId),
    supabase
      .from("properties")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .not("default_cleaner_id", "is", null),
    supabase
      .from("extras")
      .select("id", { count: "exact", head: true })
      .eq("host_id", hostId)
      .eq("active", true),
    supabase.from("hosts").select("pix_key").eq("id", hostId).maybeSingle(),
  ]);

  return [
    {
      key: "property",
      label: "Cadastre seu primeiro imóvel",
      description: "Nome, unidade e endereço.",
      href: "/dashboard/properties",
      done: (propertyCount ?? 0) > 0,
    },
    {
      key: "ical",
      label: "Conecte Airbnb/Booking",
      description: "Cole o link iCal do anúncio no imóvel.",
      href: "/dashboard/properties",
      done: (sourceCount ?? 0) > 0,
    },
    {
      key: "tablet",
      label: "Pareie um tablet",
      description: "Vincule o tablet ao imóvel.",
      href: "/dashboard/tablets",
      done: (pairedTabletCount ?? 0) > 0,
    },
    {
      key: "team",
      label: "Convide sua equipe",
      description: "Limpeza, manutenção e outros.",
      href: "/dashboard/settings",
      done: (memberCount ?? 0) > 1,
    },
    {
      key: "autoclean",
      label: "Ative a limpeza automática",
      description: "Defina quem limpa cada imóvel.",
      href: "/dashboard/properties",
      done: (autoCleanCount ?? 0) > 0,
    },
    {
      key: "extras",
      label: "Crie 3 extras",
      description: "Café, late check-out, transfer…",
      href: "/dashboard/extras",
      done: (extraCount ?? 0) >= 3,
    },
    {
      key: "pix",
      label: "Configure o PIX",
      description: "Receba pelos extras no tablet.",
      href: "/dashboard/settings",
      done: !!host?.pix_key,
    },
  ];
}
