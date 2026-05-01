import { createServiceRoleClient } from '@/lib/supabase/server';
import type { ProductType } from '@/types/database';
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/shared';

export { LOW_STOCK_THRESHOLD };

export interface StockRow {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  categoryId: string | null;
  categoryName: string;
  type: ProductType;
  stock: number;
  isActive: boolean;
  sales7d: number;
  priceCents: number;
}

export interface StockCategory {
  id: string;
  name: string;
}

export interface StockListing {
  rows: StockRow[];
  categories: StockCategory[];
  isMocked: boolean;
}

export interface StockListParams {
  search: string;
  categoryId?: string;
  lowOnly: boolean;
}


function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getStockListing(params: StockListParams): Promise<StockListing> {
  if (!isSupabaseConfigured()) return mockedListing(params);

  const sb = createServiceRoleClient();

  const [productsRes, categoriesRes, salesRes] = await Promise.all([
    sb
      .from('products')
      .select('id,slug,name_nl,image_url,category_id,type,stock,is_active,price_cents,categories(name_nl)')
      .order('stock', { ascending: true })
      .order('name_nl', { ascending: true }),
    sb.from('categories').select('id,name_nl').order('sort_order', { ascending: true }),
    sb
      .from('order_items')
      .select('product_id,quantity,orders!inner(created_at,status)')
      .gte('orders.created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .in('orders.status', ['paid', 'preparing', 'shipped', 'delivered']),
  ]);

  const sales7dByProduct = new Map<string, number>();
  type SalesRow = { product_id: string | null; quantity: number };
  for (const row of (salesRes.data as unknown as SalesRow[]) ?? []) {
    if (!row.product_id) continue;
    sales7dByProduct.set(row.product_id, (sales7dByProduct.get(row.product_id) ?? 0) + row.quantity);
  }

  type ProductStockRow = {
    id: string;
    slug: string;
    name_nl: string;
    image_url: string | null;
    category_id: string | null;
    type: ProductType;
    stock: number;
    is_active: boolean;
    price_cents: number;
    categories: { name_nl: string } | { name_nl: string }[] | null;
  };
  let rows: StockRow[] = ((productsRes.data as unknown as ProductStockRow[]) ?? []).map((p) => {
    const cat = Array.isArray(p.categories) ? p.categories[0] ?? null : p.categories;
    return {
      id: p.id,
      slug: p.slug,
      name: p.name_nl,
      imageUrl: p.image_url,
      categoryId: p.category_id,
      categoryName: cat?.name_nl ?? 'Geen',
      type: p.type,
      stock: p.stock,
      isActive: p.is_active,
      priceCents: p.price_cents,
      sales7d: sales7dByProduct.get(p.id) ?? 0,
    };
  });

  rows = applyFilters(rows, params);

  type CategoryRow = { id: string; name_nl: string };
  return {
    rows,
    categories: ((categoriesRes.data as unknown as CategoryRow[]) ?? []).map((c) => ({ id: c.id, name: c.name_nl })),
    isMocked: false,
  };
}

function applyFilters(rows: StockRow[], params: StockListParams): StockRow[] {
  let r = rows;
  if (params.search.trim()) {
    const q = params.search.toLowerCase();
    r = r.filter((x) => x.name.toLowerCase().includes(q) || x.slug.toLowerCase().includes(q));
  }
  if (params.categoryId) r = r.filter((x) => x.categoryId === params.categoryId);
  if (params.lowOnly) r = r.filter((x) => x.stock < LOW_STOCK_THRESHOLD && x.isActive);
  return r;
}

// ============================================================
// Mocked dataset
// ============================================================
function mockedListing(params: StockListParams): StockListing {
  const categories: StockCategory[] = [
    { id: 'c-meals', name: 'Maaltijden' },
    { id: 'c-pakketten', name: 'Pakketten' },
    { id: 'c-snacks', name: 'Snacks' },
  ];

  const baseImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=80&h=80&fit=crop',
  ];

  const rows: StockRow[] = [
    { id: 'p1', slug: 'kip-teriyaki-bowl', name: 'Kip Teriyaki Bowl', categoryId: 'c-meals', categoryName: 'Maaltijden', type: 'meal', stock: 24, isActive: true, sales7d: 31, priceCents: 1095, imageUrl: baseImages[0] },
    { id: 'p2', slug: 'zalm-quinoa', name: 'Zalm met Quinoa', categoryId: 'c-meals', categoryName: 'Maaltijden', type: 'meal', stock: 8, isActive: true, sales7d: 22, priceCents: 1395, imageUrl: baseImages[4] },
    { id: 'p3', slug: 'pulled-beef', name: 'Pulled Beef Bowl', categoryId: 'c-meals', categoryName: 'Maaltijden', type: 'meal', stock: 0, isActive: true, sales7d: 18, priceCents: 1295, imageUrl: baseImages[2] },
    { id: 'p4', slug: 'curry-rijst', name: 'Vegan Curry Rijst', categoryId: 'c-meals', categoryName: 'Maaltijden', type: 'meal', stock: 17, isActive: true, sales7d: 11, priceCents: 1095, imageUrl: baseImages[1] },
    { id: 'p5', slug: 'tonijn-pasta', name: 'Tonijn Pasta', categoryId: 'c-meals', categoryName: 'Maaltijden', type: 'meal', stock: 5, isActive: true, sales7d: 14, priceCents: 1145, imageUrl: baseImages[3] },
    { id: 'p6', slug: 'cut-pakket-7', name: 'Cut Pakket — 7 maaltijden', categoryId: 'c-pakketten', categoryName: 'Pakketten', type: 'package', stock: 35, isActive: true, sales7d: 9, priceCents: 5495, imageUrl: baseImages[0] },
    { id: 'p7', slug: 'bulk-pakket-7', name: 'Bulk Pakket — 7 maaltijden', categoryId: 'c-pakketten', categoryName: 'Pakketten', type: 'package', stock: 28, isActive: true, sales7d: 7, priceCents: 5995, imageUrl: baseImages[2] },
    { id: 'p8', slug: 'protein-balls', name: 'Protein Balls 6-pack', categoryId: 'c-snacks', categoryName: 'Snacks', type: 'meal', stock: 42, isActive: true, sales7d: 19, priceCents: 695, imageUrl: baseImages[3] },
    { id: 'p9', slug: 'overnight-oats', name: 'Overnight Oats', categoryId: 'c-snacks', categoryName: 'Snacks', type: 'meal', stock: 9, isActive: true, sales7d: 12, priceCents: 495, imageUrl: baseImages[4] },
    { id: 'p10', slug: 'tryout-3', name: 'Tryout — 3 maaltijden', categoryId: 'c-pakketten', categoryName: 'Pakketten', type: 'tryout', stock: 60, isActive: true, sales7d: 4, priceCents: 2495, imageUrl: baseImages[1] },
    { id: 'p11', slug: 'kip-curry-old', name: 'Kip Curry (oud recept)', categoryId: 'c-meals', categoryName: 'Maaltijden', type: 'meal', stock: 0, isActive: false, sales7d: 0, priceCents: 1095, imageUrl: baseImages[2] },
  ];

  return { rows: applyFilters(rows, params), categories, isMocked: true };
}
