"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  Home as HomeIcon,
  Compass,
  Sparkles,
  BookOpen,
  Globe,
  MessageSquare,
  Settings,
  Wifi,
  Coffee,
  Utensils,
  MapPin,
  ShoppingBag,
  Calendar,
  Bell,
  Lock,
  Sun,
  Volume2,
  Search,
  ArrowRight,
  Star,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewKey =
  | "inicio"
  | "explorar"
  | "extras"
  | "guias"
  | "web"
  | "contato"
  | "ajustes";

const NAV: {
  key: ViewKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "inicio", label: "Início", Icon: HomeIcon },
  { key: "explorar", label: "Explorar", Icon: Compass },
  { key: "extras", label: "Extras", Icon: Sparkles },
  { key: "guias", label: "Guias", Icon: BookOpen },
  { key: "web", label: "Web", Icon: Globe },
  { key: "contato", label: "Contato", Icon: MessageSquare },
  { key: "ajustes", label: "Ajustes", Icon: Settings },
];

export function TabletMockup() {
  const [view, setView] = useState<ViewKey>("inicio");
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      gsap.fromTo(
        stage,
        { opacity: 0, x: 28, scale: 0.985, filter: "blur(6px)" },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.5,
          ease: "power3.out",
        }
      );

      const items = stage.querySelectorAll<HTMLElement>("[data-stagger]");
      if (items.length) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.07,
            delay: 0.08,
          }
        );
      }
    },
    { dependencies: [view] }
  );

  return (
    <div className="relative w-full max-w-3xl">
      <div className="relative rounded-[36px] bg-neutral-900 p-3 shadow-2xl shadow-neutral-900/30 ring-1 ring-black/10">
        <div className="overflow-hidden rounded-[24px] bg-white">
          <div className="flex">
            <aside className="flex w-44 flex-col gap-1 bg-[#1c2247] p-4 text-white/90">
              <div className="mb-4 flex items-center px-1">
                <span className="text-sm font-semibold">hosteasy</span>
              </div>
              {NAV.map(({ key, label, Icon }) => (
                <SideItem
                  key={key}
                  icon={<Icon className="size-4" />}
                  label={label}
                  active={view === key}
                  onClick={() => setView(key)}
                />
              ))}
              <div className="mt-auto flex items-center gap-2 px-2 pt-4 text-[10px] text-white/60">
                <span>100%</span>
                <Wifi className="size-3" />
              </div>
            </aside>

            <div className="relative flex-1 overflow-hidden bg-[#fafafa]">
              <div
                className="h-[560px] overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-track]:bg-transparent"
              >
                <div ref={stageRef} className="p-5" key={view}>
                  {view === "inicio" && <InicioView />}
                  {view === "explorar" && <ExplorarView />}
                  {view === "extras" && <ExtrasView />}
                  {view === "guias" && <GuiasView />}
                  {view === "web" && <WebView />}
                  {view === "contato" && <ContatoView />}
                  {view === "ajustes" && <AjustesView />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute -bottom-6 left-1/2 -z-10 h-12 w-3/4 -translate-x-1/2 rounded-full bg-neutral-900/20 blur-2xl"
      />
    </div>
  );
}

function SideItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs transition-colors duration-150",
        "hover:bg-white/10 hover:text-white",
        active ? "bg-white/10 font-medium text-white" : "text-white/75"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-x-1 -translate-y-1/2 rounded-full bg-primary"
        />
      )}
      {icon}
      <span>{label}</span>
    </button>
  );
}

// --- views ---

function InicioView() {
  return (
    <>
      <div data-stagger>
        <PhotoHero />
      </div>
      <div data-stagger className="mt-4 grid grid-cols-3 gap-3">
        <PhotoCard
          title="Guia da casa"
          cta="Ver agora"
          src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=600&q=80"
          alt="Sala aconchegante com sofá e luminária"
        />
        <PhotoCard
          title="Café & padaria"
          cta="Pedir"
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80"
          alt="Croissants e café fresco"
        />
        <PhotoCard
          title="Explorar Campeche"
          cta="Descobrir"
          src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=500&q=80"
          alt="Palmeiras na praia"
        />
      </div>
    </>
  );
}

function ExplorarView() {
  return (
    <>
      <div data-stagger className="relative h-44 overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80"
          alt="Praia com palmeiras"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-[11px] uppercase tracking-wider opacity-90">
            Florianópolis Sul
          </p>
          <p className="text-xl font-semibold leading-tight drop-shadow">
            10 lugares perto da sua casa
          </p>
        </div>
      </div>
      <div data-stagger className="mt-4 space-y-2">
        <PlaceRow name="Praia do Campeche" tag="Praia · 5 min" rating="4.9" />
        <PlaceRow name="Lagoa do Peri" tag="Trilha · 12 min" rating="4.8" />
        <PlaceRow name="Costão do Santinho" tag="Mirante · 18 min" rating="4.7" />
        <PlaceRow name="Mercado Público" tag="Compras · 25 min" rating="4.6" />
      </div>
    </>
  );
}

function ExtrasView() {
  return (
    <>
      <div data-stagger className="flex items-center justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-foreground/60">
            Adicione à sua estadia
          </p>
          <p className="text-lg font-semibold">Extras do anfitrião</p>
        </div>
        <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          3 itens
        </div>
      </div>
      <div data-stagger className="mt-4 grid grid-cols-2 gap-3">
        <ExtraCard
          icon={<Coffee className="size-4" />}
          title="Café da manhã"
          desc="Entregue às 9h"
          price="R$ 35"
        />
        <ExtraCard
          icon={<Calendar className="size-4" />}
          title="Late check-out"
          desc="Até 16h"
          price="R$ 90"
        />
        <ExtraCard
          icon={<MapPin className="size-4" />}
          title="Transfer aeroporto"
          desc="Até 4 pessoas"
          price="R$ 120"
        />
        <ExtraCard
          icon={<ShoppingBag className="size-4" />}
          title="Compras prontas"
          desc="Mercado entregue"
          price="R$ 60"
        />
      </div>
    </>
  );
}

function GuiasView() {
  return (
    <>
      <div data-stagger>
        <p className="text-[11px] uppercase tracking-wider text-foreground/60">
          Tudo sobre a casa
        </p>
        <p className="text-lg font-semibold">Guia da estadia</p>
      </div>
      <div data-stagger className="mt-4 space-y-2">
        <GuideRow
          icon={<Wifi className="size-4" />}
          title="Wi-Fi & senha"
          desc="Conecte-se em segundos"
        />
        <GuideRow
          icon={<Utensils className="size-4" />}
          title="Cozinha equipada"
          desc="Como usar fogão e cafeteira"
        />
        <GuideRow
          icon={<Sun className="size-4" />}
          title="Ar-condicionado"
          desc="Controle e temperatura ideal"
        />
        <GuideRow
          icon={<Lock className="size-4" />}
          title="Check-out"
          desc="Passo a passo até a saída"
        />
      </div>
    </>
  );
}

function WebView() {
  return (
    <>
      <div
        data-stagger
        className="flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm"
      >
        <Search className="size-4 text-foreground/40" />
        <span className="flex-1 text-xs text-foreground/60">
          hosteasy.com.br
        </span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          Ir
        </span>
      </div>
      <div data-stagger className="mt-5 grid grid-cols-4 gap-x-3 gap-y-4">
        <BookmarkTile letter="A" name="Airbnb" color="#FF385C" />
        <BookmarkTile letter="B" name="Booking" color="#003580" />
        <BookmarkTile letter="M" name="Maps" color="#34A853" />
        <BookmarkTile letter="i" name="iFood" color="#EA1D2C" />
        <BookmarkTile letter="U" name="Uber" color="#111111" />
        <BookmarkTile letter="W" name="WhatsApp" color="#25D366" />
        <BookmarkTile letter="Y" name="YouTube" color="#FF0000" />
        <BookmarkTile letter="N" name="Notícias" color="#1a73e8" />
      </div>
    </>
  );
}

function ContatoView() {
  return (
    <>
      <div data-stagger className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
          L
        </div>
        <div>
          <p className="text-sm font-semibold">Leandro · anfitrião</p>
          <p className="text-[11px] text-foreground/60">
            Resposta em ~5 minutos
          </p>
        </div>
      </div>
      <div data-stagger className="mt-4 space-y-2">
        <ChatBubble side="them" text="Olá! Tudo certo com a chegada?" />
        <ChatBubble side="me" text="Tudo ótimo! Fiquei na dúvida do Wi-Fi" />
        <ChatBubble
          side="them"
          text="A senha está no guia da casa: hosteasy2026 ✨"
        />
      </div>
      <div
        data-stagger
        className="mt-3 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm"
      >
        <span className="flex-1 text-xs text-foreground/40">
          Escreva uma mensagem...
        </span>
        <Send className="size-4 text-primary" />
      </div>
    </>
  );
}

function AjustesView() {
  return (
    <>
      <div data-stagger>
        <p className="text-[11px] uppercase tracking-wider text-foreground/60">
          Preferências
        </p>
        <p className="text-lg font-semibold">Ajustes do tablet</p>
      </div>
      <div data-stagger className="mt-4 grid grid-cols-2 gap-3">
        <SettingRow
          icon={<Globe className="size-4" />}
          title="Idioma"
          value="Português"
        />
        <SettingRow
          icon={<Volume2 className="size-4" />}
          title="Volume"
          value="40%"
        />
        <SettingRow
          icon={<Sun className="size-4" />}
          title="Brilho"
          value="Automático"
        />
        <SettingRow
          icon={<Bell className="size-4" />}
          title="Notificações"
          value="Ativadas"
        />
      </div>
    </>
  );
}

// --- shared bits ---

function PhotoHero() {
  return (
    <div className="group/hero relative h-44 cursor-pointer overflow-hidden rounded-2xl bg-neutral-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
        alt="Praia ao pôr do sol"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/15" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div className="text-white drop-shadow-sm">
          <p className="text-[11px] uppercase tracking-wider opacity-90">
            Vilas do Luiz
          </p>
          <p className="text-xl font-semibold leading-tight">
            Reserve sua próxima estadia
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm transition-colors duration-200 group-hover/hero:bg-primary group-hover/hero:text-white"
        >
          Reservar
        </button>
      </div>
    </div>
  );
}

function PhotoCard({
  title,
  cta,
  src,
  alt,
}: {
  title: string;
  cta: string;
  src: string;
  alt: string;
}) {
  return (
    <div className="group/card relative h-32 cursor-pointer overflow-hidden rounded-xl bg-neutral-200 shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/65 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
        <p className="text-xs font-semibold leading-tight text-white drop-shadow-sm">
          {title}
        </p>
      </div>
      <button
        type="button"
        className="absolute bottom-3 left-3 rounded-full bg-white px-2 py-1 text-[10px] font-semibold text-neutral-900 shadow-sm transition-colors duration-200 group-hover/card:bg-primary group-hover/card:text-white"
      >
        {cta}
      </button>
    </div>
  );
}

function PlaceRow({
  name,
  tag,
  rating,
}: {
  name: string;
  tag: string;
  rating: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 shadow-sm">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-[11px] text-foreground/60">{tag}</p>
      </div>
      <div className="flex items-center gap-1 text-xs font-semibold text-primary">
        <Star className="size-3 fill-primary" />
        {rating}
      </div>
    </div>
  );
}

function ExtraCard({
  icon,
  title,
  desc,
  price,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  price: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[10px] font-semibold uppercase tracking-wider">
          Extra
        </span>
      </div>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-foreground/60">{desc}</p>
      <p className="mt-1 text-xs font-semibold text-foreground/90">{price}</p>
    </div>
  );
}

function GuideRow({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-[11px] text-foreground/60">{desc}</p>
      </div>
      <ArrowRight className="size-4 text-foreground/40" />
    </div>
  );
}

function BookmarkTile({
  letter,
  name,
  color,
}: {
  letter: string;
  name: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="grid size-12 place-items-center rounded-xl text-base font-bold text-white shadow-sm"
        style={{ backgroundColor: color }}
      >
        {letter}
      </div>
      <span className="text-[10px] font-medium text-foreground/70">
        {name}
      </span>
    </div>
  );
}

function ChatBubble({
  side,
  text,
}: {
  side: "me" | "them";
  text: string;
}) {
  const mine = side === "me";
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-snug",
          mine
            ? "bg-primary text-white"
            : "bg-white text-foreground/80 shadow-sm"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function SettingRow({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-[11px] font-semibold">{title}</span>
      </div>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
