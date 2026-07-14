"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House as Home, Sparkle as Sparkles, BookOpen, Globe as Globe2, ChatCircle as MessageCircle, Gear as Settings } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

export function TabletSidebar({ tabletCode }: { tabletCode: string }) {
  const pathname = usePathname();
  const base = `/tablet/${tabletCode}`;
  const items = [
    { href: `${base}`,          label: "Início",  Icon: Home },
    { href: `${base}/extras`,   label: "Extras",  Icon: Sparkles },
    { href: `${base}/guides`,   label: "Guia",    Icon: BookOpen },
    { href: `${base}/web`,      label: "Web",     Icon: Globe2 },
    { href: `${base}/contact`,  label: "Contato", Icon: MessageCircle },
    { href: `${base}/settings`, label: "Ajustes", Icon: Settings },
  ];

  return (
    <>
      {/* Phone / portrait — floating bottom pill */}
      <nav
        aria-label="Navegação do tablet (rodapé)"
        className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around gap-1 rounded-full border border-white/40 bg-white/70 px-2 py-1.5 shadow-xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 md:hidden"
      >
        {items.map(({ href, label, Icon }) => {
          const active =
            href === base ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-1.5 text-[11px] transition-colors",
                active
                  ? "bg-foreground/90 text-white"
                  : "text-foreground/70 hover:bg-white/60",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Tablet landscape / desktop — left sidebar */}
      <aside
        aria-label="Navegação do tablet"
        className="fixed inset-y-4 left-4 z-30 hidden w-20 flex-col items-stretch gap-1 rounded-3xl border border-white/40 bg-white/70 p-2 shadow-xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150 md:flex lg:w-48"
      >
        {items.map(({ href, label, Icon }) => {
          const active =
            href === base ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition-colors lg:justify-start",
                "justify-center",
                active
                  ? "bg-foreground/90 text-white"
                  : "text-foreground/70 hover:bg-white/60",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="hidden lg:inline">{label}</span>
            </Link>
          );
        })}
      </aside>
    </>
  );
}
