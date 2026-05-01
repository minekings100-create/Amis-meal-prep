-- AMIS Meals — two-spot tag system
-- goal_tag: single category-style tag (cut/bulk/performance/maintenance/hybrid)
-- attribute_tags: array of attribute tags (new, bestseller, limited, spicy,
--   high-protein, vegetarian, gluten-free, lactose-free)

alter table public.products
  add column if not exists goal_tag text
    check (goal_tag in ('cut','bulk','performance','maintenance','hybrid')),
  add column if not exists attribute_tags text[] not null default '{}';

create index if not exists products_goal_tag_idx on public.products(goal_tag);
create index if not exists products_attribute_tags_gin on public.products using gin(attribute_tags);
