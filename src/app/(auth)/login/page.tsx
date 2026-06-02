import Link from "next/link";
import { LoginForm } from "./login-form";
import { AuthShell } from "@/components/app/auth-shell";

export const metadata = { title: "Entrar · Hosteasy" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse seu painel de anfitrião com o e-mail do cadastro."
      footer={
        <div className="flex items-center justify-between">
          <Link href="/forgot-password" className="hover:text-foreground">
            Esqueci a senha
          </Link>
          <span>
            Sem conta?{" "}
            <Link
              href="/signup"
              className="font-semibold text-foreground hover:text-primary"
            >
              Criar conta
            </Link>
          </span>
        </div>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
