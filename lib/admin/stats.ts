import { createServiceRoleClient } from '@/lib/supabase/server';
import type { OrderStatus } from '@/types/database';

export interface DashboardStats {
  shipReadyCount: number;
  lowStockCount: number;
  failedPayments24hCount: number;
  reviewsPendingCount: number;
  revenueTodayCents: number;
  revenueWeekCents: number;
  revenueMonthCents: number;
  trend30d: TrendPoint[];
  recentOrders: RecentOrder[];
  isMocked: boolean;
}

export interface TrendPoint {
  date: string;
  orders: number;
  revenueCents: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
}

const LOW_STOCK_THRESHOLD = 10;

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseConfigured()) {
    return mockedStats();
  }

  const sb = createServiceRoleClient();

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - 6);

  const startOfMonth = new Date(startOfDay);
  startOfMonth.setDate(startOfMonth.getDate() - 29);

  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    shipReadyRes,
    lowStockRes,
    failed24hRes,
    reviewsPendingRes,
    revenueRes,
    recentOrdersRes,
  ] = await Promise.all([
    sb.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'paid'),
    sb
      .from('products')
      .select('id', { count: 'exact', head: true })
      .lt('stock', LOW_STOCK_THRESHOLD)
      .eq('is_active', true),
    // Orders schema has no 'failed' status — Mollie failures land in mollie_payment_status.
    // We surface pending orders <24h old AND any order whose Mollie status indicates failure.
    sb
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', last24h.toISOString())
      .or('status.eq.pending,mollie_payment_status.in.(failed,expired,canceled)'),
    sb
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('is_published', false),
    sb
      .from('orders')
      .select('total_cents,paid_at,created_at,status')
      .gte('created_at', startOfMonth.toISOString())
      .in('status', ['paid', 'preparing', 'shipped', 'delivered']),
    sb
      .from('orders')
      .select(
        'id,order_number,total_cents,status,created_at,shipping_first_name,shipping_last_name',
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const revenueRows = revenueRes.data ?? [];
  const trendMap = new Map<string, { orders: number; revenueCents: number }>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(startOfDay);
    d.setDate(d.getDate() - i);
    trendMap.set(toIsoDate(d), { orders: 0, revenueCents: 0 });
  }

  let revenueTodayCents = 0;
  let revenueWeekCents = 0;
  let revenueMonthCents = 0;

  for (const row of revenueRows) {
    const ts = new Date(row.paid_at ?? row.created_at);
    const cents = row.total_cents ?? 0;
    if (ts >= startOfDay) revenueTodayCents += cents;
    if (ts >= startOfWeek) revenueWeekCents += cents;
    revenueMonthCents += cents;
    const key = toIsoDate(ts);
    const bucket = trendMap.get(key);
    if (bucket) {
      bucket.orders += 1;
      bucket.revenueCents += cents;
    }
  }

  const trend30d: TrendPoint[] = Array.from(trendMap.entries()).map(([date, v]) => ({
    date,
    orders: v.orders,
    revenueCents: v.revenueCents,
  }));

  const recentOrders: RecentOrder[] = (recentOrdersRes.data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    customerName: `${o.shipping_first_name ?? ''} ${o.shipping_last_name ?? ''}`.trim() || '—',
    totalCents: o.total_cents,
    status: o.status,
    createdAt: o.created_at,
  }));

  return {
    shipReadyCount: shipReadyRes.count ?? 0,
    lowStockCount: lowStockRes.count ?? 0,
    failedPayments24hCount: failed24hRes.count ?? 0,
    reviewsPendingCount: reviewsPendingRes.count ?? 0,
    revenueTodayCents,
    revenueWeekCents,
    revenueMonthCents,
    trend30d,
    recentOrders,
    isMocked: false,
  };
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function mockedStats(): DashboardStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const trend30d: TrendPoint[] = [];
  let weekRev = 0;
  let monthRev = 0;
  let todayRev = 0;
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const orders = 3 + Math.round(4 * Math.sin(i / 4) + Math.random() * 3);
    const revenue = orders * (3200 + Math.round(Math.random() * 1800));
    trend30d.push({
      date: toIsoDate(d),
      orders: Math.max(0, orders),
      revenueCents: Math.max(0, revenue),
    });
    monthRev += revenue;
    if (i < 7) weekRev += revenue;
    if (i === 0) todayRev = revenue;
  }

  const statuses: OrderStatus[] = ['paid', 'preparing', 'shipped', 'pending', 'paid'];
  const names = [
    'Sanne van Loon',
    'Pieter de Vries',
    'Lynne Krijnen',
    'Mike Janssen',
    'Famke Bos',
  ];
  const recentOrders: RecentOrder[] = names.map((name, i) => {
    const created = new Date(today);
    created.setHours(today.getHours() - i * 2 - 1);
    return {
      id: `mock-${i}`,
      orderNumber: `AM-${(2400 + i).toString().padStart(5, '0')}`,
      customerName: name,
      totalCents: 4495 + i * 612,
      status: statuses[i],
      createdAt: created.toISOString(),
    };
  });

  return {
    shipReadyCount: 12,
    lowStockCount: 3,
    failedPayments24hCount: 1,
    reviewsPendingCount: 4,
    revenueTodayCents: todayRev,
    revenueWeekCents: weekRev,
    revenueMonthCents: monthRev,
    trend30d,
    recentOrders,
    isMocked: true,
  };
}
