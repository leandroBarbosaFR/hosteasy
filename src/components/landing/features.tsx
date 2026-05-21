import { Coins, MapPinned, Heart, Headset } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Coins,
    metric: "+R$ 400/mês",
    title: "Extras que se vendem sozinhos",
    body: "Hoje o hóspede sai sem nem saber que existia late check-out, café da manhã ou faxina extra. No tablet, ele toca, autorizamos no cartão, você confirma e fica com 90% do que entrou.",
  },
  {
    icon: MapPinned,
    metric: "+R$ 220/mês",
    title: "Comissão de parceiros locais",
    body: "iFood, restaurantes, escolas de surf, passeios de barco — pré-conectados por bairro de Floripa. Hóspede gasta no tablet, você recebe 20% no fim do mês.",
  },
  {
    icon: Heart,
    metric: "+18% reservas diretas",
    title: "Menos Airbnb, mais hóspede seu",
    body: "Sua marca aparece em cada estadia, hóspede entra no seu CRM e recebe programa de indicação. Da próxima vez ele reserva direto com você.",
  },
  {
    icon: Headset,
    metric: "−70% mensagens",
    title: "Pare de responder “qual a senha do Wi-Fi”",
    body: "Vídeo-guia da casa (cafeteira, ar, TV), check-in digital e chat em 5 idiomas direto no tablet. Cada pergunta automatizada é uma noite sua sem o WhatsApp tocando.",
  },
] as const;

export function Features() {
  const [hero, second, third, wide] = features;

  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-[60px]">
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Recursos
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Quatro receitas que você está{" "}
            <span className="text-primary">perdendo todo mês</span>
          </h2>
          <p className="mt-5 text-pretty text-base leading-relaxed text-foreground/65 md:text-lg">
            Hóspedes passam em média{" "}
            <span className="font-semibold text-foreground">
              27 minutos no tablet
            </span>{" "}
            por estadia — tempo de sobra pra IA priorizar os extras certos,
            responder as dúvidas óbvias e te trazer reservas diretas.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(180px,_auto)] grid-cols-1 gap-5 md:grid-cols-3 md:grid-rows-3">
          <BentoCard
            feature={hero}
            variant="hero"
            className="md:col-span-2 md:row-span-2"
          />
          <BentoCard feature={second} className="md:col-span-1 md:row-span-1" />
          <BentoCard feature={third} className="md:col-span-1 md:row-span-1" />
          <BentoCard
            feature={wide}
            variant="wide"
            className="md:col-span-3 md:row-span-1"
          />
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  feature,
  variant = "default",
  className,
}: {
  feature: (typeof features)[number];
  variant?: "default" | "hero" | "wide";
  className?: string;
}) {
  const Icon = feature.icon;
  const isHero = variant === "hero";
  const isWide = variant === "wide";

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/45 p-7 backdrop-blur-2xl backdrop-saturate-150 transition-shadow duration-300",
        "shadow-[0_1px_2px_rgba(31,25,22,0.04)] hover:shadow-[0_8px_24px_rgba(31,25,22,0.06)]",
        isHero && "p-8 md:p-10",
        isWide && "md:flex-row md:items-center md:gap-10 md:p-8",
        className
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
      />

      <div
        className={cn(
          "flex items-center justify-between",
          isWide && "md:w-72 md:shrink-0 md:flex-col md:items-start md:gap-5"
        )}
      >
        <Icon
          className={cn(
            "shrink-0 text-[#1f1916]",
            isHero ? "size-7" : "size-6"
          )}
          strokeWidth={1.75}
        />
        <span
          className={cn(
            "rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary ring-1 ring-primary/15",
            isHero && "px-3 py-1.5 text-xs"
          )}
        >
          {feature.metric}
        </span>
      </div>

      <div className={cn("mt-5", isWide && "md:mt-0 md:flex-1")}>
        <h3
          className={cn(
            "font-display font-medium tracking-tight text-foreground",
            isHero
              ? "text-2xl leading-tight md:text-3xl"
              : "text-xl leading-tight"
          )}
        >
          {feature.title}
        </h3>
        <p
          className={cn(
            "mt-3 text-sm leading-relaxed text-foreground/70",
            isHero && "md:text-base"
          )}
        >
          {feature.body}
        </p>
      </div>
    </article>
  );
}
