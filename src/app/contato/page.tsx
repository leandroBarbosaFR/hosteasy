import Link from "next/link";
import { ArrowRight, ChatCircle as MessageCircle, Envelope as Mail, MapPin, Calendar } from "@phosphor-icons/react/ssr";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";
import { CONTACT_EMAIL, whatsappLink } from "@/lib/site";

const CHANNELS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    desc: "Resposta em ~10 min, em horário comercial.",
    cta: "Abrir conversa",
    href: whatsappLink("Olá, quero saber mais sobre o Hosteasy!"),
    primary: true,
  },
  {
    icon: Calendar,
    title: "Agendar demo",
    desc: "15 minutos comigo, com painel real rodando.",
    cta: "Marcar 15 min",
    href: "/demo",
  },
  {
    icon: Mail,
    title: "E-mail",
    desc: "Pra coisas mais longas ou propostas.",
    cta: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
];

export default function ContatoPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Channels />
      </main>
      <SiteFooter />
    </>
  );
}

function Hero() {
  return (
    <section className="bg-background py-20 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
          <span className="size-1.5 rounded-full bg-primary" />
          Contato
        </span>
        <h1 className="mt-5 text-balance font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Fala com a gente —{" "}
          <span className="text-primary">sem pitch</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
          Pergunta o que você quiser. Resposta de gente, na hora.
        </p>
      </div>
    </section>
  );
}

function Channels() {
  return (
    <section className="bg-background py-14 md:py-[60px]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {CHANNELS.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className={`group flex flex-col rounded-3xl border p-7 transition-shadow hover:shadow-md ${
                c.primary
                  ? "border-foreground/15 bg-card"
                  : "border-border/60 bg-card"
              }`}
            >
              <c.icon
                className="size-6 text-[#1a1a1a]"
                weight="light"
              />
              <h3 className="mt-4 font-display text-xl font-bold tracking-tight">
                {c.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground/70">
                {c.desc}
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {c.cta}
                <ArrowRight className="size-4" />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-foreground/55">
          <MapPin className="size-4" />
          Florianópolis, SC · Brasil
        </div>
      </div>
    </section>
  );
}
