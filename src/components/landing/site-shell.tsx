import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/recursos", label: "Recursos" },
  { href: "/integracoes", label: "Integrações" },
  { href: "/#precos", label: "Preços" },
  { href: "/para-quem-e", label: "Para quem é" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-4 z-40 w-full px-4 md:top-6">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between rounded-full bg-background/70 px-4 pl-5 shadow-[0_1px_2px_rgba(31,25,22,0.04)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-background/50 md:h-16 md:px-6 md:pl-7">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hosteasyapicon.svg"
            alt="hosteasy"
            className="h-7 w-auto md:hidden"
            draggable={false}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/host-app-logo.svg"
            alt="hosteasy"
            className="hidden h-6 w-auto md:block"
            draggable={false}
          />
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-foreground/80 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/entrar"
            className="hidden text-sm font-medium text-foreground/80 transition-colors hover:text-foreground md:inline"
          >
            Entrar
          </Link>
          <Link
            href="/contato"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-9 rounded-full border-0 bg-clip-border px-4 text-sm font-semibold transition-[box-shadow] duration-200 hover:shadow-[5px_5px_0_0_#1f1916] md:h-10 md:px-5"
            )}
          >
            Agendar demo
          </Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/50 bg-background/60 py-12 text-sm text-foreground/60">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/host-app-logo.svg"
              alt="hosteasy"
              className="h-6 w-auto"
              draggable={false}
            />
            <p className="mt-3 max-w-xs text-xs leading-relaxed text-foreground/55">
              Tablets com IA para anfitriões de aluguel de temporada.
              Florianópolis, SC.
            </p>
          </div>

          <FooterCol
            title="Produto"
            links={[
              { href: "/recursos", label: "Recursos" },
              { href: "/integracoes", label: "Integrações" },
              { href: "/#precos", label: "Preços" },
              { href: "/para-quem-e", label: "Para quem é" },
            ]}
          />

          <FooterCol
            title="Empresa"
            links={[
              { href: "/contato", label: "Contato" },
              { href: "/contato", label: "Suporte" },
              { href: "/privacidade", label: "Privacidade" },
              { href: "/termos", label: "Termos" },
            ]}
          />

          <FooterCol
            title="Fale com a gente"
            links={[
              {
                href: "https://wa.me/5548991958826?text=Ol%C3%A1%2C%20quero%20saber%20mais%20sobre%20o%20Hosteasy!",
                label: "WhatsApp",
              },
              { href: "mailto:leobarbosacontact@gmail.com", label: "E-mail" },
              { href: "/contato", label: "Agendar demo" },
            ]}
          />
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 text-xs text-foreground/50 md:flex-row md:items-center">
          <p>
            © {new Date().getFullYear()} HostEasy · Florianópolis, SC ·
            Todos os direitos reservados.
          </p>
          <p>Feito com café no Campeche.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/50">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-foreground/70 transition-colors hover:text-foreground"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
