-- Hosteasy Host ROI Engine
-- iCal sync, revenue-first extras, late checkout, review boost,
-- beta tracking, host PIX details.

set search_path = public;

-- Enums --------------------------------------------------------------------

do $$ begin
  create type reservation_source_type as enum ('airbnb','booking','other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type extra_category as enum (
    'late_checkout','breakfast','transfer','welcome_basket','groceries','custom'
  );
exception when duplicate_object then null; end $$;

-- Extend extra_order_status (additive enum values)
do $$ begin
  alter type extra_order_status add value if not exists 'pending_payment';
exception when others then null; end $$;
do $$ begin
  alter type extra_order_status add value if not exists 'paid';
exception when others then null; end $$;

-- reservations: ical metadata ----------------------------------------------

alter table reservations
  add column if not exists source_uid text,
  add column if not exists source_reservation_id text,
  add column if not exists imported_from_ical boolean not null default false,
  add column if not exists last_synced_at timestamptz;

create unique index if not exists ux_reservations_source_uid_property
  on reservations(property_id, source_uid)
  where source_uid is not null;

-- reservation_sources -----------------------------------------------------

create table if not exists reservation_sources (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  source_type reservation_source_type not null,
  source_name text,
  ical_url text not null,
  is_active boolean not null default true,
  last_synced_at timestamptz,
  last_sync_status text,
  last_sync_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_reservation_sources_property
  on reservation_sources(property_id);
create unique index if not exists ux_reservation_sources_url
  on reservation_sources(property_id, ical_url);

drop trigger if exists trg_reservation_sources_updated_at on reservation_sources;
create trigger trg_reservation_sources_updated_at
  before update on reservation_sources
  for each row execute function set_updated_at();

-- properties: late checkout + review links + beta ------------------------

alter table properties
  add column if not exists late_checkout_enabled boolean not null default false,
  add column if not exists late_checkout_price numeric(12,2),
  add column if not exists late_checkout_until text default '16:00',
  add column if not exists review_link_airbnb text,
  add column if not exists review_link_booking text,
  add column if not exists review_link_google text,
  add column if not exists beta_test boolean not null default false;

-- hosts: beta flag + PIX details ------------------------------------------

alter table hosts
  add column if not exists beta_test boolean not null default false,
  add column if not exists pix_key text,
  add column if not exists pix_instructions text;

-- extras: category + image ------------------------------------------------

alter table extras
  add column if not exists category extra_category not null default 'custom',
  add column if not exists image_url text;

-- review_requests ----------------------------------------------------------

create table if not exists review_requests (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid not null references properties(id) on delete cascade,
  reservation_id uuid references reservations(id) on delete set null,
  tablet_id uuid references tablets(id) on delete set null,
  rating int check (rating between 1 and 5),
  public_link_clicked text,
  private_feedback text,
  created_at timestamptz not null default now()
);

create index if not exists idx_review_requests_host on review_requests(host_id);
create index if not exists idx_review_requests_property on review_requests(property_id);
create index if not exists idx_review_requests_created on review_requests(created_at desc);

-- RLS ---------------------------------------------------------------------

alter table reservation_sources enable row level security;
alter table review_requests     enable row level security;

drop policy if exists reservation_sources_select on reservation_sources;
create policy reservation_sources_select on reservation_sources
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists reservation_sources_write on reservation_sources;
create policy reservation_sources_write on reservation_sources
  for all using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

drop policy if exists review_requests_select on review_requests;
create policy review_requests_select on review_requests
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

-- Inserts come from the unauthenticated tablet via the service-role client
-- (guest tablet flows bypass RLS server-side). Lock anon writes anyway.
drop policy if exists review_requests_insert on review_requests;
create policy review_requests_insert on review_requests
  for insert with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists review_requests_update on review_requests;
create policy review_requests_update on review_requests
  for update using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  ) with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

-- Storage bucket for extras images ----------------------------------------
-- Public-readable so the tablet anon client can render <img src>.

insert into storage.buckets (id, name, public, file_size_limit)
values ('extras', 'extras', true, 5242880)  -- 5 MB
on conflict (id) do nothing;

do $$
begin
  -- public read
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'extras_public_read'
  ) then
    create policy extras_public_read on storage.objects
      for select using (bucket_id = 'extras');
  end if;
  -- authenticated upload
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'extras_authenticated_write'
  ) then
    create policy extras_authenticated_write on storage.objects
      for insert with check (
        bucket_id = 'extras' and auth.role() = 'authenticated'
      );
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'extras_authenticated_update'
  ) then
    create policy extras_authenticated_update on storage.objects
      for update using (
        bucket_id = 'extras' and auth.role() = 'authenticated'
      );
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'extras_authenticated_delete'
  ) then
    create policy extras_authenticated_delete on storage.objects
      for delete using (
        bucket_id = 'extras' and auth.role() = 'authenticated'
      );
  end if;
end $$;
