"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SquaresFour as LayoutDashboard, CalendarDots as CalendarDays, Chat as MessageSquare, ChartLine as LineChartIcon, Buildings as Building2, Gear as Settings, MagnifyingGlass as Search, Bell, ArrowUpRight, ArrowDownRight, Star, Check, MapPin, Plus } from "@phosphor-icons/react/ssr";
import { cn } from "@/lib/utils";

type ViewKey =
  | "geral"
  | "reservas"
  | "mensagens"
  | "receita"
  | "imoveis"
  | "ajustes";

const NAV: {
  key: ViewKey;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "geral", label: "Visão geral", Icon: LayoutDashboard },
  { key: "reservas", label: "Reservas", Icon: CalendarDays },
  { key: "mensagens", label: "Mensagens", Icon: MessageSquare },
  { key: "receita", label: "Receita", Icon: LineChartIcon },
  { key: "imoveis", label: "Imóveis", Icon: Building2 },
  { key: "ajustes", label: "Ajustes", Icon: Settings },
];

// screen bounds inside the SVG (slightly overshoots the chroma-key so no green leaks)
const SCREEN = {
  left: "13.9%",
  top: "15.9%",
  right: "14%",
  bottom: "21.6%",
};

export function HostDashboardMockup() {
  const [view, setView] = useState<ViewKey>("geral");
  const stageRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;

      gsap.fromTo(
        stage,
        { opacity: 0, x: 28, scale: 0.99, filter: "blur(6px)" },
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
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: 0.05,
            delay: 0.08,
          }
        );
      }
    },
    { dependencies: [view] }
  );

  return (
    <div className="relative w-full">
      <div className="relative w-full" style={{ paddingBottom: "75%" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/MacBookPro16.svg"
          alt="MacBook Pro com o painel do anfitrião"
          className="absolute inset-0 h-full w-full select-none"
          draggable={false}
        />

        <div
          className="absolute overflow-hidden rounded-[10px] bg-[#fAfAfA]"
          style={{
            left: SCREEN.left,
            top: SCREEN.top,
            right: SCREEN.right,
            bottom: SCREEN.bottom,
          }}
        >
          <Titlebar />
          <div className="flex h-[calc(100%-1.75rem)]">
            <Sidebar view={view} onChange={setView} />
            <div className="relative flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/15 [&::-webkit-scrollbar-track]:bg-transparent">
                <div ref={stageRef} className="p-5" key={view}>
                  {view === "geral" && <VisaoGeralView />}
                  {view === "reservas" && <ReservasView />}
                  {view === "mensagens" && <MensagensView />}
                  {view === "receita" && <ReceitaView />}
                  {view === "imoveis" && <ImoveisView />}
                  {view === "ajustes" && <AjustesView />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Titlebar() {
  return (
    <div className="flex h-7 items-center gap-2 border-b border-black/5 bg-white/80 px-3 backdrop-blur">
      <div className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
      </div>
      <div className="ml-2 flex flex-1 items-center gap-1.5 rounded-md bg-black/5 px-2 py-0.5 text-[10px] text-foreground/50">
        <Search className="size-3" />
        <span>hosteasy.com.br/painel</span>
      </div>
      <Bell className="size-3 text-foreground/50" />
    </div>
  );
}

function Sidebar({
  view,
  onChange,
}: {
  view: ViewKey;
  onChange: (k: ViewKey) => void;
}) {
  return (
    <aside className="flex w-44 flex-col gap-0.5 border-r border-black/5 bg-[#1c2247] p-3 text-white/90">
      <div className="mb-3 flex items-center justify-between px-1.5 py-1">
        <span className="text-sm font-semibold">hosteasy</span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-medium text-white/70">
          Pro
        </span>
      </div>
      {NAV.map(({ key, label, Icon }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors duration-150",
            "hover:bg-white/10 hover:text-white",
            view === key
              ? "bg-white/10 font-medium text-white"
              : "text-white/70"
          )}
        >
          {view === key && (
            <span
              aria-hidden
              className="absolute left-0 top-1/2 h-4 w-0.5 -translate-x-[3px] -translate-y-1/2 rounded-full bg-primary"
            />
          )}
          <Icon className="size-3.5" />
          <span>{label}</span>
        </button>
      ))}
      <div className="mt-auto flex items-center gap-2 rounded-md bg-white/5 px-2 py-1.5">
        <div className="grid size-6 place-items-center rounded-full bg-primary/30 text-[10px] font-semibold">
          L
        </div>
        <div className="leading-tight">
          <p className="text-[11px] font-semibold">Leandro</p>
          <p className="text-[9px] text-white/60">Anfitrião · 3 imóveis</p>
        </div>
      </div>
    </aside>
  );
}

// --- views ---

function VisaoGeralView() {
  return (
    <>
      <div data-stagger className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground/50">
            Boa tarde, Leandro
          </p>
          <p className="text-lg font-semibold leading-tight">
            Você tem 3 check-ins hoje
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm"
        >
          <Plus className="size-3" /> Nova reserva
        </button>
      </div>

      <div data-stagger className="mt-4 grid grid-cols-4 gap-2">
        <StatCard label="Receita do mês" value="R$ 15.420" trend="up" delta="+12%" />
        <StatCard label="Ocupação" value="87%" trend="up" delta="+4%" />
        <StatCard label="Reservas ativas" value="12" trend="up" delta="+3" />
        <StatCard label="Nota média" value="4.9" trend="up" delta="↑" icon={<Star className="size-3 fill-primary text-primary" weight="fill" />} />
      </div>

      <div data-stagger className="mt-4 grid grid-cols-5 gap-3">
        <div className="col-span-3 rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold">Próximas reservas</p>
            <span className="text-[10px] text-foreground/50">7 dias</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <BookingRow guest="Marina Souza" when="Hoje · 15h" property="Vilas do Luiz · 102" status="check-in" />
            <BookingRow guest="Tiago Lima" when="Hoje · 18h" property="Costa Azul · A12" status="check-in" />
            <BookingRow guest="Família Oliveira" when="Amanhã · 14h" property="Vilas do Luiz · 304" status="check-in" />
            <BookingRow guest="Ana Pereira" when="Sex · 11h" property="Costa Azul · B07" status="check-out" />
          </div>
        </div>

        <div className="col-span-2 rounded-lg bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold">Receita · 30 dias</p>
            <span className="text-[10px] font-semibold text-emerald-600">+12%</span>
          </div>
          <Sparkline />
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-[10px] text-foreground/50">Total</p>
              <p className="text-base font-semibold">R$ 15.420</p>
            </div>
            <div>
              <p className="text-[10px] text-foreground/50">Diária média</p>
              <p className="text-base font-semibold">R$ 540</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ReservasView() {
  return (
    <>
      <div data-stagger className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground/50">
            Calendário
          </p>
          <p className="text-lg font-semibold leading-tight">Reservas</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Pill label="Todas" active />
          <Pill label="Check-in hoje" />
          <Pill label="Pendentes" />
        </div>
      </div>

      <div data-stagger className="mt-4 rounded-lg bg-white shadow-sm">
        <ReservaRow guest="Marina Souza" range="12 mai · 15 mai" nights="3 noites" property="Vilas do Luiz · 102" total="R$ 1.620" tone="confirmed" />
        <ReservaRow guest="Tiago Lima" range="12 mai · 14 mai" nights="2 noites" property="Costa Azul · A12" total="R$ 1.080" tone="confirmed" />
        <ReservaRow guest="Família Oliveira" range="13 mai · 17 mai" nights="4 noites" property="Vilas do Luiz · 304" total="R$ 2.160" tone="confirmed" />
        <ReservaRow guest="Ana Pereira" range="9 mai · 16 mai" nights="7 noites" property="Costa Azul · B07" total="R$ 3.780" tone="finishing" last />
      </div>
    </>
  );
}

function MensagensView() {
  return (
    <>
      <div data-stagger className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground/50">
            Caixa de entrada
          </p>
          <p className="text-lg font-semibold leading-tight">Mensagens</p>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
          3 não lidas
        </span>
      </div>

      <div data-stagger className="mt-4 grid grid-cols-5 gap-3">
        <div className="col-span-2 rounded-lg bg-white p-1.5 shadow-sm">
          <ThreadRow name="Marina Souza" snippet="Posso fazer early check-in?" time="14:02" unread active />
          <ThreadRow name="Tiago Lima" snippet="Senha do Wi-Fi não funciona" time="13:48" unread />
          <ThreadRow name="Ana Pereira" snippet="Pode marcar transfer pra sex?" time="11:20" unread />
          <ThreadRow name="Família Oliveira" snippet="Tudo ótimo, obrigado!" time="Ontem" />
        </div>

        <div className="col-span-3 flex flex-col rounded-lg bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2">
            <div className="grid size-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
              M
            </div>
            <div>
              <p className="text-[11px] font-semibold">Marina Souza</p>
              <p className="text-[9px] text-foreground/50">Vilas do Luiz · 102</p>
            </div>
          </div>
          <div className="flex-1 space-y-1.5 p-3">
            <ChatBubble side="them" text="Olá! Conseguimos chegar antes das 14h?" />
            <ChatBubble side="me" text="Oi Marina! Posso liberar 13h sem custo 🙌" />
            <ChatBubble side="them" text="Perfeito, muito obrigada!" />
          </div>
          <div className="m-3 mt-0 flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5">
            <span className="flex-1 text-[10px] text-foreground/50">
              Responder...
            </span>
            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-semibold text-white">
              Enviar
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function ReceitaView() {
  return (
    <>
      <div data-stagger className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground/50">
            Últimos 30 dias
          </p>
          <p className="text-lg font-semibold leading-tight">Receita</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Pill label="7d" />
          <Pill label="30d" active />
          <Pill label="90d" />
          <Pill label="Ano" />
        </div>
      </div>

      <div data-stagger className="mt-4 grid grid-cols-3 gap-2">
        <StatCard label="Receita bruta" value="R$ 15.420" trend="up" delta="+12%" />
        <StatCard label="Diária média" value="R$ 540" trend="up" delta="+R$ 28" />
        <StatCard label="Extras vendidos" value="R$ 1.840" trend="up" delta="+R$ 320" />
      </div>

      <div data-stagger className="mt-3 rounded-lg bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold">Receita por imóvel</p>
          <span className="text-[10px] text-foreground/50">Maio</span>
        </div>
        <div className="mt-2 space-y-2">
          <BarRow label="Vilas do Luiz · 102" value="R$ 6.120" pct={92} />
          <BarRow label="Vilas do Luiz · 304" value="R$ 4.680" pct={72} />
          <BarRow label="Costa Azul · A12" value="R$ 3.260" pct={50} />
          <BarRow label="Costa Azul · B07" value="R$ 1.360" pct={22} />
        </div>
      </div>
    </>
  );
}

function ImoveisView() {
  return (
    <>
      <div data-stagger className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-foreground/50">
            Seus imóveis
          </p>
          <p className="text-lg font-semibold leading-tight">
            3 propriedades · 4 tablets
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm"
        >
          <Plus className="size-3" /> Adicionar
        </button>
      </div>

      <div data-stagger className="mt-4 grid grid-cols-3 gap-3">
        <PropertyCard
          name="Vilas do Luiz · 102"
          city="Campeche, SC"
          tablet="online"
          occupancy="94%"
          image="https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=500&q=80"
        />
        <PropertyCard
          name="Vilas do Luiz · 304"
          city="Campeche, SC"
          tablet="online"
          occupancy="78%"
          image="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=500&q=80"
        />
        <PropertyCard
          name="Costa Azul · A12"
          city="Jurerê, SC"
          tablet="offline"
          occupancy="62%"
          image="https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=500&q=80"
        />
      </div>
    </>
  );
}

function AjustesView() {
  return (
    <>
      <div data-stagger>
        <p className="text-[10px] uppercase tracking-wider text-foreground/50">
          Preferências da conta
        </p>
        <p className="text-lg font-semibold leading-tight">Ajustes</p>
      </div>

      <div data-stagger className="mt-4 grid grid-cols-2 gap-3">
        <SettingCard
          title="Equipe"
          desc="3 membros com acesso ao painel"
          action="Gerenciar"
        />
        <SettingCard
          title="Notificações"
          desc="E-mail, push e WhatsApp"
          action="Editar"
        />
        <SettingCard
          title="Pagamentos"
          desc="Pix e cartão · Stripe conectado"
          action="Ver"
        />
        <SettingCard
          title="Modelos de mensagem"
          desc="Boas-vindas, check-out, avaliação"
          action="Editar"
        />
      </div>
    </>
  );
}

// --- atoms ---

function StatCard({
  label,
  value,
  delta,
  trend,
  icon,
}: {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  icon?: React.ReactNode;
}) {
  const TrendIcon = trend === "up" ? ArrowUpRight : ArrowDownRight;
  const trendColor =
    trend === "up" ? "text-emerald-600" : "text-rose-600";
  return (
    <div className="rounded-lg bg-white p-2.5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-foreground/50">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-base font-semibold leading-tight">{value}</p>
      <div className={cn("mt-0.5 flex items-center gap-0.5 text-[10px] font-medium", trendColor)}>
        <TrendIcon className="size-3" />
        {delta}
      </div>
    </div>
  );
}

function BookingRow({
  guest,
  when,
  property,
  status,
}: {
  guest: string;
  when: string;
  property: string;
  status: "check-in" | "check-out";
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md px-1.5 py-1 hover:bg-black/[0.03]">
      <div className="grid size-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
        {guest[0]}
      </div>
      <div className="flex-1 leading-tight">
        <p className="text-[11px] font-semibold">{guest}</p>
        <p className="text-[10px] text-foreground/50">{property}</p>
      </div>
      <div className="text-right leading-tight">
        <p className="text-[10px] font-medium">{when}</p>
        <p
          className={cn(
            "text-[9px] font-semibold uppercase tracking-wider",
            status === "check-in" ? "text-primary" : "text-foreground/50"
          )}
        >
          {status}
        </p>
      </div>
    </div>
  );
}

function ReservaRow({
  guest,
  range,
  nights,
  property,
  total,
  tone,
  last,
}: {
  guest: string;
  range: string;
  nights: string;
  property: string;
  total: string;
  tone: "confirmed" | "finishing";
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-3 py-2.5",
        !last && "border-b border-black/5"
      )}
    >
      <div className="grid size-8 place-items-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
        {guest[0]}
      </div>
      <div className="flex-1 leading-tight">
        <p className="text-[11px] font-semibold">{guest}</p>
        <p className="text-[10px] text-foreground/50">{property}</p>
      </div>
      <div className="leading-tight">
        <p className="text-[11px] font-medium">{range}</p>
        <p className="text-[10px] text-foreground/50">{nights}</p>
      </div>
      <div className="w-20 text-right text-[11px] font-semibold">{total}</div>
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider",
          tone === "confirmed"
            ? "bg-emerald-500/10 text-emerald-700"
            : "bg-amber-500/10 text-amber-700"
        )}
      >
        {tone === "confirmed" ? "Confirmada" : "Em estadia"}
      </span>
    </div>
  );
}

function ThreadRow({
  name,
  snippet,
  time,
  unread,
  active,
}: {
  name: string;
  snippet: string;
  time: string;
  unread?: boolean;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md px-2 py-1.5 text-left",
        active ? "bg-primary/10" : "hover:bg-black/[0.03]"
      )}
    >
      <div className="grid size-7 place-items-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
        {name[0]}
      </div>
      <div className="flex-1 leading-tight">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold">{name}</p>
          <span className="text-[9px] text-foreground/50">{time}</span>
        </div>
        <p
          className={cn(
            "truncate text-[10px]",
            unread
              ? "font-semibold text-foreground/80"
              : "text-foreground/50"
          )}
        >
          {snippet}
        </p>
      </div>
      {unread && <span className="mt-1 size-1.5 rounded-full bg-primary" />}
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
          "max-w-[85%] rounded-xl px-2.5 py-1.5 text-[10px] leading-snug",
          mine
            ? "bg-primary text-white"
            : "bg-black/5 text-foreground/80"
        )}
      >
        {text}
      </div>
    </div>
  );
}

function BarRow({
  label,
  value,
  pct,
}: {
  label: string;
  value: string;
  pct: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-foreground/70">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function PropertyCard({
  name,
  city,
  tablet,
  occupancy,
  image,
}: {
  name: string;
  city: string;
  tablet: "online" | "offline";
  occupancy: string;
  image: string;
}) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <div className="relative h-20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <span
          className={cn(
            "absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-semibold",
            tablet === "online"
              ? "bg-emerald-500 text-white"
              : "bg-neutral-700 text-white"
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              tablet === "online" ? "bg-white" : "bg-rose-300"
            )}
          />
          Tablet {tablet}
        </span>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-semibold leading-tight">{name}</p>
        <p className="mt-0.5 flex items-center gap-1 text-[10px] text-foreground/50">
          <MapPin className="size-3" />
          {city}
        </p>
        <div className="mt-2 flex items-center justify-between text-[10px]">
          <span className="text-foreground/50">Ocupação</span>
          <span className="font-semibold">{occupancy}</span>
        </div>
      </div>
    </div>
  );
}

function SettingCard({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
      <div className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Check className="size-4" />
      </div>
      <div className="flex-1 leading-tight">
        <p className="text-[11px] font-semibold">{title}</p>
        <p className="text-[10px] text-foreground/50">{desc}</p>
      </div>
      <span className="text-[10px] font-semibold text-primary">{action}</span>
    </div>
  );
}

function Pill({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium",
        active
          ? "bg-primary text-white"
          : "bg-black/5 text-foreground/60"
      )}
    >
      {label}
    </span>
  );
}

function Sparkline() {
  // simple inline svg sparkline
  return (
    <svg
      viewBox="0 0 100 36"
      className="mt-2 h-10 w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="spark-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0,28 L10,22 L20,24 L30,18 L40,20 L50,14 L60,16 L70,9 L80,12 L90,6 L100,4 L100,36 L0,36 Z"
        fill="url(#spark-fill)"
      />
      <path
        d="M0,28 L10,22 L20,24 L30,18 L40,20 L50,14 L60,16 L70,9 L80,12 L90,6 L100,4"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

