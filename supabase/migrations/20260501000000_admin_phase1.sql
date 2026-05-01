-- AMIS Meals — Admin Phase 1 schema additions

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

create table if not exists public.order_activity_log (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists order_activity_log_order_idx
  on public.order_activity_log(order_id, created_at desc);

create table if not exists public.product_activity_log (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_activity_log_product_idx
  on public.product_activity_log(product_id, created_at desc);

-- ============================================================
-- RLS — settings + activity logs (admin/owner only)
-- ============================================================
alter table public.settings enable row level security;
alter table public.order_activity_log enable row level security;
alter table public.product_activity_log enable row level security;

create policy "settings_admin_read" on public.settings
  for select using (public.is_admin());
create policy "settings_owner_write" on public.settings
  for all using (public.is_owner()) with check (public.is_owner());

create policy "order_activity_admin_read" on public.order_activity_log
  for select using (public.is_admin());
create policy "order_activity_admin_insert" on public.order_activity_log
  for insert with check (public.is_admin());

create policy "product_activity_admin_read" on public.product_activity_log
  for select using (public.is_admin());
create policy "product_activity_admin_insert" on public.product_activity_log
  for insert with check (public.is_admin());

-- ============================================================
-- Default settings rows
-- ============================================================
insert into public.settings (key, value) values
  ('shipping', jsonb_build_object(
    'localPostalCodes', array['6200','6201','6202','6203','6211','6212','6213','6214','6215','6216','6217','6218','6219','6221','6222','6223','6224','6225','6226','6227','6228','6229'],
    'localFeeCents', 395,
    'localFreeThresholdCents', 4000,
    'postnlFeeCents', 695,
    'postnlFreeThresholdCents', 6000
  )),
  ('company', jsonb_build_object(
    'name', 'AMIS Meals',
    'kvk', '',
    'btw', '',
    'address', 'Maastricht, NL',
    'email', 'hallo@amismeals.nl',
    'phone', ''
  )),
  ('email', jsonb_build_object(
    'fromEmail', 'hallo@amismeals.nl',
    'replyTo', 'hallo@amismeals.nl'
  )),
  ('general', jsonb_build_object(
    'vatRate', 0.09,
    'lowStockThreshold', 10
  ))
on conflict (key) do nothing;
