'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export interface ReviewActionResult {
  ok: boolean;
  count?: number;
  message?: string;
}

export async function publishReviewAction(reviewId: string): Promise<ReviewActionResult> {
  await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) return { ok: true };
  const sb = createServiceRoleClient();
  const { error } = await sb
    .from('reviews')
    .update({ is_published: true, is_deleted: false, deleted_reason: null, deleted_at: null })
    .eq('id', reviewId);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function deleteReviewAction(reviewId: string, reason: string): Promise<ReviewActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) return { ok: true };
  const sb = createServiceRoleClient();
  const { error } = await sb
    .from('reviews')
    .update({
      is_deleted: true,
      is_published: false,
      deleted_reason: reason || null,
      deleted_at: new Date().toISOString(),
      deleted_by: ctx.userId,
    })
    .eq('id', reviewId);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/reviews');
  return { ok: true };
}

export async function bulkPublishFiveStarPendingAction(): Promise<ReviewActionResult> {
  await checkAdminAccess('staff');
  if (!isSupabaseConfigured()) return { ok: true, count: 0 };
  const sb = createServiceRoleClient();
  const { data: candidates } = await sb
    .from('reviews')
    .select('id')
    .eq('rating', 5)
    .eq('is_published', false)
    .eq('is_deleted', false);
  if (!candidates?.length) return { ok: true, count: 0 };
  const ids = candidates.map((r) => r.id);
  const { error } = await sb.from('reviews').update({ is_published: true }).in('id', ids);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/reviews');
  return { ok: true, count: ids.length };
}
