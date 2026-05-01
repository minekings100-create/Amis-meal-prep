-- AMIS Meals — initial schema
-- Money is always stored in cents (int). RLS is enabled on every table.

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- PROFILES (mirrors auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','staff','owner')),
  has_used_tryout boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: is current user owner/staff?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff','owner')
  );
$$;

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

-- ============================================================
-- ADDRESSES
-- ============================================================
create table public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('shipping','billing')),
  street text not null,
  house_number text not null,
  postal_code text not null,
  city text not null,
  country text not null default 'NL',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index addresses_user_idx on public.addresses(user_id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name_nl text not null,
  name_en text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  type text not null check (type in ('meal','package','tryout')),
  name_nl text not null,
  name_en text not null,
  description_nl text,
  description_en text,
  price_cents int not null check (price_cents >= 0),
  compare_at_price_cents int,
  category_id uuid references public.categories(id) on delete set null,
  tags text[] not null default '{}',
  stock int not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  image_url text,
  gallery_urls text[] not null default '{}',
  ingredients_nl text,
  ingredients_en text,
  -- Nutrition
  kcal int,
  protein_g numeric(6,2),
  carbs_g numeric(6,2),
  fat_g numeric(6,2),
  fiber_g numeric(6,2),
  salt_g numeric(6,2),
  -- Allergens
  contains_gluten boolean not null default false,
  contains_lactose boolean not null default false,
  contains_nuts boolean not null default false,
  contains_eggs boolean not null default false,
  contains_soy boolean not null default false,
  contains_fish boolean not null default false,
  contains_shellfish boolean not null default false,
  contains_sesame boolean not null default false,
  contains_celery boolean not null default false,
  contains_mustard boolean not null default false,
  contains_lupine boolean not null default false,
  contains_sulfite boolean not null default false,
  contains_mollusks boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_active_idx on public.products(is_active) where is_active = true;
create index products_category_idx on public.products(category_id);
create index products_type_idx on public.products(type);
create index products_featured_idx on public.products(is_featured) where is_featured = true;

create table public.package_items (
  id uuid primary key default uuid_generate_v4(),
  package_id uuid not null references public.products(id) on delete cascade,
  meal_id uuid not null references public.products(id) on delete restrict,
  quantity int not null default 1 check (quantity > 0),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index package_items_package_idx on public.package_items(package_id);

-- ============================================================
-- DISCOUNTS
-- ============================================================
create table public.discount_codes (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  type text not null check (type in ('percentage','fixed')),
  value_cents int not null default 0,
  value_percent int not null default 0 check (value_percent between 0 and 100),
  min_order_cents int not null default 0,
  max_uses_total int,
  max_uses_per_customer int not null default 1,
  uses_count int not null default 0,
  valid_from timestamptz,
  valid_until timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create sequence if not exists order_number_seq;

create or replace function public.generate_order_number()
returns text
language plpgsql
as $$
declare
  yr text := to_char(now(), 'YYYY');
  n int;
begin
  n := nextval('order_number_seq');
  return 'AMIS-' || yr || '-' || lpad(n::text, 5, '0');
end;
$$;

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique default public.generate_order_number(),
  user_id uuid references public.profiles(id) on delete set null,
  guest_email text,
  status text not null default 'pending' check (
    status in ('pending','paid','preparing','shipped','delivered','cancelled','refunded')
  ),
  subtotal_cents int not null,
  discount_cents int not null default 0,
  shipping_cents int not null default 0,
  tax_cents int not null,
  total_cents int not null,
  shipping_method text not null check (shipping_method in ('postnl','local')),
  shipping_first_name text not null,
  shipping_last_name text not null,
  shipping_street text not null,
  shipping_house_number text not null,
  shipping_postal_code text not null,
  shipping_city text not null,
  shipping_country text not null default 'NL',
  shipping_phone text,
  mollie_payment_id text unique,
  mollie_payment_status text,
  sendcloud_parcel_id text,
  tracking_number text,
  tracking_url text,
  discount_code_id uuid references public.discount_codes(id) on delete set null,
  customer_note text,
  internal_note text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  constraint orders_user_or_guest_chk check (user_id is not null or guest_email is not null)
);

create index orders_user_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index orders_created_idx on public.orders(created_at desc);
create index orders_mollie_idx on public.orders(mollie_payment_id);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity int not null check (quantity > 0),
  unit_price_cents int not null,
  total_cents int not null,
  created_at timestamptz not null default now()
);

create index order_items_order_idx on public.order_items(order_id);

-- ============================================================
-- DISCOUNT USES
-- ============================================================
create table public.discount_code_uses (
  id uuid primary key default uuid_generate_v4(),
  discount_code_id uuid not null references public.discount_codes(id) on delete cascade,
  order_id uuid not null references public.orders(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  used_at timestamptz not null default now()
);

create index discount_code_uses_code_idx on public.discount_code_uses(discount_code_id);
create index discount_code_uses_user_idx on public.discount_code_uses(user_id);

-- ============================================================
-- REVIEWS
-- ============================================================
create table public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id, order_id)
);

create index reviews_product_idx on public.reviews(product_id);
create index reviews_published_idx on public.reviews(is_published) where is_published = true;

-- ============================================================
-- SUBSCRIPTIONS (db-prepared, not yet wired)
-- ============================================================
create table public.subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  package_id uuid not null references public.products(id) on delete restrict,
  frequency text not null check (frequency in ('weekly','biweekly')),
  status text not null default 'active' check (status in ('active','paused','cancelled')),
  next_delivery_date date,
  mollie_mandate_id text,
  created_at timestamptz not null default now(),
  cancelled_at timestamptz
);

create index subscriptions_user_idx on public.subscriptions(user_id);

-- ============================================================
-- updated_at triggers
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute procedure public.touch_updated_at();

create trigger products_touch before update on public.products
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- Stock decrement (atomic, used at checkout in a transaction)
-- ============================================================
create or replace function public.decrement_stock(p_product_id uuid, p_quantity int)
returns boolean
language plpgsql
as $$
declare
  current_stock int;
begin
  select stock into current_stock from public.products where id = p_product_id for update;
  if current_stock is null then return false; end if;
  if current_stock < p_quantity then return false; end if;
  update public.products set stock = stock - p_quantity where id = p_product_id;
  return true;
end;
$$;
