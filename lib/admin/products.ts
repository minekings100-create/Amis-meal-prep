import { createServiceRoleClient } from '@/lib/supabase/server';
import type {
  Product,
  ProductType,
  GoalTag,
  AttributeTag,
  Category,
} from '@/types/database';

export interface ProductListRow {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  type: ProductType;
  categoryName: string;
  priceCents: number;
  vatRate: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  sales30d: number;
}

export interface ProductListing {
  rows: ProductListRow[];
  categories: Category[];
  isMocked: boolean;
}

export interface ProductListParams {
  search: string;
  categoryId?: string;
  type?: ProductType;
  sort: 'name' | 'price' | 'stock' | 'sales';
  dir: 'asc' | 'desc';
}

export interface ProductFull extends Product {
  packageItems: Array<{
    id: string;
    mealId: string;
    mealName: string;
    mealImage: string | null;
    quantity: number;
    sortOrder: number;
    kcal: number | null;
    protein_g: number | null;
    carbs_g: number | null;
    fat_g: number | null;
  }>;
  isMocked: boolean;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getProductListing(
  params: ProductListParams,
): Promise<ProductListing> {
  if (!isSupabaseConfigured()) return mockedListing(params);

  const sb = createServiceRoleClient();
  const [productsRes, categoriesRes, salesRes] = await Promise.all([
    sb
      .from('products')
      .select('id,slug,name_nl,image_url,type,category_id,price_cents,vat_rate,stock,is_active,is_featured,categories(name_nl)'),
    sb.from('categories').select('*').order('sort_order'),
    sb
      .from('order_items')
      .select('product_id,quantity,orders!inner(created_at,status)')
      .gte('orders.created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .in('orders.status', ['paid', 'preparing', 'shipped', 'delivered']),
  ]);

  const sales30d = new Map<string, number>();
  for (const r of salesRes.data ?? []) {
    if (!r.product_id) continue;
    sales30d.set(r.product_id, (sales30d.get(r.product_id) ?? 0) + r.quantity);
  }

  let rows: ProductListRow[] = (productsRes.data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name_nl,
    imageUrl: p.image_url,
    type: p.type,
    categoryName: (p.categories as { name_nl: string } | null)?.name_nl ?? '—',
    priceCents: p.price_cents,
    vatRate: typeof p.vat_rate === 'number' ? p.vat_rate : Number(p.vat_rate ?? 9),
    stock: p.stock,
    isActive: p.is_active,
    isFeatured: p.is_featured,
    sales30d: sales30d.get(p.id) ?? 0,
  }));

  rows = applyFilters(rows, params);
  rows = sortRows(rows, params);

  return {
    rows,
    categories: categoriesRes.data ?? [],
    isMocked: false,
  };
}

function applyFilters(rows: ProductListRow[], params: ProductListParams): ProductListRow[] {
  let r = rows;
  if (params.search.trim()) {
    const q = params.search.toLowerCase();
    r = r.filter((x) => x.name.toLowerCase().includes(q) || x.slug.toLowerCase().includes(q));
  }
  if (params.type) r = r.filter((x) => x.type === params.type);
  return r;
}

function sortRows(rows: ProductListRow[], params: ProductListParams): ProductListRow[] {
  const dir = params.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (params.sort) {
      case 'price':
        return (a.priceCents - b.priceCents) * dir;
      case 'stock':
        return (a.stock - b.stock) * dir;
      case 'sales':
        return (a.sales30d - b.sales30d) * dir;
      default:
        return a.name.localeCompare(b.name) * dir;
    }
  });
}

export async function getProductForEdit(id: string): Promise<ProductFull | null> {
  if (!isSupabaseConfigured()) return mockedFull(id);

  const sb = createServiceRoleClient();
  const { data: product } = await sb.from('products').select('*').eq('id', id).maybeSingle();
  if (!product) return null;

  let packageItems: ProductFull['packageItems'] = [];
  if (product.type === 'package') {
    const { data: items } = await sb
      .from('package_items')
      .select('id,meal_id,quantity,sort_order,products(name_nl,image_url,kcal,protein_g,carbs_g,fat_g)')
      .eq('package_id', id)
      .order('sort_order', { ascending: true });
    packageItems = (items ?? []).map((it) => {
      const p = (it as { products: { name_nl: string; image_url: string | null; kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null } | null }).products;
      return {
        id: it.id,
        mealId: it.meal_id,
        mealName: p?.name_nl ?? '—',
        mealImage: p?.image_url ?? null,
        quantity: it.quantity,
        sortOrder: it.sort_order,
        kcal: p?.kcal ?? null,
        protein_g: p?.protein_g ?? null,
        carbs_g: p?.carbs_g ?? null,
        fat_g: p?.fat_g ?? null,
      };
    });
  }

  return {
    ...(product as Product),
    packageItems,
    isMocked: false,
  };
}

export async function listMealsForPackagePicker(): Promise<Array<{ id: string; name: string; imageUrl: string | null; kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null }>> {
  if (!isSupabaseConfigured()) {
    return [
      { id: 'p1', name: 'Kip Teriyaki Bowl', imageUrl: null, kcal: 540, protein_g: 42, carbs_g: 56, fat_g: 14 },
      { id: 'p2', name: 'Zalm met Quinoa', imageUrl: null, kcal: 620, protein_g: 38, carbs_g: 52, fat_g: 24 },
      { id: 'p3', name: 'Pulled Beef Bowl', imageUrl: null, kcal: 580, protein_g: 45, carbs_g: 48, fat_g: 16 },
      { id: 'p4', name: 'Vegan Curry', imageUrl: null, kcal: 460, protein_g: 22, carbs_g: 64, fat_g: 12 },
    ];
  }
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('products')
    .select('id,name_nl,image_url,kcal,protein_g,carbs_g,fat_g')
    .eq('type', 'meal')
    .eq('is_active', true)
    .order('name_nl');
  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name_nl,
    imageUrl: m.image_url,
    kcal: m.kcal,
    protein_g: m.protein_g,
    carbs_g: m.carbs_g,
    fat_g: m.fat_g,
  }));
}

export const ATTRIBUTE_TAGS: AttributeTag[] = [
  'new',
  'bestseller',
  'limited',
  'spicy',
  'high-protein',
  'vegetarian',
  'gluten-free',
  'lactose-free',
];

export const GOAL_TAGS: GoalTag[] = ['cut', 'bulk', 'performance', 'maintenance', 'hybrid'];

export const ALLERGEN_FIELDS = [
  { key: 'contains_gluten', label: 'Gluten' },
  { key: 'contains_lactose', label: 'Lactose' },
  { key: 'contains_nuts', label: 'Noten' },
  { key: 'contains_eggs', label: 'Eieren' },
  { key: 'contains_soy', label: 'Soja' },
  { key: 'contains_fish', label: 'Vis' },
  { key: 'contains_shellfish', label: 'Schaaldieren' },
  { key: 'contains_sesame', label: 'Sesam' },
  { key: 'contains_celery', label: 'Selderij' },
  { key: 'contains_mustard', label: 'Mosterd' },
  { key: 'contains_lupine', label: 'Lupine' },
  { key: 'contains_sulfite', label: 'Sulfiet' },
  { key: 'contains_mollusks', label: 'Weekdieren' },
] as const;

// ============================================================
// Mocked
// ============================================================
function mockedListing(params: ProductListParams): ProductListing {
  const baseImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=80&h=80&fit=crop',
  ];
  const categories: Category[] = [
    { id: 'c-meals', slug: 'meals', name_nl: 'Maaltijden', name_en: 'Meals', sort_order: 1, created_at: '2026-01-01T00:00:00Z' },
    { id: 'c-pakketten', slug: 'pakketten', name_nl: 'Pakketten', name_en: 'Packages', sort_order: 2, created_at: '2026-01-01T00:00:00Z' },
    { id: 'c-snacks', slug: 'snacks', name_nl: 'Snacks', name_en: 'Snacks', sort_order: 3, created_at: '2026-01-01T00:00:00Z' },
  ];
  let rows: ProductListRow[] = [
    { id: 'p1', slug: 'kip-teriyaki', name: 'Kip Teriyaki Bowl', imageUrl: baseImages[0], type: 'meal', categoryName: 'Maaltijden', priceCents: 1095, vatRate: 9, stock: 24, isActive: true, isFeatured: true, sales30d: 122 },
    { id: 'p2', slug: 'zalm-quinoa', name: 'Zalm met Quinoa', imageUrl: baseImages[3], type: 'meal', categoryName: 'Maaltijden', priceCents: 1395, vatRate: 9, stock: 8, isActive: true, isFeatured: false, sales30d: 84 },
    { id: 'p3', slug: 'pulled-beef', name: 'Pulled Beef Bowl', imageUrl: baseImages[2], type: 'meal', categoryName: 'Maaltijden', priceCents: 1295, vatRate: 9, stock: 0, isActive: true, isFeatured: false, sales30d: 56 },
    { id: 'p4', slug: 'cut-pakket-7', name: 'Cut Pakket — 7 maaltijden', imageUrl: baseImages[0], type: 'package', categoryName: 'Pakketten', priceCents: 5495, vatRate: 9, stock: 35, isActive: true, isFeatured: true, sales30d: 28 },
    { id: 'p5', slug: 'tryout-3', name: 'Tryout — 3 maaltijden', imageUrl: baseImages[1], type: 'tryout', categoryName: 'Pakketten', priceCents: 2495, vatRate: 9, stock: 60, isActive: true, isFeatured: true, sales30d: 12 },
    { id: 'p6', slug: 'protein-balls', name: 'Protein Balls 6-pack', imageUrl: baseImages[3], type: 'meal', categoryName: 'Snacks', priceCents: 695, vatRate: 9, stock: 42, isActive: true, isFeatured: false, sales30d: 71 },
    { id: 'gift-25', slug: 'cadeaubon-25', name: 'Cadeaubon €25', imageUrl: null, type: 'meal', categoryName: 'Snacks', priceCents: 2500, vatRate: 21, stock: 999, isActive: true, isFeatured: false, sales30d: 4 },
  ];
  rows = applyFilters(rows, params);
  rows = sortRows(rows, params);
  return { rows, categories, isMocked: true };
}

function mockedFull(id: string): ProductFull {
  const base: Product = {
    id,
    slug: 'kip-teriyaki',
    type: 'meal',
    name_nl: 'Kip Teriyaki Bowl',
    name_en: 'Chicken Teriyaki Bowl',
    description_nl: 'Mals gegrilde kipfilet in zoete sojaglaze met basmati en seizoensgroenten.',
    description_en: 'Tender grilled chicken in sweet soy glaze with basmati and seasonal greens.',
    price_cents: 1095,
    compare_at_price_cents: null,
    category_id: 'c-meals',
    tags: [],
    goal_tag: 'maintenance',
    attribute_tags: ['high-protein', 'bestseller'],
    stock: 24,
    is_active: true,
    is_featured: true,
    image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&h=1200&fit=crop',
    gallery_urls: [],
    ingredients_nl: 'Kipfilet, basmati rijst, broccoli, wortel, sojasaus, knoflook, gember, sesam',
    ingredients_en: 'Chicken breast, basmati rice, broccoli, carrot, soy sauce, garlic, ginger, sesame',
    kcal: 540,
    protein_g: 42,
    carbs_g: 56,
    fat_g: 14,
    fiber_g: 4,
    salt_g: 1.4,
    contains_gluten: true,
    contains_lactose: false,
    contains_nuts: false,
    contains_eggs: false,
    contains_soy: true,
    contains_fish: false,
    contains_shellfish: false,
    contains_sesame: true,
    contains_celery: false,
    contains_mustard: false,
    contains_lupine: false,
    contains_sulfite: false,
    contains_mollusks: false,
    vat_rate: 9,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-04-15T12:00:00Z',
  };
  return { ...base, packageItems: [], isMocked: true };
}
