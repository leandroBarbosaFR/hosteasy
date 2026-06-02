import { NextResponse } from "next/server";

// Per-tablet PWA manifest. Each tablet installs as its own "app" so the
// home-screen launcher opens directly to /tablet/<that code> in standalone
// mode. Browsers cache by URL so re-installing always picks up changes.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ tabletCode: string }> },
) {
  const { tabletCode } = await params;
  const startUrl = `/tablet/${tabletCode}`;

  return NextResponse.json(
    {
      name: `Hosteasy · ${tabletCode}`,
      short_name: "Hosteasy",
      description: "Painel do hóspede",
      start_url: startUrl,
      scope: startUrl,
      display: "fullscreen",
      display_override: ["fullscreen", "standalone", "minimal-ui"],
      orientation: "any",
      background_color: "#FAF7F4",
      theme_color: "#1f1916",
      lang: "pt-BR",
      icons: [
        {
          src: "/hosteasyapicon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any",
        },
        {
          src: "/hosteasyappletter.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "maskable",
        },
      ],
      categories: ["travel", "lifestyle"],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Content-Type": "application/manifest+json; charset=utf-8",
      },
    },
  );
}
