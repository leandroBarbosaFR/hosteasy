import Link from "next/link";
import { SignupForm } from "./signup-form";
import { AuthShell } from "@/components/app/auth-shell";

export const metadata = { title: "Criar conta · Hosteasy" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Criar conta"
      subtitle="Em 1 minuto você tem seu painel de anfitrião."
      footer={
        <span>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground hover:text-primary"
          >
            Entrar
          </Link>
        </span>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
