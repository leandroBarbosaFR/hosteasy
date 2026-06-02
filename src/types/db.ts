// Hand-rolled DB types matching supabase/migrations/0001_schema.sql.
// Regenerate with `supabase gen types typescript --local > src/types/db.ts`
// once you have a Supabase project linked.

export type UserRole = "super_admin" | "host_admin" | "host_staff";
export type TabletStatus = "online" | "offline" | "maintenance";
export type ReservationStatus =
  | "confirmed"
  | "in_stay"
  | "checked_out"
  | "cancelled";
export type ReservationSource = "airbnb" | "booking" | "manual" | "other";
export type ExtraOrderStatus =
  | "pending"
  | "approved"
  | "delivered"
  | "cancelled";
export type MessageSender = "guest" | "host" | "system";

export type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  host_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Host = {
  id: string;
  name: string;
  owner_id: string | null;
  plan: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type HostMember = {
  id: string;
  host_id: string;
  user_id: string;
  role: "host_admin" | "host_staff";
  permissions: Record<string, unknown>;
  created_at: string;
};

export type Property = {
  id: string;
  host_id: string;
  name: string;
  unit_code: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  cover_image_url: string | null;
  occupancy_rate: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type TabletSettings = {
  language: string;
  volume: number;
  brightness: number;
  notifications: boolean;
};

export type Tablet = {
  id: string;
  host_id: string;
  property_id: string | null;
  tablet_code: string;
  status: TabletStatus;
  battery_percent: number | null;
  wifi_status: string | null;
  last_seen_at: string | null;
  settings: TabletSettings;
  created_at: string;
  updated_at: string;
};

export type Reservation = {
  id: string;
  host_id: string;
  property_id: string;
  tablet_id: string | null;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  check_in: string;
  check_out: string;
  nights: number;
  amount: number;
  status: ReservationStatus;
  source: ReservationSource;
  created_at: string;
  updated_at: string;
};

export type GuestStay = {
  id: string;
  reservation_id: string;
  tablet_id: string;
  access_token: string;
  active: boolean;
  created_at: string;
  expires_at: string | null;
};

export type Extra = {
  id: string;
  host_id: string;
  property_id: string | null;
  title: string;
  description: string | null;
  price: number;
  icon: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ExtraOrder = {
  id: string;
  host_id: string;
  reservation_id: string;
  extra_id: string;
  quantity: number;
  total: number;
  status: ExtraOrderStatus;
  created_at: string;
};

export type GuideCategory = {
  id: string;
  host_id: string;
  property_id: string;
  title: string;
  subtitle: string | null;
  icon: string | null;
  sort_order: number;
  created_at: string;
};

export type GuideItem = {
  id: string;
  category_id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WebShortcut = {
  id: string;
  host_id: string;
  property_id: string | null;
  label: string;
  url: string;
  icon_letter: string | null;
  color: string | null;
  sort_order: number;
  active: boolean;
};

export type Message = {
  id: string;
  host_id: string;
  reservation_id: string | null;
  tablet_id: string | null;
  sender_type: MessageSender;
  sender_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type MessageTemplate = {
  id: string;
  host_id: string;
  title: string;
  body: string;
  type: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  actor_id: string | null;
  host_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

// Minimal supabase-js compatible Database type ------------------------------

type Row<T> = {
  Row: T;
  Insert: Partial<T>;
  Update: Partial<T>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      profiles: Row<Profile>;
      hosts: Row<Host>;
      host_members: Row<HostMember>;
      properties: Row<Property>;
      tablets: Row<Tablet>;
      reservations: Row<Reservation>;
      guest_stays: Row<GuestStay>;
      extras: Row<Extra>;
      extra_orders: Row<ExtraOrder>;
      guide_categories: Row<GuideCategory>;
      guide_items: Row<GuideItem>;
      web_shortcuts: Row<WebShortcut>;
      messages: Row<Message>;
      message_templates: Row<MessageTemplate>;
      audit_logs: Row<AuditLog>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      tablet_status: TabletStatus;
      reservation_status: ReservationStatus;
      reservation_source: ReservationSource;
      extra_order_status: ExtraOrderStatus;
      message_sender: MessageSender;
    };
  };
};
