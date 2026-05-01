-- AMIS Meals — webhook log table for incoming Mollie / Sendcloud / Resend events.

create table if not exists public.webhook_log (
  id uuid primary key default uuid_generate_v4(),
  source text not null check (source in ('mollie', 'sendcloud', 'resend')),
  event_type text,
  payload jsonb,
  status text not null default 'received' check (status in ('received', 'processed', 'failed')),
  error_message text,
  related_order_id uuid references public.orders(id) on delete set null,
  received_at timestamptz not null default now(),
  processed_at timestamptz
);

create index if not exists webhook_log_received_idx on public.webhook_log(received_at desc);
create index if not exists webhook_log_source_status_idx on public.webhook_log(source, status);
create index if not exists webhook_log_related_order_idx on public.webhook_log(related_order_id);

alter table public.webhook_log enable row level security;

create policy "webhook_log_owner_read" on public.webhook_log
  for select using (public.is_owner());

-- Inserts come from edge functions / API routes using the service role, which bypasses RLS.
