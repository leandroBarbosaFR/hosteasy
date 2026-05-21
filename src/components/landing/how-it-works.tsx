const steps = [
  {
    n: "01",
    title: "Agende uma conversa",
    body: "15 minutos pra entendermos seu portfólio e te mostrarmos o painel funcionando.",
  },
  {
    n: "02",
    title: "Receba o tablet em casa",
    body: "Enviamos pré-configurado com sua marca e seu conteúdo. Chega em 4 a 7 dias.",
  },
  {
    n: "03",
    title: "Liga e funciona",
    body: "Tira da caixa, conecta no Wi-Fi e o app abre direto. Sem app store, sem login, sem QR code para o hóspede.",
  },
  {
    n: "04",
    title: "Acompanhe pelo painel",
    body: "Edite conteúdo por imóvel, ative parceiros locais e veja receita extra em tempo real.",
  },
];

export function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-background py-14 md:py-[60px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-20 hidden h-[460px] w-[460px] rounded-full bg-sage/10 blur-3xl md:block"
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Como funciona
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Do <span className="text-primary">&ldquo;sim&rdquo;</span> ao
            tablet rodando em menos de uma semana
          </h2>
        </div>

        <ol className="relative mt-16 grid gap-6 md:grid-cols-4">
          <span
            aria-hidden
            className="pointer-events-none absolute left-8 right-8 top-12 hidden h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent md:block"
          />
          {steps.map((s) => (
            <li
              key={s.n}
              className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/45 p-6 shadow-md shadow-black/[0.03] backdrop-blur-2xl backdrop-saturate-150"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
              />
              <div className="relative mb-5 inline-flex size-9 items-center justify-center rounded-full bg-white/70 font-display text-sm font-medium text-primary ring-1 ring-white/60">
                {s.n}
              </div>
              <h3 className="relative font-display text-lg font-medium tracking-tight">
                {s.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-foreground/70">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
