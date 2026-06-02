import { ResetPasswordForm } from "./reset-form";
import { AuthShell } from "@/components/app/auth-shell";

export const metadata = { title: "Nova senha · Hosteasy" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Nova senha"
      subtitle="Defina uma senha nova para sua conta."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
