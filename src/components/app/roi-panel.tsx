import { TrendingUp, Coffee, Clock, Car, Sparkles, Clock4, Star, AlertTriangle } from "lucide-react";
import { formatBRL } from "@/lib/format";

const CATEGORY_LABELS: Record<string, { label: string; Icon: typeof Coffee }> = {
  late_checkout: { label: "Late check-out", Icon: Clock },
  breakfast: { label: "Café da manhã", Icon: Coffee },
  transfer: { label: "Transfer", Icon: Car },
  welcome_basket: { label: "Cesta de boas-vindas", Icon: Sparkles },
  groceries: { label: "Compras prontas", Icon: Sparkles },
  custom: { label: "Outros extras", Icon: Sparkles },
};

export function ROIPanel({
  snapshot,
}: {
  snapshot: {
    totalRevenue: number;
    byCategory: Record<string, number>;
    paidOrdersCount: number;
    pendingOrdersCount: number;
    estimatedMinutesSaved: number;
    reviewRequests: number;
    positiveReviews: number;
    privateComplaints: number;
    monthlyCost: number;
    roiMultiple: number;
  };
}) {
  const hours = Math.round((snapshot.estimatedMinutesSaved / 60) * 10) / 10;
  const roiText =
    snapshot.totalRevenue > 0
      ? `${snapshot.roiMultiple.toFixed(1)}x`
      : "—";

  const categories = Object.entries(snapshot.byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <section className="rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-50/50 via-white to-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
            <TrendingUp className="size-3" /> Hosteasy ROI · este mês
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
            {formatBRL(snapshot.totalRevenue)}{" "}
            <span className="text-base font-medium text-foreground/55">gerados em extras</span>
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            {snapshot.paidOrdersCount} {snapshot.paidOrdersCount === 1 ? "pedido pago" : "pedidos pagos"}
            {snapshot.pendingOrdersCount > 0
              ? ` · ${snapshot.pendingOrdersCount} aguardando aprovação`
              : ""}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-white px-4 py-3 text-right shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
            ROI estimado
          </p>
          <p className="font-display text-2xl font-medium tracking-tight text-emerald-700">
            {roiText}
          </p>
          <p className="mt-0.5 text-[10px] text-foreground/55">
            vs custo {formatBRL(snapshot.monthlyCost)}/mês
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <Metric
          label="Auto-atendimento"
          value={`${hours}h economizadas`}
          hint="Estimativa baseada em interações de hóspede no tablet."
          Icon={Clock4}
        />
        <Metric
          label="Avaliações solicitadas"
          value={`${snapshot.reviewRequests}`}
          hint={`${snapshot.positiveReviews} positivas direcionadas para review pública.`}
          Icon={Star}
        />
        <Metric
          label="Reclamações privadas"
          value={`${snapshot.privateComplaints}`}
          hint="Capturadas antes de virarem review pública negativa."
          Icon={AlertTriangle}
          tone={snapshot.privateComplaints > 0 ? "warn" : "neutral"}
        />
      </div>

      {categories.length > 0 ? (
        <div className="mt-5 rounded-2xl bg-white/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55">
            Receita por categoria
          </p>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {categories.map(([cat, value]) => {
              const meta = CATEGORY_LABELS[cat] ?? CATEGORY_LABELS.custom;
              return (
                <li
                  key={cat}
                  className="flex items-center justify-between rounded-lg px-2 py-1 text-sm"
                >
                  <span className="inline-flex items-center gap-2">
                    <meta.Icon className="size-3.5 text-primary" />
                    {meta.label}
                  </span>
                  <span className="font-semibold">{formatBRL(value)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Metric({
  label,
  value,
  hint,
  Icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint?: string;
  Icon: typeof Clock4;
  tone?: "neutral" | "warn";
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-white p-4">
      <div className="flex items-center gap-2">
        <Icon
          className={
            tone === "warn"
              ? "size-4 text-amber-600"
              : "size-4 text-foreground/55"
          }
        />
        <p className="text-[10px] font-semibold uppercase tracking-wider text-foreground/55">
          {label}
        </p>
      </div>
      <p className="mt-2 font-display text-xl font-medium tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-foreground/55">{hint}</p> : null}
    </div>
  );
}
