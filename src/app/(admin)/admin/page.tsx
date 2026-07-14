import Link from "next/link";
import { Topbar } from "@/components/app/topbar";
import { StatCard } from "@/components/app/stat-card";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata = { title: "Super admin · Hosteasy" };

export default async function AdminHomePage() {
  const supabase = await createSupabaseServerClient();
  const [
    { count: hostsCount },
    { count: propertiesCount },
    { count: tabletsCount },
    { count: reservationsCount },
  ] = await Promise.all([
    supabase.from("hosts").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("tablets").select("id", { count: "exact", head: true }),
    supabase
      .from("reservations")
      .select("id", { count: "exact", head: true })
      .in("status", ["confirmed", "in_stay"]),
  ]);

  return (
    <>
      <Topbar subtitle="Super admin" title="Visão geral da plataforma" />
      <section className="grid gap-3 px-6 pt-6 sm:grid-cols-2 md:px-10 lg:grid-cols-4">
        <StatCard label="Anfitriões"          value={String(hostsCount ?? 0)} />
        <StatCard label="Imóveis"             value={String(propertiesCount ?? 0)} />
        <StatCard label="Tablets"             value={String(tabletsCount ?? 0)} />
        <StatCard label="Reservas ativas"     value={String(reservationsCount ?? 0)} />
      </section>
      <section className="px-6 pt-6 md:px-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Ações rápidas</h2>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickLink href="/admin/hosts" title="Gerenciar anfitriões" desc="Listar e criar contas." />
          <QuickLink href="/admin/properties" title="Listar imóveis" desc="Todos os imóveis cadastrados." />
          <QuickLink href="/admin/tablets" title="Tablets" desc="Status, bateria, última conexão." />
        </div>
      </section>
    </>
  );
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="font-display text-base font-bold tracking-tight">{title}</h3>
      <p className="mt-1 text-sm text-foreground/65">{desc}</p>
    </Link>
  );
}
