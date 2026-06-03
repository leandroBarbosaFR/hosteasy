-- Hosteasy seed for the Supabase SQL Editor (dashboard).
--
-- BEFORE RUNNING:
--   1. In Supabase dashboard → Authentication → Users → "Add user" →
--      "Create new user".
--      - Email:    leandro@hosteasy.com
--      - Password: hosteasy123
--      - Check "Auto Confirm User" so you can log in immediately.
--   2. Paste this entire file into the SQL Editor and Run.
--
-- The script promotes leandro@hosteasy.com to super_admin and seeds the
-- host, properties, tablets, reservations, extras, guides, shortcuts,
-- templates, and demo messages.

do $$
declare
  uid uuid;
  host_uuid uuid := '11111111-1111-1111-1111-111111111111';
  p record;
  cat_id uuid;
begin

-- Resolve auth user --------------------------------------------------------

select id into uid
  from auth.users
 where email = 'leandro@hosteasy.com'
 limit 1;

if uid is null then
  raise exception
    'Auth user leandro@hosteasy.com not found. Create it in Supabase dashboard → Authentication → Users → "Add user" → "Create new user" (Auto Confirm) with password hosteasy123, then run this seed again.';
end if;

-- Make sure profile exists (trigger should have created it; backstop) ------

insert into profiles (id, email, full_name)
values (uid, 'leandro@hosteasy.com', 'Leandro')
on conflict (id) do nothing;

-- Host ----------------------------------------------------------------------

insert into hosts (id, name, plan, status, owner_id, beta_test, pix_key, pix_instructions)
values (
  host_uuid, 'Leandro · Floripa', 'pro', 'active', uid,
  true,
  'leandro@hosteasy.com.br',
  'Após aprovação do anfitrião, faça o PIX para a chave acima e nos avise pelo tablet.'
)
on conflict (id) do update set
  owner_id = excluded.owner_id,
  beta_test = excluded.beta_test,
  pix_key = excluded.pix_key,
  pix_instructions = excluded.pix_instructions;

-- Promote profile + link to host -------------------------------------------

update profiles
   set role = 'super_admin',
       host_id = host_uuid,
       full_name = coalesce(full_name, 'Leandro')
 where id = uid;

insert into host_members (host_id, user_id, role)
  values (host_uuid, uid, 'host_admin')
  on conflict do nothing;

-- Properties ----------------------------------------------------------------

insert into properties (
  id, host_id, name, unit_code, address, city, state, country, occupancy_rate, status,
  late_checkout_enabled, late_checkout_price, late_checkout_until,
  review_link_airbnb, review_link_booking, review_link_google, beta_test
)
values
  ('22222222-2222-2222-2222-222222220102', host_uuid, 'Vilas do Luiz · 102', '102', 'Rua dos Pescadores, 102', 'Florianópolis', 'SC', 'BR', 87.0, 'active',
   true, 89, '16:00',
   'https://www.airbnb.com.br/rooms/00000', null, 'https://g.page/r/example/review', true),
  ('22222222-2222-2222-2222-222222220304', host_uuid, 'Vilas do Luiz · 304', '304', 'Rua dos Pescadores, 304', 'Florianópolis', 'SC', 'BR', 82.0, 'active',
   true, 89, '16:00',
   'https://www.airbnb.com.br/rooms/00001', null, null, true),
  ('22222222-2222-2222-2222-22222222a012', host_uuid, 'Costa Azul · A12',    'A12', 'Av. das Rendeiras, A12',     'Florianópolis', 'SC', 'BR', 91.0, 'active',
   true, 119, '15:00',
   null, 'https://www.booking.com/hotel/example/review', null, true)
on conflict (id) do update set
  late_checkout_enabled = excluded.late_checkout_enabled,
  late_checkout_price = excluded.late_checkout_price,
  late_checkout_until = excluded.late_checkout_until,
  beta_test = excluded.beta_test;

-- Tablets -------------------------------------------------------------------

insert into tablets (id, host_id, property_id, tablet_code, status, battery_percent, wifi_status, last_seen_at)
values
  ('33333333-3333-3333-3333-333333330102', host_uuid, '22222222-2222-2222-2222-222222220102', 'TAB-102', 'online',  82, 'connected',    now()),
  ('33333333-3333-3333-3333-333333330304', host_uuid, '22222222-2222-2222-2222-222222220304', 'TAB-304', 'online',  64, 'connected',    now() - interval '2 minutes'),
  ('33333333-3333-3333-3333-33333333a012', host_uuid, '22222222-2222-2222-2222-22222222a012', 'TAB-A12', 'offline', 12, 'disconnected', now() - interval '1 hour')
on conflict (id) do nothing;

-- Reservations --------------------------------------------------------------

insert into reservations (id, host_id, property_id, tablet_id, guest_name, guest_email, guest_phone, check_in, check_out, amount, status, source)
values
  ('44444444-4444-4444-4444-444444440001', host_uuid, '22222222-2222-2222-2222-222222220102', '33333333-3333-3333-3333-333333330102', 'Marina Souza',    'marina@example.com', '+5548999110001', current_date,         current_date + 3, 1620, 'in_stay',     'airbnb'),
  ('44444444-4444-4444-4444-444444440002', host_uuid, '22222222-2222-2222-2222-22222222a012', '33333333-3333-3333-3333-33333333a012', 'Tiago Lima',      'tiago@example.com',  '+5548999110002', current_date,         current_date + 2, 980,  'confirmed',   'booking'),
  ('44444444-4444-4444-4444-444444440003', host_uuid, '22222222-2222-2222-2222-222222220304', '33333333-3333-3333-3333-333333330304', 'Família Oliveira','familia@example.com','+5548999110003', current_date + 1,     current_date + 5, 2400, 'confirmed',   'airbnb'),
  ('44444444-4444-4444-4444-444444440004', host_uuid, '22222222-2222-2222-2222-22222222a012', null,                                    'Ana Pereira',     'ana@example.com',    '+5548999110004', current_date - 4,     current_date + 1, 1450, 'in_stay',     'manual')
on conflict (id) do nothing;

-- Guest stays --------------------------------------------------------------

insert into guest_stays (reservation_id, tablet_id, active, expires_at)
select r.id, r.tablet_id, true, (r.check_out + 1)::timestamptz
  from reservations r
 where r.status in ('confirmed', 'in_stay')
   and r.tablet_id is not null
on conflict do nothing;

-- Extras --------------------------------------------------------------------

insert into extras (id, host_id, property_id, title, description, price, icon, category, active)
values
  ('55555555-5555-5555-5555-555555550001', host_uuid, null, 'Café da manhã',       'Tabuleiro com pães, frutas e suco entregue na porta às 9h.',    35,  'coffee',    'breakfast',     true),
  ('55555555-5555-5555-5555-555555550002', host_uuid, null, 'Late check-out',      'Estendemos a saída até as 16h, sujeito à disponibilidade.',     89,  'clock',     'late_checkout', true),
  ('55555555-5555-5555-5555-555555550003', host_uuid, null, 'Transfer aeroporto',  'Carro privativo direto ao Hercílio Luz, até 4 pessoas.',        120, 'car',       'transfer',      true),
  ('55555555-5555-5555-5555-555555550004', host_uuid, null, 'Compras prontas',     'Lista de mercado feita pelo nosso time para chegar e usar.',    60,  'basket',    'groceries',     true)
on conflict (id) do update set
  category = excluded.category,
  price = excluded.price,
  description = excluded.description,
  active = true;

-- Guide categories + items per property ------------------------------------

for p in select id from properties where host_id = host_uuid loop
  insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
  values (host_uuid, p.id, 'Wi-Fi & senha', 'Internet de 300 Mbps', 'wifi', 0)
  on conflict do nothing
  returning id into cat_id;
  if cat_id is not null then
    insert into guide_items (category_id, title, content, sort_order) values
      (cat_id, 'Rede',  'Hosteasy_Guest',                                  0),
      (cat_id, 'Senha', 'floripa-bemvindo-2026',                           1),
      (cat_id, 'Dica',  'Caso o sinal caia, o roteador fica atrás da TV.', 2);
  end if;
  cat_id := null;

  insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
  values (host_uuid, p.id, 'Cozinha equipada', 'Fogão, forno e cafeteira', 'utensils', 1)
  on conflict do nothing returning id into cat_id;
  if cat_id is not null then
    insert into guide_items (category_id, title, content, sort_order) values
      (cat_id, 'Café',   'Cafeteira italiana no armário acima da pia. Pó na lata azul.', 0),
      (cat_id, 'Fogão',  'Acendimento automático, gire devagar até clicar.',             1),
      (cat_id, 'Louças', 'Máquina de lavar louça embaixo da pia. Pastilhas no nicho.',   2);
  end if;
  cat_id := null;

  insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
  values (host_uuid, p.id, 'Ar-condicionado', 'Split frio/quente', 'snowflake', 2)
  on conflict do nothing returning id into cat_id;
  if cat_id is not null then
    insert into guide_items (category_id, title, content, sort_order) values
      (cat_id, 'Liga/desliga', 'Botão grande no controle. Modo automático recomendado para 23°C.', 0),
      (cat_id, 'Dorminhoco',   'Pressione "Sleep" antes de dormir para reduzir o ruído.',          1);
  end if;
  cat_id := null;

  insert into guide_categories (host_id, property_id, title, subtitle, icon, sort_order)
  values (host_uuid, p.id, 'Check-out', 'Como deixar o imóvel', 'log-out', 3)
  on conflict do nothing returning id into cat_id;
  if cat_id is not null then
    insert into guide_items (category_id, title, content, sort_order) values
      (cat_id, 'Horário', 'Saída até 11h. Late check-out disponível em extras.', 0),
      (cat_id, 'Lixo',    'Deixar sacos no corredor de serviço antes de sair.',  1),
      (cat_id, 'Chaves',  'Pode deixar em cima do balcão. Avisar pelo tablet.',  2);
  end if;
  cat_id := null;
end loop;

-- Web shortcuts -------------------------------------------------------------

insert into web_shortcuts (host_id, property_id, label, url, icon_letter, color, sort_order, active)
values
  (host_uuid, null, 'Airbnb',    'https://airbnb.com',      'A', '#FF5A5F', 0, true),
  (host_uuid, null, 'Booking',   'https://booking.com',     'B', '#003580', 1, true),
  (host_uuid, null, 'Maps',      'https://maps.google.com', 'M', '#4285F4', 2, true),
  (host_uuid, null, 'iFood',     'https://ifood.com.br',    'I', '#EA1D2C', 3, true),
  (host_uuid, null, 'Uber',      'https://uber.com',        'U', '#000000', 4, true),
  (host_uuid, null, 'WhatsApp',  'https://web.whatsapp.com','W', '#25D366', 5, true),
  (host_uuid, null, 'YouTube',   'https://youtube.com',     'Y', '#FF0000', 6, true),
  (host_uuid, null, 'Notícias',  'https://g1.globo.com',    'N', '#1F2937', 7, true)
on conflict do nothing;

-- Message templates --------------------------------------------------------

insert into message_templates (host_id, title, body, type) values
  (host_uuid, 'Boas-vindas',  'Olá! Tudo certo com a chegada? Estamos por aqui se precisar.', 'check_in'),
  (host_uuid, 'Wi-Fi',        'Rede: Hosteasy_Guest · Senha: floripa-bemvindo-2026',          'wifi'),
  (host_uuid, 'Check-out',    'A saída é até as 11h. Pode deixar as chaves no balcão.',       'check_out')
on conflict do nothing;

-- Demo messages -------------------------------------------------------------

insert into messages (host_id, reservation_id, tablet_id, sender_type, body, created_at)
values
  (host_uuid, '44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330102', 'guest', 'Posso fazer early check-in? Chegamos antes das 14h.', now() - interval '12 minutes'),
  (host_uuid, '44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330102', 'host',  'Oi Marina! Consigo liberar às 13h, pode vir.',         now() - interval '6 minutes'),
  (host_uuid, '44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-33333333a012', 'guest', 'Onde fica o roteador? O sinal caiu rapidinho.',        now() - interval '2 hours')
on conflict do nothing;

end $$;
