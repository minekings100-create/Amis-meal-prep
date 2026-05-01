-- AMIS Meals — per-product VAT rate
-- Default 9% (food). 21% reserved for gift cards / non-food merch later.

alter table public.products
  add column if not exists vat_rate numeric(4,2) not null default 9.00
    check (vat_rate in (9.00, 21.00));

create index if not exists products_vat_rate_idx on public.products(vat_rate);

-- Snapshot the rate on each line item so historical orders never shift if a
-- product later moves between brackets.
alter table public.order_items
  add column if not exists vat_rate numeric(4,2) not null default 9.00;
