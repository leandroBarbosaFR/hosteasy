-- Hosteasy Ops Suite
-- Worker specialties, host <-> staff direct chat, inventory/stock control,
-- and in-app notifications (new reservations, low stock, task assignments).

set search_path = public;

-- Enums ----------------------------------------------------------------------

do $$ begin
  create type worker_specialty as enum (
    'cleaning', 'maintenance', 'painting', 'laundry', 'gardening', 'pool', 'general'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_category as enum (
    'amenities', 'cleaning_supplies', 'linens', 'kitchen', 'maintenance', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type inventory_movement_reason as enum (
    'restock', 'consumption', 'count', 'adjustment'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'new_reservation', 'low_stock', 'new_order', 'guest_message',
    'task_assigned', 'sync_error', 'other'
  );
exception when duplicate_object then null; end $$;

-- host_members: what kind of worker this member is ---------------------------

alter table host_members
  add column if not exists specialty worker_specialty not null default 'general';

-- staff_messages: direct messages between members of the same host -----------

create table if not exists staff_messages (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index if not exists idx_staff_messages_host on staff_messages(host_id);
create index if not exists idx_staff_messages_pair
  on staff_messages(host_id, sender_id, recipient_id, created_at);
create index if not exists idx_staff_messages_recipient_unread
  on staff_messages(recipient_id) where read_at is null;

-- inventory_items -------------------------------------------------------------

create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  name text not null,
  category inventory_category not null default 'other',
  unit text not null default 'un',
  current_qty numeric(10,2) not null default 0,
  min_qty numeric(10,2) not null default 0,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_inventory_items_host on inventory_items(host_id);
create index if not exists idx_inventory_items_property on inventory_items(property_id);

drop trigger if exists trg_inventory_items_updated_at on inventory_items;
create trigger trg_inventory_items_updated_at
  before update on inventory_items
  for each row execute function set_updated_at();

-- inventory_movements ---------------------------------------------------------
-- Every stock change is a movement. `delta` is the signed change; the trigger
-- below clamps the resulting quantity at zero and keeps the item in sync so
-- concurrent reports can't drift the running total.

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references inventory_items(id) on delete cascade,
  host_id uuid not null references hosts(id) on delete cascade,
  delta numeric(10,2) not null,
  qty_after numeric(10,2) not null default 0,
  reason inventory_movement_reason not null,
  task_id uuid references staff_tasks(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_inventory_movements_item
  on inventory_movements(item_id, created_at desc);
create index if not exists idx_inventory_movements_host
  on inventory_movements(host_id, created_at desc);

create or replace function apply_inventory_movement() returns trigger
language plpgsql as $$
declare cur numeric(10,2);
begin
  select current_qty into cur from inventory_items
   where id = new.item_id for update;
  if cur is null then
    raise exception 'inventory item % not found', new.item_id;
  end if;
  new.qty_after = greatest(0, cur + new.delta);
  update inventory_items set current_qty = new.qty_after
   where id = new.item_id;
  return new;
end $$;

drop trigger if exists trg_apply_inventory_movement on inventory_movements;
create trigger trg_apply_inventory_movement
  before insert on inventory_movements
  for each row execute function apply_inventory_movement();

-- notifications ----------------------------------------------------------------

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null default 'other',
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  action_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user
  on notifications(user_id, created_at desc);
create index if not exists idx_notifications_user_unread
  on notifications(user_id) where read_at is null;

-- RLS --------------------------------------------------------------------------

alter table staff_messages      enable row level security;
alter table inventory_items     enable row level security;
alter table inventory_movements enable row level security;
alter table notifications       enable row level security;

-- staff_messages: private between the two people; scoped to the host.

drop policy if exists staff_messages_select on staff_messages;
create policy staff_messages_select on staff_messages
  for select using (
    auth_is_super_admin()
    or (host_id in (select auth_host_ids())
        and (sender_id = auth.uid() or recipient_id = auth.uid()))
  );

drop policy if exists staff_messages_insert on staff_messages;
create policy staff_messages_insert on staff_messages
  for insert with check (
    auth_is_super_admin()
    or (sender_id = auth.uid()
        and host_id in (select auth_host_ids())
        and (
          recipient_id in (select user_id from host_members where host_id = staff_messages.host_id)
          or recipient_id in (select id from profiles where host_id = staff_messages.host_id)
        ))
  );

-- Only the recipient marks a message as read.
drop policy if exists staff_messages_update on staff_messages;
create policy staff_messages_update on staff_messages
  for update using (recipient_id = auth.uid() or auth_is_super_admin())
  with check (recipient_id = auth.uid() or auth_is_super_admin());

-- inventory_items: everyone in the host reads; admins create/delete;
-- any member may update (cleaners adjust quantities during counts).

drop policy if exists inventory_items_select on inventory_items;
create policy inventory_items_select on inventory_items
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists inventory_items_insert on inventory_items;
create policy inventory_items_insert on inventory_items
  for insert with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

drop policy if exists inventory_items_update on inventory_items;
create policy inventory_items_update on inventory_items
  for update using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  ) with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists inventory_items_delete on inventory_items;
create policy inventory_items_delete on inventory_items
  for delete using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- inventory_movements: append-only log, whole host can read and write.

drop policy if exists inventory_movements_select on inventory_movements;
create policy inventory_movements_select on inventory_movements
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists inventory_movements_insert on inventory_movements;
create policy inventory_movements_insert on inventory_movements
  for insert with check (
    auth_is_super_admin()
    or (host_id in (select auth_host_ids()) and created_by = auth.uid())
  );

-- notifications: each user sees and updates only their own. Inserts come from
-- server flows (service role) or from members targeting users of their host.

drop policy if exists notifications_select on notifications;
create policy notifications_select on notifications
  for select using (user_id = auth.uid() or auth_is_super_admin());

drop policy if exists notifications_update on notifications;
create policy notifications_update on notifications
  for update using (user_id = auth.uid() or auth_is_super_admin())
  with check (user_id = auth.uid() or auth_is_super_admin());

drop policy if exists notifications_insert on notifications;
create policy notifications_insert on notifications
  for insert with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists notifications_delete on notifications;
create policy notifications_delete on notifications
  for delete using (user_id = auth.uid() or auth_is_super_admin());
