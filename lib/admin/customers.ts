import { createServiceRoleClient } from '@/lib/supabase/server';

export type CustomerStatus = 'vip' | 'active' | 'inactive' | 'risk' | 'new';
export type CustomerFilter = 'all' | 'vip' | 'new' | 'risk';

export interface CustomerRow {
  userId: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  firstOrderAt: string | null;
  lastOrderAt: string | null;
  totalOrders: number;
  ltvCents: number;
  status: CustomerStatus;
}

export interface CustomerListing {
  rows: CustomerRow[];
  isMocked: boolean;
}

export interface CustomerListParams {
  search: string;
  filter: CustomerFilter;
  sort: 'lastOrder' | 'totalOrders' | 'ltv' | 'firstOrder' | 'name';
  dir: 'asc' | 'desc';
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function deriveStatus(row: { totalOrders: number; lastOrderAt: string | null; firstOrderAt: string | null }): CustomerStatus {
  if (row.totalOrders === 0) return 'inactive';
  if (row.totalOrders > 5) return 'vip';
  const lastOrder = row.lastOrderAt ? new Date(row.lastOrderAt).getTime() : 0;
  const daysSince = (Date.now() - lastOrder) / (1000 * 60 * 60 * 24);
  if (daysSince > 60) return 'risk';
  const firstOrder = row.firstOrderAt ? new Date(row.firstOrderAt).getTime() : 0;
  const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  if (firstOrder > monthAgo) return 'new';
  return 'active';
}

export async function getCustomersListing(params: CustomerListParams): Promise<CustomerListing> {
  if (!isSupabaseConfigured()) return mockedListing(params);

  const sb = createServiceRoleClient();
  // Pull all profiles + aggregate orders. For a real high-volume system this
  // should be a SQL view; for AMIS scale (likely <5k customers) this is fine.
  const [profilesRes, ordersRes] = await Promise.all([
    sb
      .from('profiles')
      .select('id,email,first_name,last_name,role')
      .neq('role', 'staff')
      .neq('role', 'owner')
      .order('email')
      .limit(1000),
    sb
      .from('orders')
      .select('user_id,total_cents,created_at,status')
      .not('user_id', 'is', null)
      .in('status', ['paid', 'preparing', 'shipped', 'delivered']),
  ]);

  type Agg = { total: number; ltv: number; first: string | null; last: string | null };
  const agg = new Map<string, Agg>();
  for (const o of ordersRes.data ?? []) {
    if (!o.user_id) continue;
    const a = agg.get(o.user_id) ?? { total: 0, ltv: 0, first: null, last: null };
    a.total += 1;
    a.ltv += o.total_cents;
    if (!a.first || o.created_at < a.first) a.first = o.created_at;
    if (!a.last || o.created_at > a.last) a.last = o.created_at;
    agg.set(o.user_id, a);
  }

  let rows: CustomerRow[] = (profilesRes.data ?? []).map((p) => {
    const a = agg.get(p.id) ?? { total: 0, ltv: 0, first: null, last: null };
    const base = {
      userId: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      email: p.email,
      firstOrderAt: a.first,
      lastOrderAt: a.last,
      totalOrders: a.total,
      ltvCents: a.ltv,
    };
    return { ...base, status: deriveStatus({ totalOrders: a.total, lastOrderAt: a.last, firstOrderAt: a.first }) };
  });

  rows = applyFilters(rows, params);
  rows = sortRows(rows, params);
  return { rows, isMocked: false };
}

function applyFilters(rows: CustomerRow[], params: CustomerListParams): CustomerRow[] {
  let r = rows;
  if (params.search.trim()) {
    const q = params.search.toLowerCase();
    r = r.filter(
      (x) =>
        x.email.toLowerCase().includes(q) ||
        `${x.firstName ?? ''} ${x.lastName ?? ''}`.toLowerCase().includes(q),
    );
  }
  if (params.filter === 'vip') r = r.filter((x) => x.status === 'vip');
  if (params.filter === 'new') r = r.filter((x) => x.status === 'new');
  if (params.filter === 'risk') r = r.filter((x) => x.status === 'risk');
  return r;
}

function sortRows(rows: CustomerRow[], params: CustomerListParams): CustomerRow[] {
  const dir = params.dir === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (params.sort) {
      case 'totalOrders':
        return (a.totalOrders - b.totalOrders) * dir;
      case 'ltv':
        return (a.ltvCents - b.ltvCents) * dir;
      case 'firstOrder':
        return ((a.firstOrderAt ? new Date(a.firstOrderAt).getTime() : 0) - (b.firstOrderAt ? new Date(b.firstOrderAt).getTime() : 0)) * dir;
      case 'name':
        return `${a.lastName ?? ''}${a.firstName ?? ''}`.localeCompare(`${b.lastName ?? ''}${b.firstName ?? ''}`) * dir;
      case 'lastOrder':
      default:
        return ((a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0) - (b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0)) * dir;
    }
  });
}

export interface CustomerDetail {
  customer: CustomerRow & { phone: string | null; internalNote: string | null };
  averageOrderCents: number;
  orders: Array<{ id: string; orderNumber: string; createdAt: string; totalCents: number; status: string }>;
  reviews: Array<{ id: string; rating: number; title: string | null; productName: string; createdAt: string }>;
  isMocked: boolean;
}

export async function getCustomerDetail(userId: string): Promise<CustomerDetail | null> {
  if (!isSupabaseConfigured()) return mockedDetail(userId);
  const sb = createServiceRoleClient();
  const { data: profile } = await sb
    .from('profiles')
    .select('id,email,first_name,last_name,phone')
    .eq('id', userId)
    .maybeSingle();
  if (!profile) return null;

  const [ordersRes, reviewsRes] = await Promise.all([
    sb
      .from('orders')
      .select('id,order_number,total_cents,status,created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    sb
      .from('reviews')
      .select('id,rating,title,created_at,product_id,products(name_nl)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ]);

  const orders = ordersRes.data ?? [];
  const ltv = orders.filter((o) => ['paid', 'preparing', 'shipped', 'delivered'].includes(o.status)).reduce((acc, o) => acc + o.total_cents, 0);
  const totalOrders = orders.length;
  const avg = totalOrders > 0 ? Math.round(ltv / totalOrders) : 0;
  const firstOrderAt = orders.length ? orders[orders.length - 1].created_at : null;
  const lastOrderAt = orders.length ? orders[0].created_at : null;

  return {
    customer: {
      userId: profile.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
      phone: profile.phone,
      firstOrderAt,
      lastOrderAt,
      totalOrders,
      ltvCents: ltv,
      status: deriveStatus({ totalOrders, lastOrderAt, firstOrderAt }),
      internalNote: null,
    },
    averageOrderCents: avg,
    orders: orders.map((o) => ({ id: o.id, orderNumber: o.order_number, createdAt: o.created_at, totalCents: o.total_cents, status: o.status })),
    reviews: (reviewsRes.data ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      productName: (r as { products: { name_nl: string } | null }).products?.name_nl ?? '—',
      createdAt: r.created_at,
    })),
    isMocked: false,
  };
}

// ============================================================
// Mocked
// ============================================================
function mockedListing(params: CustomerListParams): CustomerListing {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const customers: CustomerRow[] = [
    { userId: 'u1', firstName: 'Sanne', lastName: 'van Loon', email: 'sanne@example.com', firstOrderAt: new Date(now - 90 * day).toISOString(), lastOrderAt: new Date(now - 4 * day).toISOString(), totalOrders: 12, ltvCents: 65800, status: 'vip' },
    { userId: 'u2', firstName: 'Mike', lastName: 'Janssen', email: 'mike@example.com', firstOrderAt: new Date(now - 120 * day).toISOString(), lastOrderAt: new Date(now - 8 * day).toISOString(), totalOrders: 9, ltvCents: 48750, status: 'vip' },
    { userId: 'u3', firstName: 'Lotte', lastName: 'Hendriks', email: 'lotte@example.com', firstOrderAt: new Date(now - 12 * day).toISOString(), lastOrderAt: new Date(now - 12 * day).toISOString(), totalOrders: 1, ltvCents: 4495, status: 'new' },
    { userId: 'u4', firstName: 'Daan', lastName: 'Smit', email: 'daan@example.com', firstOrderAt: new Date(now - 220 * day).toISOString(), lastOrderAt: new Date(now - 75 * day).toISOString(), totalOrders: 3, ltvCents: 13980, status: 'risk' },
    { userId: 'u5', firstName: 'Eva', lastName: 'Bos', email: 'eva@example.com', firstOrderAt: new Date(now - 45 * day).toISOString(), lastOrderAt: new Date(now - 9 * day).toISOString(), totalOrders: 4, ltvCents: 18995, status: 'active' },
    { userId: 'u6', firstName: 'Pieter', lastName: 'de Vries', email: 'pieter@example.com', firstOrderAt: new Date(now - 6 * day).toISOString(), lastOrderAt: new Date(now - 6 * day).toISOString(), totalOrders: 1, ltvCents: 2495, status: 'new' },
    { userId: 'u7', firstName: 'Tijn', lastName: 'van Roosmalen', email: 'tijn@example.com', firstOrderAt: new Date(now - 180 * day).toISOString(), lastOrderAt: new Date(now - 14 * day).toISOString(), totalOrders: 7, ltvCents: 35470, status: 'vip' },
    { userId: 'u8', firstName: 'Famke', lastName: 'Bos', email: 'famke@example.com', firstOrderAt: new Date(now - 65 * day).toISOString(), lastOrderAt: new Date(now - 70 * day).toISOString(), totalOrders: 2, ltvCents: 7990, status: 'risk' },
  ];
  let rows = customers;
  rows = applyFilters(rows, params);
  rows = sortRows(rows, params);
  return { rows, isMocked: true };
}

function mockedDetail(userId: string): CustomerDetail {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  const orders = [
    { id: 'o1', orderNumber: 'AM-02410', createdAt: new Date(now - 4 * day).toISOString(), totalCents: 5495, status: 'delivered' },
    { id: 'o2', orderNumber: 'AM-02398', createdAt: new Date(now - 11 * day).toISOString(), totalCents: 4995, status: 'delivered' },
    { id: 'o3', orderNumber: 'AM-02380', createdAt: new Date(now - 18 * day).toISOString(), totalCents: 7995, status: 'delivered' },
    { id: 'o4', orderNumber: 'AM-02365', createdAt: new Date(now - 25 * day).toISOString(), totalCents: 5495, status: 'delivered' },
  ];
  const ltv = orders.reduce((acc, o) => acc + o.totalCents, 0);
  return {
    customer: {
      userId,
      firstName: 'Sanne',
      lastName: 'van Loon',
      email: 'sanne@example.com',
      phone: '+31 6 1234 5678',
      firstOrderAt: orders[orders.length - 1].createdAt,
      lastOrderAt: orders[0].createdAt,
      totalOrders: orders.length,
      ltvCents: ltv,
      status: 'vip',
      internalNote: 'VIP klant, vraagt soms naar speciale dieet-aanpassingen.',
    },
    averageOrderCents: Math.round(ltv / orders.length),
    orders,
    reviews: [
      { id: 'rv1', rating: 5, title: 'Topkwaliteit!', productName: 'Kip Teriyaki Bowl', createdAt: new Date(now - 8 * day).toISOString() },
      { id: 'rv2', rating: 4, title: 'Lekker pakket', productName: 'Cut Pakket — 7 maaltijden', createdAt: new Date(now - 22 * day).toISOString() },
    ],
    isMocked: true,
  };
}
