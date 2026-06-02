import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { AuthShell } from "@/components/app/auth-shell";
import { SetupForm } from "./setup-form";

export const metadata = { title: "Configurar conta · Hosteasy" };

export default async function SetupPage() {
  const profile = await requireProfile();
  if (profile.host_id) redirect("/dashboard");

  return (
    <AuthShell
      title="Falta só o nome"
      subtitle="Qual o nome do seu negócio? Você pode mudar depois nos ajustes."
    >
      <SetupForm defaultName={profile.full_name ?? ""} />
    </AuthShell>
  );
}
