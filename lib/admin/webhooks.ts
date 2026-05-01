import { createServiceRoleClient } from '@/lib/supabase/server';
import type { Json } from '@/types/database';

export type WebhookSource = 'mollie' | 'sendcloud' | 'resend';
export type WebhookStatus = 'received' | 'processed' | 'failed';

export interface WebhookLogEntry {
  id: string;
  source: WebhookSource;
  eventType: string | null;
  status: WebhookStatus;
  payload: Json | null;
  errorMessage: string | null;
  relatedOrderId: string | null;
  relatedOrderNumber: string | null;
  receivedAt: string;
  processedAt: string | null;
}

export interface WebhookListing {
  rows: WebhookLogEntry[];
  isMocked: boolean;
}

export interface WebhookListParams {
  source?: WebhookSource;
  status?: WebhookStatus;
  search: string;
  dateFrom?: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getWebhookListing(params: WebhookListParams): Promise<WebhookListing> {
  if (!isSupabaseConfigured()) return mockedListing(params);

  const sb = createServiceRoleClient();
  let q = sb
    .from('webhook_log')
    .select('id,source,event_type,status,payload,error_message,related_order_id,received_at,processed_at,orders(order_number)')
    .order('received_at', { ascending: false })
    .limit(200);

  if (params.source) q = q.eq('source', params.source);
  if (params.status) q = q.eq('status', params.status);
  if (params.dateFrom) q = q.gte('received_at', params.dateFrom);
  if (params.search.trim()) {
    q = q.or(`event_type.ilike.%${params.search}%,error_message.ilike.%${params.search}%`);
  }

  const { data } = await q;
  type WebhookRow = {
    id: string;
    source: WebhookSource;
    event_type: string | null;
    status: WebhookStatus;
    payload: Json | null;
    error_message: string | null;
    related_order_id: string | null;
    received_at: string;
    processed_at: string | null;
    orders: { order_number: string } | { order_number: string }[] | null;
  };
  const rows: WebhookLogEntry[] = ((data as unknown as WebhookRow[]) ?? []).map((row) => {
    const order = Array.isArray(row.orders) ? row.orders[0] ?? null : row.orders;
    return {
      id: row.id,
      source: row.source,
      eventType: row.event_type,
      status: row.status,
      payload: row.payload,
      errorMessage: row.error_message,
      relatedOrderId: row.related_order_id,
      relatedOrderNumber: order?.order_number ?? null,
      receivedAt: row.received_at,
      processedAt: row.processed_at,
    };
  });

  return { rows, isMocked: false };
}

function mockedListing(params: WebhookListParams): WebhookListing {
  const now = Date.now();
  const min = 1000 * 60;
  const all: WebhookLogEntry[] = [
    { id: 'w1', source: 'mollie', eventType: 'payment.paid', status: 'processed', payload: { id: 'tr_abc123', amount: { currency: 'EUR', value: '54.95' } }, errorMessage: null, relatedOrderId: 'mock-0', relatedOrderNumber: 'AM-02410', receivedAt: new Date(now - 4 * min).toISOString(), processedAt: new Date(now - 4 * min + 200).toISOString() },
    { id: 'w2', source: 'sendcloud', eventType: 'parcel_status_changed', status: 'processed', payload: { parcel: { id: 12345, status: { id: 11, message: 'Sorted' } } }, errorMessage: null, relatedOrderId: 'mock-1', relatedOrderNumber: 'AM-02408', receivedAt: new Date(now - 22 * min).toISOString(), processedAt: new Date(now - 22 * min + 130).toISOString() },
    { id: 'w3', source: 'mollie', eventType: 'payment.failed', status: 'processed', payload: { id: 'tr_xyz999', amount: { currency: 'EUR', value: '34.95' } }, errorMessage: null, relatedOrderId: 'mock-2', relatedOrderNumber: 'AM-02406', receivedAt: new Date(now - 50 * min).toISOString(), processedAt: new Date(now - 50 * min + 90).toISOString() },
    { id: 'w4', source: 'resend', eventType: 'email.delivered', status: 'processed', payload: { type: 'email.delivered', data: { email_id: 'em_q1', to: 'sanne@example.com' } }, errorMessage: null, relatedOrderId: 'mock-0', relatedOrderNumber: 'AM-02410', receivedAt: new Date(now - 90 * min).toISOString(), processedAt: new Date(now - 90 * min + 60).toISOString() },
    { id: 'w5', source: 'mollie', eventType: 'payment.paid', status: 'failed', payload: { id: 'tr_broken', amount: { currency: 'EUR', value: '14.95' } }, errorMessage: 'Order not found for mollie_payment_id tr_broken', relatedOrderId: null, relatedOrderNumber: null, receivedAt: new Date(now - 6 * 60 * min).toISOString(), processedAt: new Date(now - 6 * 60 * min + 200).toISOString() },
    { id: 'w6', source: 'sendcloud', eventType: 'parcel_created', status: 'received', payload: { parcel: { id: 99887, status: 'pending' } }, errorMessage: null, relatedOrderId: null, relatedOrderNumber: null, receivedAt: new Date(now - 28 * 60 * min).toISOString(), processedAt: null },
  ];

  let rows = all;
  if (params.source) rows = rows.filter((r) => r.source === params.source);
  if (params.status) rows = rows.filter((r) => r.status === params.status);
  if (params.search.trim()) {
    const q = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        (r.eventType ?? '').toLowerCase().includes(q) ||
        (r.errorMessage ?? '').toLowerCase().includes(q) ||
        (r.relatedOrderNumber ?? '').toLowerCase().includes(q),
    );
  }
  return { rows, isMocked: true };
}
