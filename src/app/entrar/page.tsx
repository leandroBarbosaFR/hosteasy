import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/landing/site-shell";

export default function EntrarPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-background py-20 md:py-32">
          <div className="mx-auto max-w-md px-6">
            <div className="rounded-3xl border border-border/60 bg-card p-8 md:p-10">
              <h1 className="font-display text-3xl font-medium tracking-tight md:text-4xl">
                Entrar
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">
                Acesse seu painel de anfitrião com o e-mail do cadastro.
              </p>

              <form className="mt-6 space-y-3">
                <div>
                  <label
                    htmlFor="email"
                    className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com.br"
                    className="mt-1.5 w-full rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
                  />
                </div>
                <div>
                  <label
                    htmlFor="senha"
                    className="text-[11px] font-semibold uppercase tracking-wider text-foreground/55"
                  >
                    Senha
                  </label>
                  <input
                    id="senha"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-full border border-border/60 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-foreground/30"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1f1916] py-1.5 pl-5 pr-2 text-sm font-semibold text-white transition-[box-shadow,background-color] duration-200 hover:bg-[#1f1916]/90 hover:shadow-[6px_6px_0_0_var(--color-primary)]"
                >
                  Entrar
                  <span className="grid size-7 place-items-center rounded-full bg-white/15">
                    <ArrowRight className="size-3.5" />
                  </span>
                </button>
              </form>

              <div className="mt-6 flex items-center justify-between text-xs text-foreground/55">
                <Link
                  href="/contato"
                  className="hover:text-foreground"
                >
                  Esqueci a senha
                </Link>
                <span>
                  Sem conta?{" "}
                  <Link
                    href="/contato"
                    className="font-semibold text-foreground hover:text-primary"
                  >
                    Agendar demo
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
