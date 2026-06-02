-- Hosteasy initial schema
-- Run with: psql $DATABASE_URL -f supabase/migrations/0001_schema.sql
-- Or via the Supabase CLI: supabase db push

set search_path = public;

create extension if not exists pgcrypto;

-- Enums ---------------------------------------------------------------------

do $$ begin
  create type user_role as enum ('super_admin', 'host_admin', 'host_staff');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tablet_status as enum ('online', 'offline', 'maintenance');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reservation_status as enum ('confirmed', 'in_stay', 'checked_out', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reservation_source as enum ('airbnb', 'booking', 'manual', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type extra_order_status as enum ('pending', 'approved', 'delivered', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type message_sender as enum ('guest', 'host', 'system');
exception when duplicate_object then null; end $$;

-- Tables --------------------------------------------------------------------

create table if not exists hosts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid,
  plan text not null default 'free',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role user_role not null default 'host_admin',
  host_id uuid references hosts(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- host owner FK is added after profiles so we can reference both ways
alter table hosts
  drop constraint if exists hosts_owner_id_fkey,
  add constraint hosts_owner_id_fkey foreign key (owner_id) references profiles(id) on delete set null;

create table if not exists host_members (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('host_admin', 'host_staff')),
  permissions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (host_id, user_id)
);

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  name text not null,
  unit_code text,
  address text,
  city text,
  state text,
  country text,
  cover_image_url text,
  occupancy_rate numeric(5,2),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists tablets (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  tablet_code text not null unique,
  status tablet_status not null default 'offline',
  battery_percent int check (battery_percent between 0 and 100),
  wifi_status text,
  last_seen_at timestamptz,
  settings jsonb not null default jsonb_build_object(
    'language', 'pt-BR',
    'volume', 60,
    'brightness', 70,
    'notifications', true
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  tablet_id uuid references tablets(id) on delete set null,
  guest_name text not null,
  guest_email text,
  guest_phone text,
  check_in date not null,
  check_out date not null,
  nights int generated always as ((check_out - check_in)) stored,
  amount numeric(12,2) not null default 0,
  status reservation_status not null default 'confirmed',
  source reservation_source not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create table if not exists guest_stays (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  tablet_id uuid not null references tablets(id) on delete cascade,
  access_token text not null unique default (
    replace(gen_random_uuid()::text, '-', '')
      || replace(gen_random_uuid()::text, '-', '')
  ),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists extras (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  title text not null,
  description text,
  price numeric(12,2) not null default 0,
  icon text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists extra_orders (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  reservation_id uuid not null references reservations(id) on delete cascade,
  extra_id uuid not null references extras(id) on delete restrict,
  quantity int not null default 1 check (quantity > 0),
  total numeric(12,2) not null default 0,
  status extra_order_status not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists guide_categories (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  title text not null,
  subtitle text,
  icon text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists guide_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references guide_categories(id) on delete cascade,
  title text not null,
  content text,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists web_shortcuts (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid references properties(id) on delete cascade,
  label text not null,
  url text not null,
  icon_letter text,
  color text,
  sort_order int not null default 0,
  active boolean not null default true
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  reservation_id uuid references reservations(id) on delete cascade,
  tablet_id uuid references tablets(id) on delete set null,
  sender_type message_sender not null,
  sender_id uuid,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  title text not null,
  body text not null,
  type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  host_id uuid references hosts(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Indexes -------------------------------------------------------------------

create index if not exists idx_profiles_host_id on profiles(host_id);
create index if not exists idx_host_members_host on host_members(host_id);
create index if not exists idx_host_members_user on host_members(user_id);
create index if not exists idx_properties_host on properties(host_id);
create index if not exists idx_tablets_host on tablets(host_id);
create index if not exists idx_tablets_property on tablets(property_id);
create index if not exists idx_reservations_host on reservations(host_id);
create index if not exists idx_reservations_property on reservations(property_id);
create index if not exists idx_reservations_tablet on reservations(tablet_id);
create index if not exists idx_reservations_check_in on reservations(check_in);
create index if not exists idx_guest_stays_token on guest_stays(access_token);
create index if not exists idx_guest_stays_tablet on guest_stays(tablet_id);
create index if not exists idx_extras_host on extras(host_id);
create index if not exists idx_extra_orders_host on extra_orders(host_id);
create index if not exists idx_extra_orders_reservation on extra_orders(reservation_id);
create index if not exists idx_guide_categories_property on guide_categories(property_id);
create index if not exists idx_guide_items_category on guide_items(category_id);
create index if not exists idx_messages_host on messages(host_id);
create index if not exists idx_messages_tablet on messages(tablet_id);
create index if not exists idx_messages_reservation on messages(reservation_id);
create index if not exists idx_messages_created_at on messages(created_at desc);

-- updated_at triggers -------------------------------------------------------

create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','hosts','properties','tablets','reservations',
    'extras','guide_items','message_templates'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on %1$s;
       create trigger trg_%1$s_updated_at before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- Auto-create profile on auth signup ----------------------------------------
-- New users land as host_admin without a host. The signup flow attaches a host.

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
