import { Plus } from "lucide-react";

const items = [
  {
    q: "O tablet vem incluído mesmo?",
    a: "Sim. O aparelho faz parte da assinatura — você não paga separado. Se o tablet quebrar, sumir ou for furtado, mandamos outro sem custo adicional, no Brasil todo.",
  },
  {
    q: "Como o hóspede usa, na prática?",
    a: "Não precisa baixar app, escanear QR code, fazer login nem fornecer e-mail. O tablet fica sempre ligado dentro do imóvel e abre direto na tela inicial com sua marca. O hóspede toca e usa, como se fosse a televisão.",
  },
  {
    q: "Funciona com Stays, Hostaway, Airbnb?",
    a: "Sim. Integramos com Stays.net, Hostaway, Lodgify, OwnerRez, Smoobu, Eviivo e mais 40+ PMSs. Reservas, datas de entrada e nomes do hóspede sincronizam automaticamente — o tablet já sabe quem está chegando.",
  },
  {
    q: "Preciso de Wi-Fi forte no imóvel?",
    a: "Não. Um Wi-Fi residencial padrão de 20 Mbps já é suficiente. Conteúdo de vídeo é carregado uma única vez e fica disponível offline para o hóspede assistir mesmo se a internet cair.",
  },
  {
    q: "Posso usar a minha marca?",
    a: "Sim — logo, cores, fotos, vídeos: tudo personalizável por imóvel. Você pode ter uma cara para o apartamento em Jurerê e outra para a pousada na Lagoa.",
  },
  {
    q: "Em quanto tempo eu começo?",
    a: "De 5 a 7 dias úteis entre o \"vamos fechar\" e o tablet rodando no imóvel. Te ajudamos a configurar o primeiro imóvel ao vivo numa chamada de 30 minutos.",
  },
  {
    q: "E se eu quiser cancelar?",
    a: "Contratos anuais não devolvem o valor proporcional, mas você não precisa renovar. Devolva o tablet por correio (te enviamos a etiqueta) e fica tudo certo.",
  },
];

export function Faq() {
  return (
    <section className="relative overflow-hidden bg-card/40 py-14 md:py-[60px]">
      <div className="relative mx-auto max-w-3xl px-6">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-white/60 px-3 py-1 text-xs font-medium text-foreground/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-primary" />
            Perguntas frequentes
          </span>
          <h2 className="mt-5 text-balance font-display text-4xl font-medium leading-[1.05] tracking-tight text-foreground md:text-5xl">
            O que anfitriões em{" "}
            <span className="text-primary">Floripa</span> nos perguntam
          </h2>
        </div>

        <div className="mt-14 space-y-3">
          {items.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/60 bg-card transition-shadow open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-left text-base font-medium">
                <span>{item.q}</span>
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-open:rotate-45">
                  <Plus className="size-4" />
                </span>
              </summary>
              <div className="px-5 pb-5 text-sm leading-relaxed text-foreground/65">
                {item.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
