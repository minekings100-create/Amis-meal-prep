import { createServiceRoleClient } from '@/lib/supabase/server';
import type { OrderStatus, ShippingMethod } from '@/types/database';

export type OrdersTab = 'all' | 'new' | 'ready' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type OrdersSortKey = 'created_at' | 'total_cents' | 'shipping_last_name';
export type SortDir = 'asc' | 'desc';

export interface OrdersListParams {
  tab: OrdersTab;
  search: string;
  dateFrom?: string;
  dateTo?: string;
  shippingMethod?: ShippingMethod;
  amountMinCents?: number;
  amountMaxCents?: number;
  sort: OrdersSortKey;
  dir: SortDir;
  page: number;
  pageSize: 25 | 50 | 100;
}

export interface OrdersListRow {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  postalCode: string;
  city: string;
  isLocal: boolean;
  shippingMethod: ShippingMethod;
  itemThumbs: string[];
  itemCount: number;
  totalCents: number;
  paymentStatus: PaymentStatus;
  shippingStatus: ShippingStatus;
  status: OrderStatus;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type ShippingStatus = 'new' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrdersListResult {
  rows: OrdersListRow[];
  total: number;
  isMocked: boolean;
}

export interface OrdersTabCounts {
  all: number;
  new: number;
  ready: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  refunded: number;
}

const TAB_STATUS_FILTER: Record<OrdersTab, OrderStatus[] | null> = {
  all: null,
  new: ['pending'],
  ready: ['paid', 'preparing'],
  shipped: ['shipped'],
  delivered: ['delivered'],
  cancelled: ['cancelled'],
  refunded: ['refunded'],
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function isMaastrichtPostalCode(postalCode: string): boolean {
  const digits = (postalCode ?? '').replace(/\s+/g, '').slice(0, 4);
  if (digits.length !== 4) return false;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n >= 6200 && n <= 6229;
}

function deriveStatuses(o: { status: OrderStatus; mollie_payment_status: string | null }): {
  payment: PaymentStatus;
  shipping: ShippingStatus;
} {
  let payment: PaymentStatus = 'pending';
  if (o.status === 'refunded') payment = 'refunded';
  else if (
    ['paid', 'preparing', 'shipped', 'delivered'].includes(o.status) ||
    o.mollie_payment_status === 'paid'
  )
    payment = 'paid';
  else if (
    o.mollie_payment_status === 'failed' ||
    o.mollie_payment_status === 'expired' ||
    o.mollie_payment_status === 'canceled'
  )
    payment = 'failed';

  let shipping: ShippingStatus;
  switch (o.status) {
    case 'pending':
    case 'paid':
      shipping = o.status === 'paid' ? 'preparing' : 'new';
      break;
    case 'preparing':
      shipping = 'preparing';
      break;
    case 'shipped':
      shipping = 'shipped';
      break;
    case 'delivered':
      shipping = 'delivered';
      break;
    case 'cancelled':
    case 'refunded':
      shipping = 'cancelled';
      break;
    default:
      shipping = 'new';
  }
  return { payment, shipping };
}

export async function getOrdersTabCounts(): Promise<OrdersTabCounts> {
  if (!isSupabaseConfigured()) return mockedCounts();
  const sb = createServiceRoleClient();
  const counts: OrdersTabCounts = {
    all: 0, new: 0, ready: 0, shipped: 0, delivered: 0, cancelled: 0, refunded: 0,
  };
  const tabs: OrdersTab[] = ['all', 'new', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded'];
  await Promise.all(
    tabs.map(async (tab) => {
      const filter = TAB_STATUS_FILTER[tab];
      let q = sb.from('orders').select('id', { count: 'exact', head: true });
      if (filter) q = q.in('status', filter);
      const { count } = await q;
      counts[tab] = count ?? 0;
    }),
  );
  return counts;
}

export async function getOrdersListing(params: OrdersListParams): Promise<OrdersListResult> {
  if (!isSupabaseConfigured()) return mockedList(params);

  const sb = createServiceRoleClient();
  const filter = TAB_STATUS_FILTER[params.tab];

  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let q = sb
    .from('orders')
    .select(
      'id,order_number,created_at,total_cents,status,mollie_payment_status,' +
        'shipping_first_name,shipping_last_name,shipping_postal_code,shipping_city,' +
        'shipping_method,guest_email,user_id,' +
        'order_items(product_id,product_name,quantity,products(image_url))',
      { count: 'exact' },
    );

  if (filter) q = q.in('status', filter);
  if (params.shippingMethod) q = q.eq('shipping_method', params.shippingMethod);
  if (params.dateFrom) q = q.gte('created_at', params.dateFrom);
  if (params.dateTo) q = q.lte('created_at', params.dateTo);
  if (typeof params.amountMinCents === 'number') q = q.gte('total_cents', params.amountMinCents);
  if (typeof params.amountMaxCents === 'number') q = q.lte('total_cents', params.amountMaxCents);

  if (params.search.trim()) {
    const s = params.search.trim().replace(/[%,]/g, '');
    q = q.or(
      `order_number.ilike.%${s}%,shipping_first_name.ilike.%${s}%,shipping_last_name.ilike.%${s}%,guest_email.ilike.%${s}%`,
    );
  }

  q = q.order(params.sort, { ascending: params.dir === 'asc' }).range(from, to);

  const { data, count } = await q;

  const rows: OrdersListRow[] = (data ?? []).map((o) => {
    const items = (o.order_items ?? []) as Array<{
      product_name: string;
      quantity: number;
      products: { image_url: string | null } | null;
    }>;
    const thumbs = items
      .map((it) => it.products?.image_url ?? null)
      .filter((u): u is string => Boolean(u))
      .slice(0, 4);
    const totalItems = items.reduce((acc, it) => acc + (it.quantity ?? 0), 0);
    const { payment, shipping } = deriveStatuses(o);
    return {
      id: o.id,
      orderNumber: o.order_number,
      createdAt: o.created_at,
      customerName:
        `${o.shipping_first_name ?? ''} ${o.shipping_last_name ?? ''}`.trim() || '—',
      customerEmail: o.guest_email ?? '',
      postalCode: o.shipping_postal_code ?? '',
      city: o.shipping_city ?? '',
      isLocal: isMaastrichtPostalCode(o.shipping_postal_code ?? '') || o.shipping_method === 'local',
      shippingMethod: o.shipping_method,
      itemThumbs: thumbs,
      itemCount: totalItems,
      totalCents: o.total_cents,
      paymentStatus: payment,
      shippingStatus: shipping,
      status: o.status,
    };
  });

  return { rows, total: count ?? 0, isMocked: false };
}

// ============================================================
// Mock data (no Supabase)
// ============================================================
function mockedCounts(): OrdersTabCounts {
  return { all: 47, new: 4, ready: 12, shipped: 18, delivered: 9, cancelled: 2, refunded: 2 };
}

function mockedList(params: OrdersListParams): OrdersListResult {
  const all = generateMockOrders(47);
  let rows = all;
  const filter = TAB_STATUS_FILTER[params.tab];
  if (filter) rows = rows.filter((r) => filter.includes(r.status));
  if (params.shippingMethod) rows = rows.filter((r) => r.shippingMethod === params.shippingMethod);
  if (params.search.trim()) {
    const s = params.search.toLowerCase();
    rows = rows.filter(
      (r) =>
        r.orderNumber.toLowerCase().includes(s) ||
        r.customerName.toLowerCase().includes(s) ||
        r.customerEmail.toLowerCase().includes(s),
    );
  }
  if (typeof params.amountMinCents === 'number')
    rows = rows.filter((r) => r.totalCents >= params.amountMinCents!);
  if (typeof params.amountMaxCents === 'number')
    rows = rows.filter((r) => r.totalCents <= params.amountMaxCents!);
  if (params.dateFrom) rows = rows.filter((r) => r.createdAt >= params.dateFrom!);
  if (params.dateTo) rows = rows.filter((r) => r.createdAt <= params.dateTo!);

  rows = [...rows].sort((a, b) => {
    const dir = params.dir === 'asc' ? 1 : -1;
    if (params.sort === 'total_cents') return (a.totalCents - b.totalCents) * dir;
    if (params.sort === 'shipping_last_name')
      return a.customerName.localeCompare(b.customerName) * dir;
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
  });

  const total = rows.length;
  const from = (params.page - 1) * params.pageSize;
  const paged = rows.slice(from, from + params.pageSize);
  return { rows: paged, total, isMocked: true };
}

function generateMockOrders(n: number): OrdersListRow[] {
  const firstNames = ['Sanne', 'Pieter', 'Lynne', 'Mike', 'Famke', 'Jeroen', 'Lotte', 'Daan', 'Eva', 'Bart'];
  const lastNames = ['van Loon', 'de Vries', 'Krijnen', 'Janssen', 'Bos', 'Smit', 'Hendriks', 'Mulder'];
  const cities = ['Maastricht', 'Heerlen', 'Sittard', 'Roermond', 'Eindhoven', 'Tilburg', 'Amsterdam'];
  const postals = ['6211 AB', '6221 BC', '6411 CD', '6131 DE', '5611 EF', '5038 GH', '1011 JK'];
  const productImages = [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=80&h=80&fit=crop',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=80&h=80&fit=crop',
  ];
  const statuses: OrderStatus[] = [
    'pending','pending','pending','pending',
    'paid','paid','paid','paid','paid','preparing','preparing','preparing',
    'paid','paid','paid','paid','paid','preparing','preparing','preparing','paid','preparing','paid','preparing',
    'shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped','shipped',
    'delivered','delivered','delivered','delivered','delivered','delivered','delivered','delivered','delivered',
    'cancelled','cancelled',
    'refunded','refunded',
  ];
  const out: OrdersListRow[] = [];
  const now = Date.now();
  for (let i = 0; i < n; i++) {
    const status = statuses[i % statuses.length];
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[i % lastNames.length];
    const city = cities[i % cities.length];
    const postal = postals[i % postals.length];
    const created = new Date(now - i * 1000 * 60 * (60 + (i % 13) * 47));
    const itemCount = 2 + (i % 5);
    const totalCents = 2495 + i * 317 + (i % 7) * 850;
    const thumbs = Array.from({ length: Math.min(itemCount, 4) }, (_, k) => productImages[(i + k) % productImages.length]);
    const isLocal = postal.startsWith('62');
    const { payment, shipping } = deriveStatuses({ status, mollie_payment_status: status === 'pending' ? null : 'paid' });
    out.push({
      id: `mock-${i}`,
      orderNumber: `AM-${(2400 + n - i).toString().padStart(5, '0')}`,
      createdAt: created.toISOString(),
      customerName: `${fn} ${ln}`,
      customerEmail: `${fn.toLowerCase()}.${ln.replace(/\s+/g, '').toLowerCase()}@example.com`,
      postalCode: postal,
      city,
      isLocal,
      shippingMethod: isLocal ? 'local' : 'postnl',
      itemThumbs: thumbs,
      itemCount,
      totalCents,
      paymentStatus: payment,
      shippingStatus: shipping,
      status,
    });
  }
  return out;
}
