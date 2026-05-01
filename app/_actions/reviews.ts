'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentCustomer } from '@/lib/account/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { REVIEW_EDIT_WINDOW_MS, type ReviewEligibility } from '@/lib/reviews/types';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getReviewEligibility(productId: string): Promise<ReviewEligibility> {
  const customer = await getCurrentCustomer();
  if (!customer) return { signedIn: false, verifiedBuyer: false, existing: null };

  if (!isSupabaseConfigured()) {
    // Dev: pretend signed-in customers are always verified buyers, no existing review.
    return { signedIn: true, verifiedBuyer: true, existing: null };
  }

  const sb = createServiceRoleClient();
  // Verified buyer = at least one paid+ order containing this product.
  const { data: orderItemRows } = await sb
    .from('order_items')
    .select('id,orders!inner(user_id,status)')
    .eq('product_id', productId)
    .eq('orders.user_id', customer.userId)
    .in('orders.status', ['paid', 'preparing', 'shipped', 'delivered']);
  const verifiedBuyer = (orderItemRows ?? []).length > 0;

  const { data: reviewRow } = await sb
    .from('reviews')
    .select('id,rating,title,body,is_published,is_deleted,created_at')
    .eq('user_id', customer.userId)
    .eq('product_id', productId)
    .maybeSingle();

  type ReviewRow = {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_published: boolean;
    is_deleted: boolean;
    created_at: string;
  };
  const r = reviewRow as unknown as ReviewRow | null;
  const existing = r
    ? {
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        isPublished: r.is_published,
        isDeleted: r.is_deleted,
        createdAt: r.created_at,
        isEditable:
          !r.is_published &&
          !r.is_deleted &&
          Date.now() - new Date(r.created_at).getTime() < REVIEW_EDIT_WINDOW_MS,
      }
    : null;

  return { signedIn: true, verifiedBuyer, existing };
}

export interface SubmitResult {
  ok: boolean;
  message?: string;
}

export async function submitReviewAction(input: {
  productId: string;
  rating: number;
  title: string;
  body: string;
}): Promise<SubmitResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, message: 'Niet ingelogd' };
  if (input.rating < 1 || input.rating > 5) return { ok: false, message: 'Geef een waardering' };
  if (!input.title.trim()) return { ok: false, message: 'Titel is verplicht' };
  if (input.title.length > 100) return { ok: false, message: 'Titel mag max 100 karakters zijn' };
  if (!input.body.trim()) return { ok: false, message: 'Tekst is verplicht' };
  if (input.body.length > 1000) return { ok: false, message: 'Tekst mag max 1000 karakters zijn' };

  if (!isSupabaseConfigured()) {
    return { ok: true, message: 'Dev mode: review zou worden ingediend' };
  }

  const sb = createServiceRoleClient();

  // Look up most recent qualifying order to attribute the review.
  const { data: orderRow } = await sb
    .from('order_items')
    .select('order_id,orders!inner(user_id,status,created_at)')
    .eq('product_id', input.productId)
    .eq('orders.user_id', customer.userId)
    .in('orders.status', ['paid', 'preparing', 'shipped', 'delivered'])
    .order('created_at', { ascending: false, foreignTable: 'orders' })
    .limit(1)
    .maybeSingle();
  type OrderItemRow = { order_id: string };
  const orderId = (orderRow as unknown as OrderItemRow | null)?.order_id ?? null;

  // If existing review by this user for this product within edit window, update; else insert.
  const { data: existing } = await sb
    .from('reviews')
    .select('id,is_published,is_deleted,created_at')
    .eq('user_id', customer.userId)
    .eq('product_id', input.productId)
    .maybeSingle();
  type Existing = { id: string; is_published: boolean; is_deleted: boolean; created_at: string } | null;
  const e = existing as unknown as Existing;

  if (e) {
    const editable =
      !e.is_published &&
      !e.is_deleted &&
      Date.now() - new Date(e.created_at).getTime() < REVIEW_EDIT_WINDOW_MS;
    if (!editable) return { ok: false, message: 'Je review kan niet meer bewerkt worden' };
    const { error } = await sb
      .from('reviews')
      .update({
        rating: input.rating,
        title: input.title.trim(),
        body: input.body.trim(),
      })
      .eq('id', e.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath('/shop/[slug]', 'page');
    return { ok: true, message: 'Review bijgewerkt' };
  }

  const { error } = await sb.from('reviews').insert({
    product_id: input.productId,
    user_id: customer.userId,
    order_id: orderId,
    rating: input.rating,
    title: input.title.trim(),
    body: input.body.trim(),
    is_published: false,
    is_deleted: false,
  });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/shop/[slug]', 'page');
  return { ok: true, message: 'Review verstuurd, wordt binnen 24u gepubliceerd' };
}
