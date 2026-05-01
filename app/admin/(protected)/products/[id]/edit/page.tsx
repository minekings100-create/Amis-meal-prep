import { notFound } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getProductForEdit, listMealsForPackagePicker } from '@/lib/admin/products';
import { ProductForm } from '@/components/admin/products/product-form';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Category } from '@/types/database';

export const dynamic = 'force-dynamic';

async function loadCategories(): Promise<Category[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return [
      { id: 'c-meals', slug: 'meals', name_nl: 'Maaltijden', name_en: 'Meals', sort_order: 1, created_at: '' },
      { id: 'c-pakketten', slug: 'pakketten', name_nl: 'Pakketten', name_en: 'Packages', sort_order: 2, created_at: '' },
      { id: 'c-snacks', slug: 'snacks', name_nl: 'Snacks', name_en: 'Snacks', sort_order: 3, created_at: '' },
    ];
  }
  const sb = createServiceRoleClient();
  const { data } = await sb.from('categories').select('*').order('sort_order');
  return data ?? [];
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await checkAdminAccess('staff');
  const { id } = await params;
  const [product, categories, meals] = await Promise.all([
    getProductForEdit(id),
    loadCategories(),
    listMealsForPackagePicker(),
  ]);
  if (!product) notFound();

  const initial = {
    slug: product.slug,
    name_nl: product.name_nl,
    name_en: product.name_en,
    description_nl: product.description_nl,
    description_en: product.description_en,
    type: product.type,
    category_id: product.category_id,
    is_active: product.is_active,
    is_featured: product.is_featured,
    price_cents: product.price_cents,
    compare_at_price_cents: product.compare_at_price_cents,
    stock: product.stock,
    vat_rate: typeof product.vat_rate === 'number' ? product.vat_rate : Number(product.vat_rate ?? 9),
    goal_tag: product.goal_tag,
    attribute_tags: product.attribute_tags,
    image_url: product.image_url,
    gallery_urls: product.gallery_urls,
    kcal: product.kcal,
    protein_g: product.protein_g,
    carbs_g: product.carbs_g,
    fat_g: product.fat_g,
    fiber_g: product.fiber_g,
    salt_g: product.salt_g,
    ingredients_nl: product.ingredients_nl,
    ingredients_en: product.ingredients_en,
    contains_gluten: product.contains_gluten,
    contains_lactose: product.contains_lactose,
    contains_nuts: product.contains_nuts,
    contains_eggs: product.contains_eggs,
    contains_soy: product.contains_soy,
    contains_fish: product.contains_fish,
    contains_shellfish: product.contains_shellfish,
    contains_sesame: product.contains_sesame,
    contains_celery: product.contains_celery,
    contains_mustard: product.contains_mustard,
    contains_lupine: product.contains_lupine,
    contains_sulfite: product.contains_sulfite,
    contains_mollusks: product.contains_mollusks,
    package_items: product.packageItems.map((p) => ({
      meal_id: p.mealId,
      quantity: p.quantity,
      sort_order: p.sortOrder,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold tracking-[-0.025em] mb-6">
        {product.name_nl}
        {product.isMocked && <span className="text-amber-700 text-sm ml-3 font-normal">(demo data)</span>}
      </h1>
      <ProductForm productId={id} initial={initial} categories={categories} meals={meals} />
    </div>
  );
}
