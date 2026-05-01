'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function logProductActivity(
  productId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>,
) {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceRoleClient();
  await sb.from('product_activity_log').insert({
    product_id: productId,
    user_id: userId,
    action,
    details: details ?? null,
  });
}

export interface ProductFormPayload {
  slug: string;
  name_nl: string;
  name_en: string;
  description_nl: string | null;
  description_en: string | null;
  type: 'meal' | 'package' | 'tryout';
  category_id: string | null;
  is_active: boolean;
  is_featured: boolean;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  vat_rate: number;
  goal_tag: 'cut' | 'bulk' | 'performance' | 'maintenance' | 'hybrid' | null;
  attribute_tags: string[];
  image_url: string | null;
  gallery_urls: string[];
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  salt_g: number | null;
  ingredients_nl: string | null;
  ingredients_en: string | null;
  contains_gluten: boolean;
  contains_lactose: boolean;
  contains_nuts: boolean;
  contains_eggs: boolean;
  contains_soy: boolean;
  contains_fish: boolean;
  contains_shellfish: boolean;
  contains_sesame: boolean;
  contains_celery: boolean;
  contains_mustard: boolean;
  contains_lupine: boolean;
  contains_sulfite: boolean;
  contains_mollusks: boolean;
  package_items?: Array<{ meal_id: string; quantity: number; sort_order: number }>;
}

export interface ProductActionResult {
  ok: boolean;
  productId?: string;
  message?: string;
}

export async function createProductAction(payload: ProductFormPayload): Promise<ProductActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) {
    return { ok: true, productId: 'mock-new', message: 'Mocked: zou hier een product aanmaken.' };
  }
  const sb = createServiceRoleClient();
  const insert = toInsert(payload);
  const { data, error } = await sb.from('products').insert(insert).select('id').single();
  if (error) return { ok: false, message: error.message };

  if (payload.type === 'package' && payload.package_items?.length) {
    await sb.from('package_items').insert(
      payload.package_items.map((it) => ({
        package_id: data.id,
        meal_id: it.meal_id,
        quantity: it.quantity,
        sort_order: it.sort_order,
      })),
    );
  }

  await logProductActivity(data.id, ctx.userId, 'product.created', { name: payload.name_nl });
  revalidatePath('/admin/products');
  return { ok: true, productId: data.id };
}

export async function updateProductAction(
  productId: string,
  payload: ProductFormPayload,
): Promise<ProductActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) return { ok: true, productId };

  const sb = createServiceRoleClient();
  const update = toInsert(payload);
  const { error } = await sb.from('products').update(update).eq('id', productId);
  if (error) return { ok: false, message: error.message };

  if (payload.type === 'package') {
    await sb.from('package_items').delete().eq('package_id', productId);
    if (payload.package_items?.length) {
      await sb.from('package_items').insert(
        payload.package_items.map((it) => ({
          package_id: productId,
          meal_id: it.meal_id,
          quantity: it.quantity,
          sort_order: it.sort_order,
        })),
      );
    }
  }

  await logProductActivity(productId, ctx.userId, 'product.updated');
  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${productId}/edit`);
  return { ok: true, productId };
}

export async function duplicateProductAction(productId: string): Promise<ProductActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) {
    redirect('/admin/products/new');
  }
  const sb = createServiceRoleClient();
  const { data: src, error: fetchErr } = await sb
    .from('products')
    .select('*')
    .eq('id', productId)
    .maybeSingle();
  if (fetchErr || !src) return { ok: false, message: fetchErr?.message ?? 'Niet gevonden' };

  const srcRow = src as Database['public']['Tables']['products']['Row'];
  const dup: Record<string, unknown> = { ...srcRow };
  delete dup.id;
  delete dup.created_at;
  delete dup.updated_at;
  dup.slug = `${srcRow.slug}-kopie-${Date.now().toString(36).slice(-4)}`;
  dup.name_nl = `${srcRow.name_nl} (kopie)`;
  dup.name_en = `${srcRow.name_en} (copy)`;
  dup.is_active = false;
  dup.is_featured = false;
  const { data: created, error } = await sb.from('products').insert(dup).select('id').single();
  if (error) return { ok: false, message: error.message };

  if (src.type === 'package') {
    const { data: items } = await sb
      .from('package_items')
      .select('meal_id,quantity,sort_order')
      .eq('package_id', productId);
    if (items?.length) {
      await sb.from('package_items').insert(
        items.map((it) => ({ package_id: created.id, meal_id: it.meal_id, quantity: it.quantity, sort_order: it.sort_order })),
      );
    }
  }
  await logProductActivity(created.id, ctx.userId, 'product.duplicated', { source: productId });
  revalidatePath('/admin/products');
  return { ok: true, productId: created.id };
}

export async function softDeleteProductAction(productId: string): Promise<ProductActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) return { ok: true };
  const sb = createServiceRoleClient();
  const { error } = await sb.from('products').update({ is_active: false }).eq('id', productId);
  if (error) return { ok: false, message: error.message };
  await logProductActivity(productId, ctx.userId, 'product.deactivated');
  revalidatePath('/admin/products');
  return { ok: true };
}

function toInsert(p: ProductFormPayload) {
  return {
    slug: p.slug,
    type: p.type,
    name_nl: p.name_nl,
    name_en: p.name_en,
    description_nl: p.description_nl,
    description_en: p.description_en,
    category_id: p.category_id,
    is_active: p.is_active,
    is_featured: p.is_featured,
    price_cents: p.price_cents,
    compare_at_price_cents: p.compare_at_price_cents,
    stock: p.stock,
    vat_rate: p.vat_rate,
    goal_tag: p.goal_tag,
    attribute_tags: p.attribute_tags,
    image_url: p.image_url,
    gallery_urls: p.gallery_urls,
    kcal: p.kcal,
    protein_g: p.protein_g,
    carbs_g: p.carbs_g,
    fat_g: p.fat_g,
    fiber_g: p.fiber_g,
    salt_g: p.salt_g,
    ingredients_nl: p.ingredients_nl,
    ingredients_en: p.ingredients_en,
    contains_gluten: p.contains_gluten,
    contains_lactose: p.contains_lactose,
    contains_nuts: p.contains_nuts,
    contains_eggs: p.contains_eggs,
    contains_soy: p.contains_soy,
    contains_fish: p.contains_fish,
    contains_shellfish: p.contains_shellfish,
    contains_sesame: p.contains_sesame,
    contains_celery: p.contains_celery,
    contains_mustard: p.contains_mustard,
    contains_lupine: p.contains_lupine,
    contains_sulfite: p.contains_sulfite,
    contains_mollusks: p.contains_mollusks,
  };
}
