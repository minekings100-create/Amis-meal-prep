'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

async function logActivity(
  orderId: string,
  userId: string,
  action: string,
  details?: Record<string, unknown>,
) {
  if (!isSupabaseConfigured()) return;
  const sb = createServiceRoleClient();
  await sb.from('order_activity_log').insert({
    order_id: orderId,
    user_id: userId,
    action,
    details: details ?? null,
  });
}

export interface ActionResult {
  ok: boolean;
  message?: string;
}

export async function saveInternalNoteAction(
  orderId: string,
  note: string,
): Promise<ActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const { error } = await sb.from('orders').update({ internal_note: note }).eq('id', orderId);
    if (error) return { ok: false, message: error.message };
    await logActivity(orderId, ctx.userId, 'note.updated', { length: note.length });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function markOrderShippedAction(orderId: string): Promise<ActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const now = new Date().toISOString();
    const { error } = await sb
      .from('orders')
      .update({ status: 'shipped', shipped_at: now })
      .eq('id', orderId);
    if (error) return { ok: false, message: error.message };
    await logActivity(orderId, ctx.userId, 'order.shipped', { method: 'manual' });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { ok: true };
}

export async function markOrderDeliveredAction(orderId: string): Promise<ActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const { error } = await sb
      .from('orders')
      .update({ status: 'delivered', delivered_at: new Date().toISOString() })
      .eq('id', orderId);
    if (error) return { ok: false, message: error.message };
    await logActivity(orderId, ctx.userId, 'order.delivered');
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { ok: true };
}

export async function cancelOrderAction(
  orderId: string,
  reason: string,
): Promise<ActionResult> {
  const ctx = await checkAdminAccess('owner');
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const { error } = await sb.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
    if (error) return { ok: false, message: error.message };
    await logActivity(orderId, ctx.userId, 'order.cancelled', { reason });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { ok: true };
}

/**
 * Stub: real implementation calls Sendcloud API to create a parcel + label.
 * For now, marks order as shipped and stores fake parcel id + tracking.
 */
export async function createSendcloudLabelAction(
  orderId: string,
): Promise<ActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const fakeId = 'sc_' + Math.random().toString(36).slice(2, 10);
    const fakeTracking = '3SAMI' + Math.floor(Math.random() * 1e10).toString().padStart(10, '0');
    const trackingUrl = `https://jouw.postnl.nl/track-and-trace/${fakeTracking}-NL-1011AB`;
    const { error } = await sb
      .from('orders')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        sendcloud_parcel_id: fakeId,
        tracking_number: fakeTracking,
        tracking_url: trackingUrl,
      })
      .eq('id', orderId);
    if (error) return { ok: false, message: error.message };
    await logActivity(orderId, ctx.userId, 'sendcloud.label_created', {
      parcel_id: fakeId,
      tracking_number: fakeTracking,
    });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: 'Label aangemaakt en order op verzonden gezet.' };
}

/**
 * Stub: real implementation calls Mollie refund API.
 * For now, marks order as refunded and logs the requested amount.
 */
export async function refundOrderAction(
  orderId: string,
  amountCents: number,
  reason: string,
): Promise<ActionResult> {
  const ctx = await checkAdminAccess('owner');
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const { error } = await sb.from('orders').update({ status: 'refunded' }).eq('id', orderId);
    if (error) return { ok: false, message: error.message };
    await logActivity(orderId, ctx.userId, 'refund.initiated', {
      amount_cents: amountCents,
      reason,
    });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { ok: true, message: 'Refund geïnitieerd.' };
}

/**
 * Stub: real implementation triggers Resend with the chosen template.
 */
export async function emailCustomerAction(
  orderId: string,
  template: 'order-confirmation' | 'delay' | 'question',
): Promise<ActionResult> {
  const ctx = await checkAdminAccess('staff');
  if (isSupabaseConfigured()) {
    await logActivity(orderId, ctx.userId, 'email.sent', { template });
  }
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, message: 'Email queued.' };
}
