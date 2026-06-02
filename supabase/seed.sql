-- Hosteasy seed data
-- Run AFTER creating a Supabase auth user for Leandro and noting the user id.
-- See README.md "Seeding" for the exact steps.
--
-- Usage:
--   psql $DATABASE_URL \
--     -v owner_user_id="'00000000-0000-0000-0000-000000000000'" \
--     -f supabase/seed.sql
--
-- If you pass no owner_user_id, the script will skip linking the host owner
-- to a real auth user and the dashboards won't load until you log in as a
-- real user and run the SQL in the README to attach yourself.

set search_path = public;

\if :{?owner_user_id}
\else
\set owner_user_id NULL
\endif

-- Host ----------------------------------------------------------------------

insert into hosts (id, name, plan, status)
values ('11111111-1111-1111-1111-111111111111', 'Leandro · Floripa', 'pro', 'active')
on conflict (id) do nothing;

-- Optional: link Leandro's profile to the host as host_admin / super_admin
do $$
declare uid uuid := nullif(:'owner_user_id', 'NULL')::uuid;
begin
  if uid is not null then
    update profiles
      set role = 'super_admin', host_id = '11111111-1111-1111-1111-111111111111', full_name = coalesce(full_name, 'Leandro')
      where id = uid;
    update hosts set owner_id = uid where id = '11111111-1111-1111-1111-111111111111';
    insert into host_members (host_id, user_id, role)
      values ('11111111-1111-1111-1111-111111111111', uid, 'host_admin')
      on conflict do nothing;
  end if;
end $$;

-- Properties ----------------------------------------------------------------

insert into properties (id, host_id, name, unit_code, address, city, state, country, occupancy_rate, status)
values
  ('22222222-2222-2222-2222-222222220102', '11111111-1111-1111-1111-111111111111', 'Vilas do Luiz · 102', '102', 'Rua dos Pescadores, 102', 'Florianópolis', 'SC', 'BR', 87.0, 'active'),
  ('22222222-2222-2222-2222-222222220304', '11111111-1111-1111-1111-111111111111', 'Vilas do Luiz · 304', '304', 'Rua dos Pescadores, 304', 'Florianópolis', 'SC', 'BR', 82.0, 'active'),
  ('22222222-2222-2222-2222-22222222a012', '11111111-1111-1111-1111-111111111111', 'Costa Azul · A12',    'A12', 'Av. das Rendeiras, A12',     'Florianópolis', 'SC', 'BR', 91.0, 'active')
on conflict (id) do nothing;

-- Tablets -------------------------------------------------------------------

insert into tablets (id, host_id, property_id, tablet_code, status, battery_percent, wifi_status, last_seen_at)
values
  ('33333333-3333-3333-3333-333333330102', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222220102', 'TAB-102', 'online',  82, 'connected',    now()),
  ('33333333-3333-3333-3333-333333330304', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222220304', 'TAB-304', 'online',  64, 'connected',    now() - interval '2 minutes'),
  ('33333333-3333-3333-3333-33333333a012', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-22222222a012', 'TAB-A12', 'offline', 12, 'disconnected', now() - interval '1 hour')
on conflict (id) do nothing;

-- Reservations --------------------------------------------------------------

insert into reservations (id, host_id, property_id, tablet_id, guest_name, guest_email, guest_phone, check_in, check_out, amount, status, source)
values
  ('44444444-4444-4444-4444-444444440001', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222220102', '33333333-3333-3333-3333-333333330102', 'Marina Souza',    'marina@example.com', '+5548999110001', current_date,         current_date + 3, 1620, 'in_stay',     'airbnb'),
  ('44444444-4444-4444-4444-444444440002', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-22222222a012', '33333333-3333-3333-3333-33333333a012', 'Tiago Lima',      'tiago@example.com',  '+5548999110002', current_date,         current_date + 2, 980,  'confirmed',   'booking'),
  ('44444444-4444-4444-4444-444444440003', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222220304', '33333333-3333-3333-3333-333333330304', 'Família Oliveira','familia@example.com','+5548999110003', current_date + 1,     current_date + 5, 2400, 'confirmed',   'airbnb'),
  ('44444444-4444-4444-4444-444444440004', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-22222222a012', null,                                    'Ana Pereira',     'ana@example.com',    '+5548999110004', current_date - 4,     current_date + 1, 1450, 'in_stay',     'manual')
on conflict (id) do nothing;

-- Guest stays (active tokens) ----------------------------------------------

insert into guest_stays (reservation_id, tablet_id, active, expires_at)
select r.id, r.tablet_id, true, (r.check_out + 1) :: timestamptz
from reservations r
where r.status in ('confirmed', 'in_stay')
  and r.tablet_id is not null
on conflict do nothing;

-- Extras --------------------------------------------------------------------

insert into extras (id, host_id, property_id, title, description, price, icon, active)
values
  ('55555555-5555-5555-5555-555555550001', '11111111-1111-1111-1111-111111111111', null, 'Café da manhã',       'Tabuleiro com pães, frutas e suco entregue na porta às 9h.',    35,  'coffee',    true),
  ('55555555-5555-5555-5555-555555550002', '11111111-1111-1111-1111-111111111111', null, 'Late check-out',      'Estendemos a saída até as 16h, sujeito à disponibilidade.',     90,  'clock',     true),
  ('55555555-5555-5555-5555-555555550003', '11111111-1111-1111-1111-111111111111', null, 'Transfer aeroporto',  'Carro privativo direto ao Hercílio Luz, até 4 pessoas.',        120, 'car',       true),
  ('55555555-5555-5555-5555-555555550004', '11111111-1111-1111-1111-111111111111', null, 'Compras prontas',     'Lista de mercado feita pelo nosso time para chegar e usar.',    60,  'basket',    true)
on conflict (id) do nothing;

-- Guide categories + items per property ------------------------------------

do $$
declare p record;
declare cat_id uuid;
begin
  for p in select id from properties where host_id = '11111111-1111-1111-1111-111111111111' loop
    insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
    values
      ('11111111-1111-1111-1111-111111111111', p.id, 'Wi-Fi & senha',     'Internet de 300 Mbps', 'wifi',         0)
    on conflict do nothing
    returning id into cat_id;
    if cat_id is not null then
      insert into guide_items (category_id, title, content, sort_order) values
        (cat_id, 'Rede',  'Hosteasy_Guest',                                     0),
        (cat_id, 'Senha', 'floripa-bemvindo-2026',                              1),
        (cat_id, 'Dica',  'Caso o sinal caia, o roteador fica atrás da TV.',    2);
    end if;
    cat_id := null;

    insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
    values ('11111111-1111-1111-1111-111111111111', p.id, 'Cozinha equipada', 'Fogão, forno e cafeteira', 'utensils', 1)
    on conflict do nothing returning id into cat_id;
    if cat_id is not null then
      insert into guide_items (category_id, title, content, sort_order) values
        (cat_id, 'Café',        'Cafeteira italiana no armário acima da pia. Pó na lata azul.', 0),
        (cat_id, 'Fogão',       'Acendimento automático, gire devagar até clicar.',            1),
        (cat_id, 'Louças',      'Máquina de lavar louça embaixo da pia. Pastilhas no nicho.',  2);
    end if;
    cat_id := null;

    insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
    values ('11111111-1111-1111-1111-111111111111', p.id, 'Ar-condicionado', 'Split frio/quente', 'snowflake', 2)
    on conflict do nothing returning id into cat_id;
    if cat_id is not null then
      insert into guide_items (category_id, title, content, sort_order) values
        (cat_id, 'Liga/desliga', 'Botão grande no controle. Modo automático recomendado para 23°C.', 0),
        (cat_id, 'Dorminhoco',   'Pressione "Sleep" antes de dormir para reduzir o ruído.',          1);
    end if;
    cat_id := null;

    insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
    values ('11111111-1111-1111-1111-111111111111', p.id, 'Check-out', 'Como deixar o imóvel', 'log-out', 3)
    on conflict do nothing returning id into cat_id;
    if cat_id is not null then
      insert into guide_items (category_id, title, content, sort_order) values
        (cat_id, 'Horário',  'Saída até 11h. Late check-out disponível em extras.', 0),
        (cat_id, 'Lixo',     'Deixar sacos no corredor de serviço antes de sair.',  1),
        (cat_id, 'Chaves',   'Pode deixar em cima do balcão. Avisar pelo tablet.',  2);
    end if;
    cat_id := null;
  end loop;
end $$;

-- Web shortcuts -------------------------------------------------------------

insert into web_shortcuts (host_id, property_id, label, url, icon_letter, color, sort_order, active)
values
  ('11111111-1111-1111-1111-111111111111', null, 'Airbnb',    'https://airbnb.com',    'A', '#FF5A5F', 0, true),
  ('11111111-1111-1111-1111-111111111111', null, 'Booking',   'https://booking.com',   'B', '#003580', 1, true),
  ('11111111-1111-1111-1111-111111111111', null, 'Maps',      'https://maps.google.com','M','#4285F4', 2, true),
  ('11111111-1111-1111-1111-111111111111', null, 'iFood',     'https://ifood.com.br',  'I', '#EA1D2C', 3, true),
  ('11111111-1111-1111-1111-111111111111', null, 'Uber',      'https://uber.com',      'U', '#000000', 4, true),
  ('11111111-1111-1111-1111-111111111111', null, 'WhatsApp',  'https://web.whatsapp.com','W','#25D366',5, true),
  ('11111111-1111-1111-1111-111111111111', null, 'YouTube',   'https://youtube.com',   'Y', '#FF0000', 6, true),
  ('11111111-1111-1111-1111-111111111111', null, 'Notícias',  'https://g1.globo.com',  'N', '#1F2937', 7, true)
on conflict do nothing;

-- Message templates --------------------------------------------------------

insert into message_templates (host_id, title, body, type) values
  ('11111111-1111-1111-1111-111111111111', 'Boas-vindas',  'Olá! Tudo certo com a chegada? Estamos por aqui se precisar.', 'check_in'),
  ('11111111-1111-1111-1111-111111111111', 'Wi-Fi',        'Rede: Hosteasy_Guest · Senha: floripa-bemvindo-2026',          'wifi'),
  ('11111111-1111-1111-1111-111111111111', 'Check-out',    'A saída é até as 11h. Pode deixar as chaves no balcão.',       'check_out')
on conflict do nothing;

-- Demo messages -------------------------------------------------------------

insert into messages (host_id, reservation_id, tablet_id, sender_type, body, created_at)
values
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330102', 'guest', 'Posso fazer early check-in? Chegamos antes das 14h 🙏', now() - interval '12 minutes'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330102', 'host',  'Oi Marina! Consigo liberar às 13h, pode vir.',          now() - interval '6 minutes'),
  ('11111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-33333333a012', 'guest', 'Onde fica o roteador? O sinal caiu rapidinho.',         now() - interval '2 hours')
on conflict do nothing;
