'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

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

export interface StockActionResult {
  ok: boolean;
  newStock?: number;
  message?: string;
}

export async function updateStockAction(
  productId: string,
  newStock: number,
): Promise<StockActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!Number.isFinite(newStock) || newStock < 0) {
    return { ok: false, message: 'Voorraad moet 0 of hoger zijn' };
  }
  if (!isSupabaseConfigured()) {
    return { ok: true, newStock };
  }
  const sb = createServiceRoleClient();
  const { data: prev } = await sb
    .from('products')
    .select('stock')
    .eq('id', productId)
    .maybeSingle();
  const { error } = await sb.from('products').update({ stock: newStock }).eq('id', productId);
  if (error) return { ok: false, message: error.message };
  await logProductActivity(productId, ctx.userId, 'stock.updated', {
    from: prev?.stock,
    to: newStock,
    delta: prev ? newStock - prev.stock : null,
  });
  revalidatePath('/admin/stock');
  return { ok: true, newStock };
}

export async function toggleProductActiveAction(
  productId: string,
  isActive: boolean,
): Promise<StockActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) return { ok: true };
  const sb = createServiceRoleClient();
  const { error } = await sb.from('products').update({ is_active: isActive }).eq('id', productId);
  if (error) return { ok: false, message: error.message };
  await logProductActivity(productId, ctx.userId, isActive ? 'product.activated' : 'product.deactivated');
  revalidatePath('/admin/stock');
  revalidatePath('/admin/products');
  return { ok: true };
}

export async function batchAddStockAction(
  additions: Array<{ productId: string; addQuantity: number }>,
): Promise<StockActionResult> {
  const ctx = await checkAdminAccess('staff');
  const filtered = additions.filter((a) => a.addQuantity > 0);
  if (filtered.length === 0) return { ok: false, message: 'Geen toevoegingen om door te voeren.' };

  if (!isSupabaseConfigured()) return { ok: true };

  const sb = createServiceRoleClient();
  const ids = filtered.map((a) => a.productId);
  const { data: current } = await sb.from('products').select('id,stock').in('id', ids);
  const stockMap = new Map((current ?? []).map((r) => [r.id, r.stock]));

  // Sequential updates (Supabase has no native batch increment; small N is fine)
  for (const add of filtered) {
    const prev = stockMap.get(add.productId) ?? 0;
    const next = prev + add.addQuantity;
    await sb.from('products').update({ stock: next }).eq('id', add.productId);
    await logProductActivity(add.productId, ctx.userId, 'stock.production_added', {
      added: add.addQuantity,
      from: prev,
      to: next,
    });
  }
  revalidatePath('/admin/stock');
  return { ok: true, message: `${filtered.length} producten bijgewerkt.` };
}
