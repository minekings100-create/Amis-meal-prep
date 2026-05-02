'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

const MAX_FEATURED = 3;

interface SetFeaturedResult {
  ok: boolean;
  message?: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

/**
 * Atomically replace the entire Hot deze week selection. The order of the
 * incoming productIds becomes their featured_order (1-based). Anything not
 * in the list is unfeatured.
 */
export async function setFeaturedProductsAction(
  productIds: string[],
): Promise<SetFeaturedResult> {
  await checkAdminAccess('staff');

  if (productIds.length > MAX_FEATURED) {
    return {
      ok: false,
      message: `Maximaal ${MAX_FEATURED} producten kunnen 'Hot deze week' zijn.`,
    };
  }

  if (!isSupabaseConfigured()) {
    return { ok: true, message: 'Mocked: featured selection saved (no DB).' };
  }

  const sb = createServiceRoleClient();

  // Step 1: clear all current featured flags
  const { error: clearErr } = await sb
    .from('products')
    .update({ is_featured: false, featured_order: null })
    .eq('is_featured', true);
  if (clearErr) return { ok: false, message: clearErr.message };

  // Step 2: set the new featured products with their order
  for (let i = 0; i < productIds.length; i++) {
    const { error } = await sb
      .from('products')
      .update({ is_featured: true, featured_order: i + 1 })
      .eq('id', productIds[i]);
    if (error) return { ok: false, message: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/featured');
  return { ok: true };
}
