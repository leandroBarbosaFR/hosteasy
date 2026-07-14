"use client";

import { useState, useTransition } from "react";
import { Star, ArrowSquareOut as ExternalLink } from "@phosphor-icons/react/ssr";
import { submitReview } from "@/app/(tablet)/tablet/[tabletCode]/actions";

type Step = "rate" | "five-star" | "low-star" | "done";

export function ReviewPromptCard({
  tabletCode,
  airbnbUrl,
  bookingUrl,
  googleUrl,
}: {
  tabletCode: string;
  airbnbUrl: string | null;
  bookingUrl: string | null;
  googleUrl: string | null;
}) {
  const [step, setStep] = useState<Step>("rate");
  const [rating, setRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");
  const [pending, start] = useTransition();

  function record(r: number) {
    setRating(r);
    if (r >= 5) {
      // Submit immediately; the user is being routed to a public review.
      start(async () => {
        await submitReview(tabletCode, { rating: r });
        setStep("five-star");
      });
    } else {
      setStep("low-star");
    }
  }

  function openPublic(platform: "airbnb" | "booking" | "google", url: string) {
    start(async () => {
      await submitReview(tabletCode, {
        rating: 5,
        public_link_clicked: platform,
      });
      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

  if (step === "done") return null;

  return (
    <div className="rounded-3xl border border-primary/30 bg-white p-5 shadow-sm">
      {step === "rate" ? (
        <>
          <div className="flex items-center gap-2">
            <Star className="size-5 fill-primary text-primary" weight="fill" />
            <h3 className="font-display text-xl font-bold tracking-tight">
              Como foi sua estadia?
            </h3>
          </div>
          <p className="mt-1 text-sm text-foreground/65">
            Sua opinião nos ajuda a melhorar.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => record(n)}
                disabled={pending}
                className="grid size-12 place-items-center rounded-2xl bg-foreground/5 transition-colors hover:bg-foreground/10"
                aria-label={`${n} estrelas`}
              >
                <Star
                  weight={rating && n <= rating ? "fill" : "regular"}
                  className={
                    rating && n <= rating
                      ? "size-6 text-primary"
                      : "size-6 text-foreground/40"
                  }
                />
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === "five-star" ? (
        <>
          <h3 className="font-display text-xl font-bold tracking-tight">
            Que ótimo! 🌟
          </h3>
          <p className="mt-1 text-sm text-foreground/65">
            Se quiser, deixe uma avaliação pública. Ajuda muito o anfitrião.
          </p>
          <div className="mt-4 grid gap-2">
            {airbnbUrl ? (
              <ReviewLinkButton
                label="Avaliar no Airbnb"
                onClick={() => openPublic("airbnb", airbnbUrl)}
              />
            ) : null}
            {bookingUrl ? (
              <ReviewLinkButton
                label="Avaliar no Booking.com"
                onClick={() => openPublic("booking", bookingUrl)}
              />
            ) : null}
            {googleUrl ? (
              <ReviewLinkButton
                label="Avaliar no Google"
                onClick={() => openPublic("google", googleUrl)}
              />
            ) : null}
            <button
              type="button"
              onClick={() => setStep("done")}
              className="text-center text-xs font-medium text-foreground/55 hover:text-foreground"
            >
              Agora não
            </button>
          </div>
        </>
      ) : null}

      {step === "low-star" ? (
        <>
          <h3 className="font-display text-xl font-bold tracking-tight">
            Desculpe pela experiência
          </h3>
          <p className="mt-1 text-sm text-foreground/65">
            Conte o que podemos melhorar. Sua mensagem vai direto pro anfitrião.
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="O que poderia ser melhor?"
            className="mt-3 w-full rounded-2xl border border-border/60 bg-background p-3 text-sm outline-none"
          />
          <button
            type="button"
            disabled={pending || !feedback.trim()}
            onClick={() =>
              start(async () => {
                await submitReview(tabletCode, {
                  rating: rating ?? 3,
                  private_feedback: feedback.trim(),
                });
                setStep("done");
              })
            }
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {pending ? "Enviando…" : "Enviar feedback"}
          </button>
        </>
      ) : null}
    </div>
  );
}

function ReviewLinkButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-between gap-2 rounded-full bg-foreground py-2.5 px-4 text-sm font-semibold text-white hover:opacity-90"
    >
      <span>{label}</span>
      <ExternalLink className="size-4" />
    </button>
  );
}
