// Spin up an in-process Postgres (pglite WASM) and apply 0001 + 0002 + 0003.
// No Docker, no external services. Proves the migration SQL parses and runs
// against a real Postgres engine.

import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
await db.waitReady;

// pglite doesn't ship the auth schema / functions Supabase relies on, so we
// stub the bits the migrations use.
const supabaseShim = `
  create schema if not exists auth;
  create schema if not exists storage;

  create table if not exists auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb default '{}'::jsonb,
    created_at timestamptz default now()
  );

  create or replace function auth.uid() returns uuid language sql stable as $$
    select null::uuid;
  $$;

  create or replace function auth.role() returns text language sql stable as $$
    select 'authenticated'::text;
  $$;

  create table if not exists storage.buckets (
    id text primary key,
    name text,
    public boolean default false,
    file_size_limit bigint
  );

  create table if not exists storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets(id),
    name text,
    owner uuid,
    created_at timestamptz default now()
  );
`;

async function run(label, sql) {
  const started = Date.now();
  try {
    await db.exec(sql);
    console.log(`OK  ${label} (${Date.now() - started}ms)`);
    return true;
  } catch (err) {
    console.error(`ERR ${label}: ${err.message}`);
    return false;
  }
}

console.log("== Setting up Supabase auth/storage shims ==");
if (!(await run("supabase shim", supabaseShim))) process.exit(1);

const migrations = [
  ["0001_schema.sql", "supabase/migrations/0001_schema.sql"],
  ["0002_rls.sql", "supabase/migrations/0002_rls.sql"],
  ["0003_roi_engine.sql", "supabase/migrations/0003_roi_engine.sql"],
];

console.log("\n== Applying migrations ==");
let allOk = true;
for (const [label, path] of migrations) {
  let sql = readFileSync(path, "utf8");
  // pglite doesn't ship pgcrypto, but gen_random_uuid() is built-in to PG13+.
  // We only need to skip the "create extension" line for the test harness.
  sql = sql.replace(/create extension if not exists pgcrypto\s*;?/gi, "");
  if (!(await run(label, sql))) allOk = false;
}

if (!allOk) {
  console.error("\n!! One or more migrations failed.");
  process.exit(1);
}

console.log("\n== Inspecting the schema ==");

const tables = await db.query(`
  select table_name from information_schema.tables
   where table_schema = 'public'
   order by table_name
`);
console.log("Public tables:", tables.rows.map((r) => r.table_name).join(", "));

const props = await db.query(`
  select column_name, data_type
    from information_schema.columns
   where table_schema = 'public' and table_name = 'properties'
     and column_name in (
       'late_checkout_enabled','late_checkout_price','late_checkout_until',
       'review_link_airbnb','review_link_booking','review_link_google',
       'beta_test'
     )
   order by column_name
`);
console.log("\nproperties.new_cols:");
console.table(props.rows);

const hosts = await db.query(`
  select column_name, data_type
    from information_schema.columns
   where table_schema = 'public' and table_name = 'hosts'
     and column_name in ('beta_test','pix_key','pix_instructions')
   order by column_name
`);
console.log("hosts.new_cols:");
console.table(hosts.rows);

const reservations = await db.query(`
  select column_name, data_type
    from information_schema.columns
   where table_schema = 'public' and table_name = 'reservations'
     and column_name in (
       'source_uid','source_reservation_id','imported_from_ical','last_synced_at'
     )
   order by column_name
`);
console.log("reservations.new_cols:");
console.table(reservations.rows);

const extras = await db.query(`
  select column_name, data_type
    from information_schema.columns
   where table_schema = 'public' and table_name = 'extras'
     and column_name in ('category','image_url')
   order by column_name
`);
console.log("extras.new_cols:");
console.table(extras.rows);

const rs = await db.query(`
  select column_name, data_type, is_nullable
    from information_schema.columns
   where table_schema = 'public' and table_name = 'reservation_sources'
   order by ordinal_position
`);
console.log("\nreservation_sources schema:");
console.table(rs.rows);

const rr = await db.query(`
  select column_name, data_type, is_nullable
    from information_schema.columns
   where table_schema = 'public' and table_name = 'review_requests'
   order by ordinal_position
`);
console.log("review_requests schema:");
console.table(rr.rows);

const enums = await db.query(`
  select t.typname as enum_name, e.enumlabel as value
    from pg_type t
    join pg_enum e on e.enumtypid = t.oid
   where t.typname in (
     'user_role','tablet_status','reservation_status','reservation_source',
     'reservation_source_type','extra_category','extra_order_status','message_sender'
   )
   order by t.typname, e.enumsortorder
`);
const grouped = {};
for (const row of enums.rows) {
  (grouped[row.enum_name] ??= []).push(row.value);
}
console.log("\nEnums:");
for (const [name, values] of Object.entries(grouped)) {
  console.log(`  ${name}: ${values.join(", ")}`);
}

const indexes = await db.query(`
  select indexname from pg_indexes
   where schemaname = 'public'
     and indexname in (
       'ux_reservations_source_uid_property',
       'ux_reservation_sources_url',
       'idx_reservation_sources_property',
       'idx_review_requests_host'
     )
   order by indexname
`);
console.log("\nKey indexes present:", indexes.rows.map((r) => r.indexname).join(", "));

console.log("\n== All three migrations applied cleanly against a real Postgres engine. ==");
await db.close();
