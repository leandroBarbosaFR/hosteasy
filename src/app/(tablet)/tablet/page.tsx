import Link from "next/link";
import { Tablet as TabletIcon, ArrowRight } from "lucide-react";

export const metadata = { title: "Hosteasy · Tablet" };

export default function TabletIndexPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-gradient-to-b from-[#FAF7F4] via-[#F4ECE3] to-[#F5DDD0] px-6 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/60 text-primary shadow-sm backdrop-blur-xl">
          <TabletIcon className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-3xl font-medium tracking-tight md:text-4xl">
          Tablet do hóspede
        </h1>
        <p className="mt-3 text-sm text-foreground/65">
          Cada tablet tem um código único. Use o código impresso no seu
          equipamento ou escaneie o QR fornecido pelo anfitrião.
        </p>

        <p className="mt-6 text-[11px] uppercase tracking-wider text-foreground/55">
          Exemplo
        </p>
        <code className="mt-1 inline-block rounded-full bg-white/70 px-3 py-1.5 font-mono text-xs text-foreground/70 backdrop-blur">
          /tablet/TAB-102
        </code>

        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-foreground/90 px-5 py-2.5 text-sm font-semibold text-white hover:bg-foreground"
          >
            Entrar como anfitrião
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/"
            className="text-xs font-medium text-foreground/60 hover:text-foreground"
          >
            Voltar para o site
          </Link>
        </div>
      </div>
    </main>
  );
}
