import type { Metadata, Viewport } from "next";
import { TabletSidebar } from "@/components/app/tablet-sidebar";
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
  await resolveTabletContext(tabletCode);

  return (
    <div className="tablet-shell relative min-h-svh overflow-hidden bg-gradient-to-b from-[#FAF7F4] via-[#F4ECE3] to-[#F5DDD0] pb-28">
      {children}
      <TabletSidebar tabletCode={tabletCode} />
    </div>
  );
}
