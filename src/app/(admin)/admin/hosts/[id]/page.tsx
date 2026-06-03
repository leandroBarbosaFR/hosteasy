import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { StatCard } from "@/components/app/stat-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { PropertyCard } from "@/components/app/property-card";
import { HostBetaToggle } from "./host-beta-toggle";
import type { Tablet } from "@/types/db";

export default async function AdminHostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: host }, { data: properties }, { data: tablets }, { data: members }] = await Promise.all([
    supabase.from("hosts").select("*, owner:owner_id(full_name, email)").eq("id", id).maybeSingle(),
    supabase.from("properties").select("*").eq("host_id", id),
    supabase.from("tablets").select("*").eq("host_id", id),
    supabase
      .from("host_members")
      .select("id, role, profiles:user_id(full_name, email)")
      .eq("host_id", id),
  ]);

  if (!host) notFound();

  const tabletByProperty = new Map<string, Tablet>();
  (tablets ?? []).forEach((t) => {
    if (t.property_id) tabletByProperty.set(t.property_id, t as Tablet);
  });

  return (
    <>
      <Topbar
        subtitle={
          <Link href="/admin/hosts" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="size-3" /> Anfitriões
          </Link>
        }
        title={host.name}
      />

      <section className="grid gap-3 px-6 pt-6 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        <StatCard label="Imóveis" value={String(properties?.length ?? 0)} />
        <StatCard label="Tablets" value={String(tablets?.length ?? 0)} />
        <StatCard label="Time"    value={String((members?.length ?? 0))} />
        <StatCard label="Plano"   value={host.plan} />
      </section>

      <section className="px-6 pt-6 md:px-10">
        <HostBetaToggle hostId={host.id} initial={host.beta_test ?? false} />
      </section>

      <section className="px-6 pt-6 md:px-10">
        <h2 className="mb-2 text-sm font-semibold">Imóveis</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(properties ?? []).map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              tablet={tabletByProperty.get(p.id)}
            />
          ))}
        </div>
      </section>

      <section className="px-6 pt-6 md:px-10">
        <h2 className="mb-2 text-sm font-semibold">Time</h2>
        <ul className="divide-y divide-border/60 rounded-2xl border border-border/50 bg-card shadow-sm">
          {(members ?? []).map((m) => (
            <li key={m.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold">
                  {(m.profiles as { full_name?: string | null; email?: string | null } | null)?.full_name ??
                    (m.profiles as { email?: string | null } | null)?.email}
                </p>
                <p className="text-[11px] text-foreground/55">
                  {(m.profiles as { email?: string | null } | null)?.email}
                </p>
              </div>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                {m.role}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
