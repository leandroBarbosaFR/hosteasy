"use client";

import { useState, useTransition } from "react";
import { Star, Check } from "@phosphor-icons/react/ssr";
import {
  Field,
  FormMessage,
  inputClass,
  primaryButtonClass,
} from "@/components/app/auth-shell";
import { updatePropertyROISettings } from "./roi-settings-actions";
import type { Property } from "@/types/db";

export function ReviewLinksSettings({ property }: { property: Property }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  return (
    <section className="rounded-3xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Star className="size-5" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight">
            Aumentar suas avaliações
          </h2>
          <p className="mt-1 text-sm text-foreground/65">
            No check-out, o hóspede que avaliar 5 estrelas é convidado a
            publicar a review pública. Hóspedes insatisfeitos enviam feedback
            privado pra você, sem prejudicar sua nota.
          </p>
        </div>
      </div>

      <form
        action={(fd) =>
          start(async () => {
            setMsg(null);
            fd.set("property_id", property.id);
            fd.set("section", "review_links");
            const res = await updatePropertyROISettings(fd);
            setMsg({ ok: res.ok, text: res.ok ? "Salvo." : res.error ?? "Erro" });
          })
        }
        className="mt-4 space-y-3"
      >
        <Field label="Link da review no Airbnb" htmlFor="review_link_airbnb">
          <input
            id="review_link_airbnb"
            name="review_link_airbnb"
            type="url"
            placeholder="https://www.airbnb.com.br/rooms/123/reviews"
            defaultValue={property.review_link_airbnb ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Link da review no Booking.com" htmlFor="review_link_booking">
          <input
            id="review_link_booking"
            name="review_link_booking"
            type="url"
            placeholder="https://www.booking.com/hotel/.../review"
            defaultValue={property.review_link_booking ?? ""}
            className={inputClass}
          />
        </Field>
        <Field label="Link de review no Google" htmlFor="review_link_google">
          <input
            id="review_link_google"
            name="review_link_google"
            type="url"
            placeholder="https://g.page/r/.../review"
            defaultValue={property.review_link_google ?? ""}
            className={inputClass}
          />
        </Field>

        {msg ? (
          <FormMessage kind={msg.ok ? "success" : "error"}>{msg.text}</FormMessage>
        ) : null}

        <button disabled={pending} className={primaryButtonClass}>
          {pending ? "Salvando…" : (<><Check className="size-4" /> Salvar links</>)}
        </button>
      </form>
    </section>
  );
}
