-- Hot deze week sortering — admin handmatige selectie + volgorde.
alter table public.products
  add column if not exists featured_order int default null;

create index if not exists idx_products_featured_order
  on public.products (featured_order)
  where is_featured = true and is_active = true;
