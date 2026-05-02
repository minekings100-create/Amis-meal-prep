import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Product, ProductType } from '@/types/database';

export interface FeaturedListing {
  /** Active products available to feature, ordered by name. */
  available: Array<{
    id: string;
    name: string;
    slug: string;
    type: ProductType;
    imageUrl: string | null;
    categoryName: string | null;
  }>;
  /** Currently featured products in their saved featured_order. */
  selected: Array<{
    id: string;
    name: string;
    slug: string;
    type: ProductType;
    imageUrl: string | null;
    featuredOrder: number | null;
  }>;
  isMocked: boolean;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getFeaturedListing(): Promise<FeaturedListing> {
  if (!isSupabaseConfigured()) {
    // Mock-mode shape — keeps the admin page working in dev without Supabase.
    return {
      available: [
        { id: 'prod-beef', name: 'Korean Beef Bowl', slug: 'korean-beef-bowl', type: 'meal', imageUrl: null, categoryName: 'Maaltijden' },
        { id: 'prod-salmon', name: 'Sweet Potato Salmon', slug: 'sweet-potato-salmon', type: 'meal', imageUrl: null, categoryName: 'Maaltijden' },
        { id: 'prod-chicken', name: 'Mexican Chicken Bowl', slug: 'mexican-chicken-bowl', type: 'meal', imageUrl: null, categoryName: 'Maaltijden' },
        { id: 'prod-cut-pkg', name: '7-dagen Cut Pakket', slug: '7-dagen-cut-pakket', type: 'package', imageUrl: null, categoryName: 'Pakketten' },
        { id: 'prod-tryout', name: 'AMIS Kennismakingspakket', slug: 'amis-kennismakingspakket', type: 'tryout', imageUrl: null, categoryName: 'Try-out' },
      ],
      selected: [
        { id: 'prod-beef', name: 'Korean Beef Bowl', slug: 'korean-beef-bowl', type: 'meal', imageUrl: null, featuredOrder: 1 },
        { id: 'prod-salmon', name: 'Sweet Potato Salmon', slug: 'sweet-potato-salmon', type: 'meal', imageUrl: null, featuredOrder: 2 },
        { id: 'prod-chicken', name: 'Mexican Chicken Bowl', slug: 'mexican-chicken-bowl', type: 'meal', imageUrl: null, featuredOrder: 3 },
      ],
      isMocked: true,
    };
  }

  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('products')
    .select('id,slug,name_nl,type,image_url,is_featured,featured_order,category:categories(name_nl)')
    .eq('is_active', true)
    .order('is_featured', { ascending: false })
    .order('featured_order', { ascending: true, nullsFirst: false })
    .order('name_nl');

  type Row = {
    id: string;
    slug: string;
    name_nl: string;
    type: ProductType;
    image_url: string | null;
    is_featured: boolean;
    featured_order: number | null;
    category: { name_nl: string } | { name_nl: string }[] | null;
  };
  const rows = (data ?? []) as unknown as Row[];

  const available = rows.map((r) => ({
    id: r.id,
    name: r.name_nl,
    slug: r.slug,
    type: r.type,
    imageUrl: r.image_url,
    categoryName: Array.isArray(r.category) ? (r.category[0]?.name_nl ?? null) : (r.category?.name_nl ?? null),
  }));

  const selected = rows
    .filter((r) => r.is_featured)
    .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99))
    .map((r) => ({
      id: r.id,
      name: r.name_nl,
      slug: r.slug,
      type: r.type,
      imageUrl: r.image_url,
      featuredOrder: r.featured_order,
    }));

  return { available, selected, isMocked: false };
}

/**
 * Public-side query — used by the homepage Hot deze week section. Reads
 * from `is_featured + featured_order` instead of falling back to the
 * generic featured-only listProducts(). Returns Product rows so the
 * existing ProductCard renders without changes.
 */
export async function getHomepageFeaturedProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    // Mock fallback — caller will use listProducts({ featuredOnly:true }) anyway.
    return [];
  }
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_active', true)
    .order('featured_order', { ascending: true, nullsFirst: false })
    .limit(3);
  return (data ?? []) as unknown as Product[];
}
