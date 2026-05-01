/**
 * Product / category / review accessors.
 *
 * Switches between Supabase and mock data based on whether
 * NEXT_PUBLIC_SUPABASE_URL is configured. This lets the site render during
 * local development before Supabase is connected.
 */

import { mockProducts, mockCategories, mockReviews } from './mock';
import type { Product, Category, Review, GoalTag } from '@/types/database';
import { ALLERGEN_KEYS, type AllergenKey, type SortKey, type ProductFilters } from '@/lib/shop/types';

// Re-export for backwards-compat with code that imported from this file.
export { ALLERGEN_KEYS };
export type { AllergenKey, SortKey, ProductFilters };

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

const ALLERGEN_FIELD: Record<AllergenKey, keyof Product> = {
  gluten: 'contains_gluten',
  lactose: 'contains_lactose',
  nuts: 'contains_nuts',
  eggs: 'contains_eggs',
  soy: 'contains_soy',
  fish: 'contains_fish',
  shellfish: 'contains_shellfish',
  sesame: 'contains_sesame',
  celery: 'contains_celery',
  mustard: 'contains_mustard',
  lupine: 'contains_lupine',
  sulfite: 'contains_sulfite',
  mollusks: 'contains_mollusks',
};

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let results = mockProducts.filter((p) => p.is_active);

    if (filters.type) results = results.filter((p) => p.type === filters.type);
    if (filters.featuredOnly) results = results.filter((p) => p.is_featured);
    if (filters.categorySlug) {
      const cat = mockCategories.find((c) => c.slug === filters.categorySlug);
      if (cat) results = results.filter((p) => p.category_id === cat.id);
    }
    if (filters.goalTags?.length) {
      const set = new Set<GoalTag>(filters.goalTags);
      results = results.filter((p) => p.goal_tag !== null && set.has(p.goal_tag));
    }
    if (filters.attributeTags?.length) {
      const required = filters.attributeTags;
      results = results.filter((p) =>
        required.every((a) => p.attribute_tags.includes(a)),
      );
    }
    if (filters.allergensAvoid?.length) {
      results = results.filter((p) =>
        filters.allergensAvoid!.every((a) => !p[ALLERGEN_FIELD[a]]),
      );
    }
    if (filters.minPriceCents !== undefined) {
      results = results.filter((p) => p.price_cents >= filters.minPriceCents!);
    }
    if (filters.maxPriceCents !== undefined) {
      results = results.filter((p) => p.price_cents <= filters.maxPriceCents!);
    }
    return sortProducts(results, filters.sort ?? 'featured');
  }

  // Supabase path — apply filters server-side where possible. RLS enforces is_active.
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  let q = supabase.from('products').select('*').eq('is_active', true);

  if (filters.type) q = q.eq('type', filters.type);
  if (filters.featuredOnly) q = q.eq('is_featured', true);
  if (filters.goalTags?.length) q = q.in('goal_tag', filters.goalTags);
  if (filters.attributeTags?.length) q = q.contains('attribute_tags', filters.attributeTags);
  if (filters.minPriceCents !== undefined) q = q.gte('price_cents', filters.minPriceCents);
  if (filters.maxPriceCents !== undefined) q = q.lte('price_cents', filters.maxPriceCents);
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .maybeSingle<{ id: string }>();
    if (cat) q = q.eq('category_id', cat.id);
  }
  if (filters.allergensAvoid?.length) {
    for (const a of filters.allergensAvoid) {
      q = q.eq(ALLERGEN_FIELD[a] as string, false);
    }
  }

  const { data, error } = await q;
  if (error) throw error;
  return sortProducts(data ?? [], filters.sort ?? 'featured');
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price_cents - b.price_cents);
    case 'price-desc':
      return arr.sort((a, b) => b.price_cents - a.price_cents);
    case 'new':
      // Use 'new' attribute tag presence + featured + recency.
      return arr.sort((a, b) => {
        const an = a.attribute_tags.includes('new') ? 1 : 0;
        const bn = b.attribute_tags.includes('new') ? 1 : 0;
        if (an !== bn) return bn - an;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    case 'protein-per-euro':
      return arr.sort((a, b) => proteinPerEuro(b) - proteinPerEuro(a));
    case 'featured':
    default:
      return arr.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }
}

function proteinPerEuro(p: Product): number {
  if (!p.protein_g || p.price_cents <= 0) return 0;
  return p.protein_g / (p.price_cents / 100);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find((p) => p.slug === slug) ?? null;
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.from('products').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data;
}

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return [...mockCategories].sort((a, b) => a.sort_order - b.sort_order);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase.from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function listPublishedReviews(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) {
    return mockReviews.filter((r) => r.product_id === productId && r.is_published);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', productId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
