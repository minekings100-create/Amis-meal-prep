import { checkAdminAccess } from '@/lib/admin/auth';
import { OrdersTabs } from '@/components/admin/orders/orders-tabs';
import { OrdersFilterBar } from '@/components/admin/orders/filter-bar';
import { OrdersTable } from '@/components/admin/orders/orders-table';
import {
  getOrdersListing,
  getOrdersTabCounts,
  type OrdersListParams,
  type OrdersTab,
  type OrdersSortKey,
  type SortDir,
} from '@/lib/admin/orders';
import type { ShippingMethod } from '@/types/database';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bestellingen' };

const VALID_TABS: OrdersTab[] = ['all', 'new', 'ready', 'shipped', 'delivered', 'cancelled', 'refunded'];
const VALID_SORTS: OrdersSortKey[] = ['created_at', 'total_cents', 'shipping_last_name'];

function parseSearchParams(
  sp: Record<string, string | string[] | undefined>,
): OrdersListParams {
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const tabRaw = (get('tab') ?? 'all') as OrdersTab;
  const tab = VALID_TABS.includes(tabRaw) ? tabRaw : 'all';

  const sortRaw = (get('sort') ?? 'created_at') as OrdersSortKey;
  const sort = VALID_SORTS.includes(sortRaw) ? sortRaw : 'created_at';
  const dir: SortDir = get('dir') === 'asc' ? 'asc' : 'desc';

  const page = Math.max(1, parseInt(get('page') ?? '1', 10) || 1);
  const sizeRaw = parseInt(get('pageSize') ?? '25', 10);
  const pageSize: 25 | 50 | 100 = sizeRaw === 50 ? 50 : sizeRaw === 100 ? 100 : 25;

  const range = get('range');
  let dateFrom: string | undefined;
  let dateTo: string | undefined;
  if (range === 'today' || range === '7d' || range === '30d') {
    const days = range === 'today' ? 0 : range === '7d' ? 7 : 30;
    const from = new Date();
    from.setHours(0, 0, 0, 0);
    if (days > 0) from.setDate(from.getDate() - days);
    dateFrom = from.toISOString();
  } else if (range === 'custom') {
    dateFrom = get('from');
    dateTo = get('to');
  }

  const methodRaw = get('method') as ShippingMethod | undefined;
  const shippingMethod: ShippingMethod | undefined =
    methodRaw === 'local' || methodRaw === 'postnl' ? methodRaw : undefined;

  const minStr = get('min');
  const maxStr = get('max');
  const amountMinCents = minStr ? Math.round(parseFloat(minStr) * 100) : undefined;
  const amountMaxCents = maxStr ? Math.round(parseFloat(maxStr) * 100) : undefined;

  return {
    tab,
    search: get('q') ?? '',
    dateFrom,
    dateTo,
    shippingMethod,
    amountMinCents: Number.isFinite(amountMinCents) ? amountMinCents : undefined,
    amountMaxCents: Number.isFinite(amountMaxCents) ? amountMaxCents : undefined,
    sort,
    dir,
    page,
    pageSize,
  };
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const ctx = await checkAdminAccess('staff');
  const sp = await searchParams;
  const params = parseSearchParams(sp);

  const [counts, listing] = await Promise.all([
    getOrdersTabCounts(),
    getOrdersListing(params),
  ]);

  function buildTabHref(tab: OrdersTab): string {
    const next = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (k === 'tab' || k === 'page') return;
      if (Array.isArray(v)) v.forEach((x) => next.append(k, x));
      else if (typeof v === 'string') next.set(k, v);
    });
    if (tab !== 'all') next.set('tab', tab);
    const qs = next.toString();
    return `/admin/orders${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.025em]">Bestellingen</h1>
            <p className="text-stone-600 mt-1 text-sm">
              {listing.total} totaal
              {listing.isMocked && (
                <span className="text-amber-700 ml-2">(demo data — Supabase niet verbonden)</span>
              )}
            </p>
          </div>
        </div>
        <div className="mt-6">
          <OrdersTabs active={params.tab} counts={counts} buildHref={buildTabHref} />
        </div>
      </header>

      <OrdersFilterBar />

      <OrdersTable
        rows={listing.rows}
        total={listing.total}
        sort={params.sort}
        dir={params.dir}
        page={params.page}
        pageSize={params.pageSize}
        isOwner={ctx.role === 'owner'}
      />
    </div>
  );
}
