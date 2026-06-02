"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  BookOpen,
  Globe2,
  MessageCircle,
  Settings,
} from "lucide-react";
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
    <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around gap-1 rounded-full border border-white/40 bg-white/70 px-2 py-1.5 shadow-xl shadow-black/10 backdrop-blur-2xl backdrop-saturate-150">
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
  );
}
