import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Topbar } from "@/components/app/topbar";
import { requireHostContext } from "@/lib/data/host";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { TabletDetailClient } from "./tablet-detail-client";
import type { Property, Tablet } from "@/types/db";

export default async function HostTabletDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { hostId, profile } = await requireHostContext();
  const supabase = await createSupabaseServerClient();

  const [{ data: tablet }, { data: properties }] = await Promise.all([
    supabase
      .from("tablets")
      .select("*")
      .eq("id", id)
      .eq("host_id", hostId)
      .maybeSingle(),
    supabase
      .from("properties")
      .select("id, name, unit_code")
      .eq("host_id", hostId)
      .order("name"),
  ]);

  if (!tablet) notFound();

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const installUrl = `${siteUrl}/tablet/${(tablet as Tablet).tablet_code}`;

  return (
    <>
      <Topbar
        subtitle={
          <Link
            href="/dashboard/tablets"
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <ArrowLeft className="size-3" /> Tablets
          </Link>
        }
        title={(tablet as Tablet).tablet_code}
      />

      <div className="px-6 pt-6 md:px-10">
        <TabletDetailClient
          tablet={tablet as Tablet}
          properties={(properties ?? []) as Property[]}
          installUrl={installUrl}
          canDelete={profile.role !== "host_staff"}
        />
      </div>
    </>
  );
}
