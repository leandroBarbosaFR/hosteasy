-- Hosteasy Delivery & Payments
-- Notification delivery preferences (e-mail / WhatsApp), default cleaner per
-- property (cleaning auto-assignment), PIX payment fields on extra orders,
-- realtime publication for chat/notifications, property cover bucket.

set search_path = public;

-- hosts: notification delivery ------------------------------------------------

alter table hosts
  add column if not exists whatsapp_number text,
  add column if not exists notify_email boolean not null default true,
  add column if not exists notify_whatsapp boolean not null default true;

-- properties: default cleaner for auto-assignment -----------------------------

alter table properties
  add column if not exists default_cleaner_id uuid references profiles(id) on delete set null;

-- extra_orders: PIX payment metadata (Mercado Pago) ---------------------------

alter table extra_orders
  add column if not exists payment_provider text,
  add column if not exists payment_id text,
  add column if not exists payment_qr text,
  add column if not exists payment_qr_base64 text,
  add column if not exists payment_expires_at timestamptz;

create index if not exists idx_extra_orders_payment_id
  on extra_orders(payment_id) where payment_id is not null;

-- Realtime: stream chat + notifications to the dashboard ----------------------
-- The supabase_realtime publication only exists on hosted Supabase; guard so
-- the migration also runs on plain Postgres (tests, CI).

do $$
begin
  begin
    alter publication supabase_realtime add table messages;
  exception when undefined_object then null;
           when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table staff_messages;
  exception when undefined_object then null;
           when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table notifications;
  exception when undefined_object then null;
           when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table staff_tasks;
  exception when undefined_object then null;
           when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table staff_task_comments;
  exception when undefined_object then null;
           when duplicate_object then null;
  end;
end $$;

-- Storage bucket for property cover images ------------------------------------

insert into storage.buckets (id, name, public, file_size_limit)
values ('properties', 'properties', true, 5242880)  -- 5 MB
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'properties_public_read'
  ) then
    create policy properties_public_read on storage.objects
      for select using (bucket_id = 'properties');
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'properties_authenticated_write'
  ) then
    create policy properties_authenticated_write on storage.objects
      for insert with check (
        bucket_id = 'properties' and auth.role() = 'authenticated'
      );
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'properties_authenticated_update'
  ) then
    create policy properties_authenticated_update on storage.objects
      for update using (
        bucket_id = 'properties' and auth.role() = 'authenticated'
      );
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'properties_authenticated_delete'
  ) then
    create policy properties_authenticated_delete on storage.objects
      for delete using (
        bucket_id = 'properties' and auth.role() = 'authenticated'
      );
  end if;
end $$;
