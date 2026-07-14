-- Hosteasy Staff Workspace
-- Tasks + comments. The /staff route uses these to coordinate cleaners,
-- maintenance, and other host_staff roles. Host_admin orchestrates; staff
-- executes; messages happen as task comments.

set search_path = public;

-- Enums --------------------------------------------------------------------

do $$ begin
  create type staff_task_status as enum (
    'pending', 'in_progress', 'done', 'blocked', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type staff_task_category as enum (
    'cleaning', 'maintenance', 'supplies', 'check_in', 'check_out', 'other'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type staff_task_priority as enum ('low', 'normal', 'high', 'urgent');
exception when duplicate_object then null; end $$;

-- staff_tasks --------------------------------------------------------------

create table if not exists staff_tasks (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references hosts(id) on delete cascade,
  property_id uuid references properties(id) on delete set null,
  reservation_id uuid references reservations(id) on delete set null,
  assignee_id uuid references profiles(id) on delete set null,
  created_by_id uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  category staff_task_category not null default 'other',
  status staff_task_status not null default 'pending',
  priority staff_task_priority not null default 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_staff_tasks_host on staff_tasks(host_id);
create index if not exists idx_staff_tasks_assignee on staff_tasks(assignee_id);
create index if not exists idx_staff_tasks_property on staff_tasks(property_id);
create index if not exists idx_staff_tasks_status_due on staff_tasks(status, due_at);

drop trigger if exists trg_staff_tasks_updated_at on staff_tasks;
create trigger trg_staff_tasks_updated_at
  before update on staff_tasks
  for each row execute function set_updated_at();

-- staff_task_comments ------------------------------------------------------

create table if not exists staff_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references staff_tasks(id) on delete cascade,
  sender_id uuid references profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_staff_task_comments_task on staff_task_comments(task_id, created_at);

-- RLS ----------------------------------------------------------------------
-- super_admin: full access
-- host_admin: full access for their host
-- host_staff: read/write tasks where they're assignee or creator; comments on those

alter table staff_tasks         enable row level security;
alter table staff_task_comments enable row level security;

drop policy if exists staff_tasks_select on staff_tasks;
create policy staff_tasks_select on staff_tasks
  for select using (
    auth_is_super_admin()
    or auth_is_host_admin_of(host_id)
    or (host_id in (select auth_host_ids()) and (
      assignee_id = auth.uid() or created_by_id = auth.uid()
    ))
  );

drop policy if exists staff_tasks_insert on staff_tasks;
create policy staff_tasks_insert on staff_tasks
  for insert with check (
    auth_is_super_admin()
    or auth_is_host_admin_of(host_id)
    or (host_id in (select auth_host_ids()) and created_by_id = auth.uid())
  );

drop policy if exists staff_tasks_update on staff_tasks;
create policy staff_tasks_update on staff_tasks
  for update using (
    auth_is_super_admin()
    or auth_is_host_admin_of(host_id)
    or (host_id in (select auth_host_ids()) and assignee_id = auth.uid())
  ) with check (
    auth_is_super_admin()
    or auth_is_host_admin_of(host_id)
    or (host_id in (select auth_host_ids()) and assignee_id = auth.uid())
  );

drop policy if exists staff_tasks_delete on staff_tasks;
create policy staff_tasks_delete on staff_tasks
  for delete using (
    auth_is_super_admin() or auth_is_host_admin_of(host_id)
  );

drop policy if exists staff_task_comments_select on staff_task_comments;
create policy staff_task_comments_select on staff_task_comments
  for select using (
    auth_is_super_admin()
    or task_id in (
      select id from staff_tasks
       where auth_is_host_admin_of(host_id)
          or (host_id in (select auth_host_ids()) and (
            assignee_id = auth.uid() or created_by_id = auth.uid()
          ))
    )
  );

drop policy if exists staff_task_comments_insert on staff_task_comments;
create policy staff_task_comments_insert on staff_task_comments
  for insert with check (
    auth_is_super_admin()
    or task_id in (
      select id from staff_tasks
       where auth_is_host_admin_of(host_id)
          or (host_id in (select auth_host_ids()) and (
            assignee_id = auth.uid() or created_by_id = auth.uid()
          ))
    )
  );

-- completed_at auto-fill on status transition -----------------------------

create or replace function staff_tasks_completed_at_trigger() returns trigger
language plpgsql as $$
begin
  if new.status = 'done' and (old.status is null or old.status <> 'done') then
    new.completed_at = now();
  elsif new.status <> 'done' then
    new.completed_at = null;
  end if;
  return new;
end $$;

drop trigger if exists trg_staff_tasks_completed_at on staff_tasks;
create trigger trg_staff_tasks_completed_at
  before insert or update of status on staff_tasks
  for each row execute function staff_tasks_completed_at_trigger();
