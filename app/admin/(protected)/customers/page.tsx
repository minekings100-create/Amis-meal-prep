import Link from 'next/link';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getCustomersListing, type CustomerListParams, type CustomerFilter } from '@/lib/admin/customers';
import { formatMoneyCents } from '@/lib/utils/money';
import { CustomersFilterBar } from '@/components/admin/customers/filter-bar';
import { cn } from '@/lib/utils/cn';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Klanten' };

const statusStyles = {
  vip: 'bg-amber-100 text-amber-800 border-amber-200',
  active: 'bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) border-(--color-brand-yellow-bright)/30',
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  risk: 'bg-red-50 text-red-700 border-red-200',
  inactive: 'bg-stone-100 text-stone-600 border-stone-200',
};
const statusLabel = { vip: 'VIP', active: 'Actief', new: 'Nieuw', risk: 'Risico', inactive: 'Inactief' };

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await checkAdminAccess('staff');
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const filterRaw = (get('filter') ?? 'all') as CustomerFilter;
  const filter: CustomerFilter = ['all', 'vip', 'new', 'risk'].includes(filterRaw) ? filterRaw : 'all';

  const sortRaw = get('sort');
  const params: CustomerListParams = {
    search: get('q') ?? '',
    filter,
    sort: ['lastOrder', 'totalOrders', 'ltv', 'firstOrder', 'name'].includes(sortRaw ?? '')
      ? (sortRaw as CustomerListParams['sort'])
      : 'lastOrder',
    dir: get('dir') === 'asc' ? 'asc' : 'desc',
  };

  const listing = await getCustomersListing(params);

  function sortHref(col: CustomerListParams['sort']): string {
    const next = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (k === 'sort' || k === 'dir') return;
      if (typeof v === 'string') next.set(k, v);
    });
    next.set('sort', col);
    next.set('dir', params.sort === col && params.dir === 'desc' ? 'asc' : 'desc');
    return `/admin/customers?${next.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">Klanten</h1>
        <p className="text-stone-600 mt-1 text-sm">
          {listing.rows.length} klanten zichtbaar
          {listing.isMocked && (
            <span className="text-amber-700 ml-2">(demo data — Supabase niet verbonden)</span>
          )}
        </p>
      </header>

      <CustomersFilterBar />

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/50 border-b border-stone-200">
              <tr>
                <SortHeader label="Klant" href={sortHref('name')} active={params.sort === 'name'} dir={params.dir} className="text-left px-4 py-2.5" />
                <SortHeader label="1e order" href={sortHref('firstOrder')} active={params.sort === 'firstOrder'} dir={params.dir} className="text-left px-3 py-2.5" />
                <SortHeader label="Orders" href={sortHref('totalOrders')} active={params.sort === 'totalOrders'} dir={params.dir} className="text-right px-3 py-2.5" />
                <SortHeader label="LTV" href={sortHref('ltv')} active={params.sort === 'ltv'} dir={params.dir} className="text-right px-3 py-2.5" />
                <SortHeader label="Laatste order" href={sortHref('lastOrder')} active={params.sort === 'lastOrder'} dir={params.dir} className="text-left px-3 py-2.5" />
                <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {listing.rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                    Geen klanten gevonden.
                  </td>
                </tr>
              )}
              {listing.rows.map((c) => (
                <tr key={c.userId} className="hover:bg-stone-50/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${c.userId}`} className="block">
                      <p className="font-medium text-stone-900 leading-tight">
                        {(c.firstName || c.lastName) ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim() : c.email}
                      </p>
                      <p className="text-xs text-stone-500 leading-tight">{c.email}</p>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-stone-600 text-xs font-mono">
                    {c.firstOrderAt ? dateFmt.format(new Date(c.firstOrderAt)) : '—'}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-stone-900">
                    {c.totalOrders}
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-stone-900">
                    {formatMoneyCents(c.ltvCents)}
                  </td>
                  <td className="px-3 py-3 text-stone-600 text-xs font-mono">
                    {c.lastOrderAt ? dateFmt.format(new Date(c.lastOrderAt)) : '—'}
                  </td>
                  <td className="px-3 py-3">
                    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider', statusStyles[c.status])}>
                      {statusLabel[c.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  href,
  active,
  dir,
  className,
}: {
  label: string;
  href: string;
  active: boolean;
  dir: 'asc' | 'desc';
  className: string;
}) {
  return (
    <th className={`${className} font-medium text-[11px] uppercase tracking-wider text-stone-500`}>
      <Link href={href} className={`inline-flex items-center gap-1 hover:text-stone-900 ${active ? 'text-stone-900' : ''}`}>
        {label}
        {active ? (dir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowDown className="h-3 w-3 opacity-20" />}
      </Link>
    </th>
  );
}
