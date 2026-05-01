'use server';

import { redirect } from 'next/navigation';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

export interface TrackingSearchResult {
  ok: boolean;
  orderId?: string;
  message?: string;
}

export async function findOrderByTrackingNumberAction(
  trackingNumber: string,
): Promise<TrackingSearchResult> {
  await checkAdminAccess('staff');
  const tn = trackingNumber.trim();
  if (!tn) return { ok: false, message: 'Voer een tracking nummer in' };

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, message: 'Supabase niet verbonden — kan niet zoeken' };
  }

  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('orders')
    .select('id')
    .eq('tracking_number', tn)
    .maybeSingle();

  if (!data) {
    return { ok: false, message: 'Geen order met dit tracking nummer' };
  }

  redirect(`/admin/orders/${data.id}`);
}
