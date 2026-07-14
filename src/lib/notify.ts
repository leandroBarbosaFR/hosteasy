import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  sendEmail,
  sendWhatsApp,
  emailDeliveryEnabled,
  whatsappDeliveryEnabled,
} from "@/lib/deliver";
import type { NotificationType } from "@/types/db";

export type NotificationInput = {
  hostId: string;
  type: NotificationType;
  title: string;
  body?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  actionPath?: string | null;
};

// Every host_admin of the host (via host_members plus the profiles fallback
// used elsewhere in the app). Deduped.
async function hostAdminUserIds(hostId: string): Promise<string[]> {
  const admin = createSupabaseAdminClient();
  const [{ data: members }, { data: profiles }] = await Promise.all([
    admin
      .from("host_members")
      .select("user_id")
      .eq("host_id", hostId)
      .eq("role", "host_admin"),
    admin
      .from("profiles")
      .select("id")
      .eq("host_id", hostId)
      .eq("role", "host_admin"),
  ]);
  const ids = new Set<string>();
  for (const m of members ?? []) ids.add(m.user_id);
  for (const p of profiles ?? []) ids.add(p.id);
  return [...ids];
}

// Fan a notification out to every admin of the host: in-app row always,
// plus e-mail / WhatsApp when the channels are configured and the host has
// them enabled. Outbound delivery is best-effort — a provider failure never
// breaks the calling flow.
export async function notifyHostAdmins(input: NotificationInput) {
  const userIds = await hostAdminUserIds(input.hostId);
  if (userIds.length === 0) return;
  const admin = createSupabaseAdminClient();
  await admin.from("notifications").insert(
    userIds.map((userId) => ({
      host_id: input.hostId,
      user_id: userId,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      entity_type: input.entityType ?? null,
      entity_id: input.entityId ?? null,
      action_path: input.actionPath ?? null,
    })),
  );

  if (!emailDeliveryEnabled() && !whatsappDeliveryEnabled()) return;

  const { data: host } = await admin
    .from("hosts")
    .select("name, whatsapp_number, notify_email, notify_whatsapp")
    .eq("id", input.hostId)
    .maybeSingle();
  if (!host) return;

  const text = input.body ? `${input.title}\n${input.body}` : input.title;
  const deliveries: Promise<boolean>[] = [];

  if (host.notify_whatsapp && host.whatsapp_number && whatsappDeliveryEnabled()) {
    deliveries.push(sendWhatsApp({ to: host.whatsapp_number, text }));
  }

  if (host.notify_email !== false && emailDeliveryEnabled()) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("email")
      .in("id", userIds)
      .not("email", "is", null);
    for (const p of profiles ?? []) {
      if (p.email) {
        deliveries.push(
          sendEmail({
            to: p.email,
            subject: `Hosteasy · ${input.title}`,
            text: input.body ?? input.title,
          }),
        );
      }
    }
  }

  await Promise.allSettled(deliveries);
}

// Notify a single user (e.g. a worker who just got a task assigned).
export async function notifyUser(userId: string, input: NotificationInput) {
  const admin = createSupabaseAdminClient();
  await admin.from("notifications").insert({
    host_id: input.hostId,
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body ?? null,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    action_path: input.actionPath ?? null,
  });
}
