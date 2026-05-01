-- AMIS Meals — review moderation: soft-delete + reason

alter table public.reviews
  add column if not exists is_deleted boolean not null default false,
  add column if not exists deleted_reason text,
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.profiles(id) on delete set null;

create index if not exists reviews_moderation_idx
  on public.reviews(is_published, is_deleted, created_at desc);
