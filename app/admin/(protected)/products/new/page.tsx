import { checkAdminAccess } from '@/lib/admin/auth';
import { listMealsForPackagePicker } from '@/lib/admin/products';
import { ProductForm } from '@/components/admin/products/product-form';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Category } from '@/types/database';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nieuw product' };

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

export default async function NewProductPage() {
  await checkAdminAccess('staff');
  const [categories, meals] = await Promise.all([loadCategories(), listMealsForPackagePicker()]);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <h1 className="text-3xl font-bold tracking-[-0.025em] mb-6">Nieuw product</h1>
      <ProductForm categories={categories} meals={meals} />
    </div>
  );
}
