import { requireRole } from "@/lib/auth";
import { AdminSidebar } from "@/components/app/admin-sidebar";
import { initialOf } from "@/lib/format";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["super_admin"]);
  return (
    <div className="flex min-h-svh bg-background">
      <AdminSidebar
        user={{
          name: profile.full_name ?? "Admin",
          initial: initialOf(profile.full_name ?? profile.email),
        }}
      />
      <div className="flex-1 pb-12">{children}</div>
    </div>
  );
}
