import { createServiceRoleClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/database';

export interface CustomerOrderListRow {
  id: string;
  orderNumber: string;
  createdAt: string;
  totalCents: number;
  status: OrderStatus;
  itemCount: number;
}

export interface CustomerStats {
  totalOrders: number;
  ltvCents: number;
  reviewsCount: number;
  recentOrders: CustomerOrderListRow[];
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function listCustomerOrders(userId: string): Promise<CustomerOrderListRow[]> {
  if (!isSupabaseConfigured()) return mockOrders();
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('orders')
    .select('id,order_number,created_at,total_cents,status,order_items(quantity)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  type Row = {
    id: string;
    order_number: string;
    created_at: string;
    total_cents: number;
    status: OrderStatus;
    order_items: Array<{ quantity: number }> | null;
  };
  return ((data as unknown as Row[]) ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    totalCents: o.total_cents,
    status: o.status,
    itemCount: (o.order_items ?? []).reduce((acc, it) => acc + (it.quantity ?? 0), 0),
  }));
}

export async function getCustomerStats(userId: string): Promise<CustomerStats> {
  const orders = await listCustomerOrders(userId);
  const ltvCents = orders
    .filter((o) => ['paid', 'preparing', 'shipped', 'delivered'].includes(o.status))
    .reduce((acc, o) => acc + o.totalCents, 0);

  let reviewsCount = 0;
  if (isSupabaseConfigured()) {
    const sb = createServiceRoleClient();
    const { count } = await sb
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    reviewsCount = count ?? 0;
  } else {
    reviewsCount = 2;
  }

  return {
    totalOrders: orders.length,
    ltvCents,
    reviewsCount,
    recentOrders: orders.slice(0, 3),
  };
}

function mockOrders(): CustomerOrderListRow[] {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  return [
    { id: 'mock-1', orderNumber: 'AMIS-2026-12348', createdAt: new Date(now - 4 * day).toISOString(), totalCents: 5495, status: 'shipped', itemCount: 7 },
    { id: 'mock-2', orderNumber: 'AMIS-2026-12330', createdAt: new Date(now - 18 * day).toISOString(), totalCents: 4995, status: 'delivered', itemCount: 5 },
    { id: 'mock-3', orderNumber: 'AMIS-2026-12305', createdAt: new Date(now - 32 * day).toISOString(), totalCents: 7995, status: 'delivered', itemCount: 7 },
    { id: 'mock-4', orderNumber: 'AMIS-2026-12290', createdAt: new Date(now - 45 * day).toISOString(), totalCents: 3495, status: 'delivered', itemCount: 3 },
  ];
}
