import type { Metadata, Viewport } from "next";
import { TabletSidebar } from "@/components/app/tablet-sidebar";
import { TabletHeader } from "@/components/app/tablet-header";
import { TabletKioskGate } from "@/components/app/tablet-kiosk-gate";
import { TabletHeartbeat } from "@/components/app/tablet-heartbeat";
import { resolveTabletContext } from "@/lib/data/tablet";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tabletCode: string }>;
}): Promise<Metadata> {
  const { tabletCode } = await params;
  return {
    title: `Hosteasy · ${tabletCode}`,
    manifest: `/tablet/${tabletCode}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      title: `Hosteasy · ${tabletCode}`,
      statusBarStyle: "black-translucent",
    },
    other: {
      "mobile-web-app-capable": "yes",
      "apple-mobile-web-app-capable": "yes",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#1f1916",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default async function TabletLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tabletCode: string }>;
}) {
  const { tabletCode } = await params;
  // Resolve early so an invalid code 404s before any child renders.
  const ctx = await resolveTabletContext(tabletCode);

  return (
    <div className="tablet-shell relative min-h-svh overflow-hidden bg-gradient-to-b from-[#FAF7F4] via-[#F4ECE3] to-[#F5DDD0] pb-28 md:pb-12 md:pl-28 lg:pl-56">
      <TabletHeader
        tabletCode={tabletCode}
        propertyName={ctx.property?.name ?? null}
      />
      {children}
      <TabletSidebar tabletCode={tabletCode} />
      <TabletKioskGate tabletCode={tabletCode} />
      <TabletHeartbeat tabletCode={tabletCode} />
    </div>
  );
}
