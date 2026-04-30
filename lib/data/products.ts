/**
 * Product / category / athlete / review accessors.
 *
 * Switches between Supabase and mock data based on whether
 * NEXT_PUBLIC_SUPABASE_URL is configured. This lets the site render during
 * local development before Supabase is connected.
 */

import { mockProducts, mockCategories, mockAthletes, mockReviews } from './mock';
import type { Product, Category, Athlete, Review } from '@/types/database';

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export interface ProductFilters {
  type?: 'meal' | 'package' | 'tryout';
  categorySlug?: string;
  featuredOnly?: boolean;
  sort?: 'featured' | 'price-asc' | 'price-desc';
}

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    let results = [...mockProducts].filter((p) => p.is_active);
    if (filters.type) results = results.filter((p) => p.type === filters.type);
    if (filters.featuredOnly) results = results.filter((p) => p.is_featured);
    if (filters.categorySlug) {
      const cat = mockCategories.find((c) => c.slug === filters.categorySlug);
      if (cat) results = results.filter((p) => p.category_id === cat.id);
    }
    return sortProducts(results, filters.sort ?? 'featured');
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  let q = supabase.from('products').select('*').eq('is_active', true);
  if (filters.type) q = q.eq('type', filters.type);
  if (filters.featuredOnly) q = q.eq('is_featured', true);
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .maybeSingle<{ id: string }>();
    if (cat) q = q.eq('category_id', cat.id);
  }
  const { data, error } = await q;
  if (error) throw error;
  return sortProducts(data ?? [], filters.sort ?? 'featured');
}

function sortProducts(products: Product[], sort: NonNullable<ProductFilters['sort']>): Product[] {
  const arr = [...products];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price_cents - b.price_cents);
    case 'price-desc':
      return arr.sort((a, b) => b.price_cents - a.price_cents);
    case 'featured':
    default:
      return arr.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }
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

export async function listAthletes(): Promise<Athlete[]> {
  if (!isSupabaseConfigured()) {
    return [...mockAthletes].filter((a) => a.is_active).sort((a, b) => a.sort_order - b.sort_order);
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
  if (error) throw error;
  return data ?? [];
}

export async function getAthleteBySlug(slug: string): Promise<Athlete | null> {
  if (!isSupabaseConfigured()) {
    return mockAthletes.find((a) => a.slug === slug) ?? null;
  }
  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('athletes')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  return data;
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
