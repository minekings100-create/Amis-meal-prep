-- AMIS Meals — Row Level Security policies

alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.package_items enable row level security;
alter table public.discount_codes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.discount_code_uses enable row level security;
alter table public.reviews enable row level security;
alter table public.subscriptions enable row level security;

-- ============================================================
-- PROFILES — users see/update their own; admins see all
-- ============================================================
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "profiles_owner_manage" on public.profiles
  for all using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- ADDRESSES — own only
-- ============================================================
create policy "addresses_own_all" on public.addresses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "addresses_admin_read" on public.addresses
  for select using (public.is_admin());

-- ============================================================
-- CATEGORIES — public read, admin write
-- ============================================================
create policy "categories_public_read" on public.categories
  for select using (true);

create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PRODUCTS — public read (active only), admin write/read all
-- ============================================================
create policy "products_public_read" on public.products
  for select using (is_active = true or public.is_admin());

create policy "products_admin_write" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

create policy "package_items_public_read" on public.package_items
  for select using (true);

create policy "package_items_admin_write" on public.package_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- DISCOUNT CODES — owner only (staff cannot read/manage)
-- ============================================================
create policy "discount_codes_owner_all" on public.discount_codes
  for all using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- ORDERS — own + admin all
-- ============================================================
create policy "orders_own_read" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());

create policy "orders_admin_write" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

create policy "orders_admin_delete" on public.orders
  for delete using (public.is_owner());

-- Order inserts go through service-role (server actions); deny anon writes here.
create policy "orders_admin_insert" on public.orders
  for insert with check (public.is_admin());

create policy "order_items_own_read" on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin()))
  );

create policy "order_items_admin_write" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- DISCOUNT USES — admin/owner only
-- ============================================================
create policy "discount_uses_admin_read" on public.discount_code_uses
  for select using (public.is_admin());

create policy "discount_uses_owner_write" on public.discount_code_uses
  for all using (public.is_owner()) with check (public.is_owner());

-- ============================================================
-- REVIEWS — public sees published, users see own, admin sees all
-- ============================================================
create policy "reviews_public_published" on public.reviews
  for select using (is_published = true);

create policy "reviews_own_read" on public.reviews
  for select using (auth.uid() = user_id);

create policy "reviews_admin_read" on public.reviews
  for select using (public.is_admin());

-- Verified-purchase enforcement happens in the server action; here we just
-- require an authenticated user submitting their own row.
create policy "reviews_own_insert" on public.reviews
  for insert with check (auth.uid() = user_id);

create policy "reviews_own_update" on public.reviews
  for update using (auth.uid() = user_id and is_published = false)
  with check (auth.uid() = user_id);

create policy "reviews_admin_write" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- SUBSCRIPTIONS — own + admin
-- ============================================================
create policy "subscriptions_own_all" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions_admin_read" on public.subscriptions
  for select using (public.is_admin());
