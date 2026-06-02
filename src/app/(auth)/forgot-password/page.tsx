import Link from "next/link";
import { ForgotPasswordForm } from "./forgot-form";
import { AuthShell } from "@/components/app/auth-shell";

export const metadata = { title: "Esqueci a senha · Hosteasy" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Esqueci a senha"
      subtitle="Manda o e-mail da conta e te enviamos um link para redefinir."
      footer={
        <span>
          Lembrou?{" "}
          <Link
            href="/login"
            className="font-semibold text-foreground hover:text-primary"
          >
            Entrar
          </Link>
        </span>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
