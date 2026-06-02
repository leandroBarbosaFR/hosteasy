-- Row Level Security for Hosteasy
-- super_admin: full access
-- host_admin / host_staff: scoped to their host_id
-- host_staff: read everything in scope; restricted from delete/update on sensitive tables
-- Guest tablet flows are server-only (service role) so RLS for the anon role
-- on guest-facing tables is closed by default.

set search_path = public;

-- Helper functions ----------------------------------------------------------

create or replace function auth_role() returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function auth_is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role from profiles where id = auth.uid()) = 'super_admin', false);
$$;

create or replace function auth_host_ids() returns setof uuid
language sql stable security definer set search_path = public as $$
  select host_id from profiles where id = auth.uid() and host_id is not null
  union
  select host_id from host_members where user_id = auth.uid();
$$;

create or replace function auth_is_host_admin_of(target_host uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from host_members
    where user_id = auth.uid() and host_id = target_host and role = 'host_admin'
  ) or exists (
    select 1 from profiles
    where id = auth.uid() and host_id = target_host and role = 'host_admin'
  );
$$;

-- Enable RLS ----------------------------------------------------------------

alter table profiles            enable row level security;
alter table hosts               enable row level security;
alter table host_members        enable row level security;
alter table properties          enable row level security;
alter table tablets             enable row level security;
alter table reservations        enable row level security;
alter table guest_stays         enable row level security;
alter table extras              enable row level security;
alter table extra_orders        enable row level security;
alter table guide_categories    enable row level security;
alter table guide_items         enable row level security;
alter table web_shortcuts       enable row level security;
alter table messages            enable row level security;
alter table message_templates   enable row level security;
alter table audit_logs          enable row level security;

-- profiles ------------------------------------------------------------------

drop policy if exists profiles_select_self_or_admin on profiles;
create policy profiles_select_self_or_admin on profiles
  for select using (
    auth.uid() = id
    or auth_is_super_admin()
    or host_id in (select auth_host_ids())
  );

drop policy if exists profiles_update_self on profiles;
create policy profiles_update_self on profiles
  for update using (auth.uid() = id or auth_is_super_admin())
  with check (auth.uid() = id or auth_is_super_admin());

drop policy if exists profiles_insert_admin on profiles;
create policy profiles_insert_admin on profiles
  for insert with check (auth_is_super_admin() or auth.uid() = id);

drop policy if exists profiles_delete_admin on profiles;
create policy profiles_delete_admin on profiles
  for delete using (auth_is_super_admin());

-- hosts ---------------------------------------------------------------------

drop policy if exists hosts_select on hosts;
create policy hosts_select on hosts
  for select using (
    auth_is_super_admin() or id in (select auth_host_ids())
  );

drop policy if exists hosts_insert on hosts;
create policy hosts_insert on hosts
  for insert with check (auth_is_super_admin());

drop policy if exists hosts_update on hosts;
create policy hosts_update on hosts
  for update using (
    auth_is_super_admin() or auth_is_host_admin_of(id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(id)
  );

drop policy if exists hosts_delete on hosts;
create policy hosts_delete on hosts
  for delete using (auth_is_super_admin());

-- host_members --------------------------------------------------------------

drop policy if exists host_members_select on host_members;
create policy host_members_select on host_members
  for select using (
    auth_is_super_admin()
    or user_id = auth.uid()
    or host_id in (select auth_host_ids())
  );

drop policy if exists host_members_write on host_members;
create policy host_members_write on host_members
  for all using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- Helper macro: scope-by-host_id policies for tables -----------------------
-- We expand inline below because PL/pgSQL doesn't have policy templating.

-- properties ----------------------------------------------------------------

drop policy if exists properties_select on properties;
create policy properties_select on properties
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists properties_insert on properties;
create policy properties_insert on properties
  for insert with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

drop policy if exists properties_update on properties;
create policy properties_update on properties
  for update using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

drop policy if exists properties_delete on properties;
create policy properties_delete on properties
  for delete using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- tablets -------------------------------------------------------------------

drop policy if exists tablets_select on tablets;
create policy tablets_select on tablets
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists tablets_insert on tablets;
create policy tablets_insert on tablets
  for insert with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

drop policy if exists tablets_update on tablets;
create policy tablets_update on tablets
  for update using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  ) with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists tablets_delete on tablets;
create policy tablets_delete on tablets
  for delete using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- reservations --------------------------------------------------------------

drop policy if exists reservations_select on reservations;
create policy reservations_select on reservations
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists reservations_insert on reservations;
create policy reservations_insert on reservations
  for insert with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists reservations_update on reservations;
create policy reservations_update on reservations
  for update using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  ) with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists reservations_delete on reservations;
create policy reservations_delete on reservations
  for delete using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- guest_stays (server-only, no anon access) --------------------------------

drop policy if exists guest_stays_select on guest_stays;
create policy guest_stays_select on guest_stays
  for select using (
    auth_is_super_admin()
    or tablet_id in (select id from tablets where host_id in (select auth_host_ids()))
  );

drop policy if exists guest_stays_write on guest_stays;
create policy guest_stays_write on guest_stays
  for all using (
    auth_is_super_admin()
    or tablet_id in (select id from tablets where host_id in (select auth_host_ids()))
  ) with check (
    auth_is_super_admin()
    or tablet_id in (select id from tablets where host_id in (select auth_host_ids()))
  );

-- extras --------------------------------------------------------------------

drop policy if exists extras_select on extras;
create policy extras_select on extras
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists extras_write on extras;
create policy extras_write on extras
  for all using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- extra_orders --------------------------------------------------------------

drop policy if exists extra_orders_select on extra_orders;
create policy extra_orders_select on extra_orders
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists extra_orders_write on extra_orders;
create policy extra_orders_write on extra_orders
  for all using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  ) with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

-- guide_categories ----------------------------------------------------------

drop policy if exists guide_categories_select on guide_categories;
create policy guide_categories_select on guide_categories
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists guide_categories_write on guide_categories;
create policy guide_categories_write on guide_categories
  for all using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- guide_items ---------------------------------------------------------------

drop policy if exists guide_items_select on guide_items;
create policy guide_items_select on guide_items
  for select using (
    auth_is_super_admin()
    or category_id in (
      select id from guide_categories
      where host_id in (select auth_host_ids())
    )
  );

drop policy if exists guide_items_write on guide_items;
create policy guide_items_write on guide_items
  for all using (
    auth_is_super_admin()
    or category_id in (
      select id from guide_categories
      where host_id in (select auth_host_ids())
    )
  ) with check (
    auth_is_super_admin()
    or category_id in (
      select id from guide_categories
      where host_id in (select auth_host_ids())
    )
  );

-- web_shortcuts -------------------------------------------------------------

drop policy if exists web_shortcuts_select on web_shortcuts;
create policy web_shortcuts_select on web_shortcuts
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists web_shortcuts_write on web_shortcuts;
create policy web_shortcuts_write on web_shortcuts
  for all using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- messages ------------------------------------------------------------------

drop policy if exists messages_select on messages;
create policy messages_select on messages
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists messages_insert on messages;
create policy messages_insert on messages
  for insert with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists messages_update on messages;
create policy messages_update on messages
  for update using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  ) with check (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists messages_delete on messages;
create policy messages_delete on messages
  for delete using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- message_templates ---------------------------------------------------------

drop policy if exists message_templates_select on message_templates;
create policy message_templates_select on message_templates
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists message_templates_write on message_templates;
create policy message_templates_write on message_templates
  for all using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  ) with check (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

-- audit_logs ----------------------------------------------------------------

drop policy if exists audit_logs_select on audit_logs;
create policy audit_logs_select on audit_logs
  for select using (
    auth_is_super_admin() or host_id in (select auth_host_ids())
  );

drop policy if exists audit_logs_insert on audit_logs;
create policy audit_logs_insert on audit_logs
  for insert with check (true);
