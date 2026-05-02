import Link from 'next/link';
import { Plus, FileUp, ArrowDown, ArrowUp } from 'lucide-react';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getProductListing, type ProductListParams } from '@/lib/admin/products';
import { formatMoneyCents } from '@/lib/utils/money';
import { ProductsFilterBar } from '@/components/admin/products/filter-bar';
import { ProductActiveSwitch } from '@/components/admin/products/active-switch';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Producten' };

export default async function ProductsListPage({
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

  const sortRaw = get('sort');
  const params: ProductListParams = {
    search: get('q') ?? '',
    categoryId: get('category'),
    type: ['meal', 'package', 'tryout'].includes(get('type') ?? '')
      ? (get('type') as ProductListParams['type'])
      : undefined,
    sort: ['price', 'stock', 'sales', 'name'].includes(sortRaw ?? '')
      ? (sortRaw as ProductListParams['sort'])
      : 'name',
    dir: get('dir') === 'desc' ? 'desc' : 'asc',
  };

  const listing = await getProductListing(params);

  function sortHref(col: ProductListParams['sort']): string {
    const next = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (k === 'sort' || k === 'dir') return;
      if (typeof v === 'string') next.set(k, v);
    });
    next.set('sort', col);
    next.set('dir', params.sort === col && params.dir === 'asc' ? 'desc' : 'asc');
    return `/admin/products?${next.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.025em]">Producten</h1>
          <p className="text-stone-600 mt-1 text-sm">
            {listing.rows.length} producten
            {listing.isMocked && (
              <span className="text-amber-700 ml-2">(demo data — Supabase niet verbonden)</span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            disabled
            title="CSV import komt later"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-stone-200 bg-white text-sm font-medium text-stone-400 cursor-not-allowed"
          >
            <FileUp className="h-4 w-4" />
            Importeer CSV
          </button>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-(--color-brand-black) text-white text-sm font-medium hover:bg-stone-800"
          >
            <Plus className="h-4 w-4" />
            Nieuw product
          </Link>
        </div>
      </header>

      <ProductsFilterBar categories={listing.categories} />

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/50 border-b border-stone-200">
              <tr>
                <SortHeader label="Product" href={sortHref('name')} active={params.sort === 'name'} dir={params.dir} className="text-left px-4 py-2.5" />
                <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Type</th>
                <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Categorie</th>
                <SortHeader label="Prijs" href={sortHref('price')} active={params.sort === 'price'} dir={params.dir} className="text-right px-3 py-2.5" />
                <SortHeader label="Voorraad" href={sortHref('stock')} active={params.sort === 'stock'} dir={params.dir} className="text-right px-3 py-2.5" />
                <SortHeader label="Sales 30d" href={sortHref('sales')} active={params.sort === 'sales'} dir={params.dir} className="text-right px-3 py-2.5" />
                <th className="text-center px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500 w-[80px]">Actief</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {listing.rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-500">
                    Geen producten gevonden.
                  </td>
                </tr>
              )}
              {listing.rows.map((row) => (
                <tr key={row.id} className="group hover:bg-stone-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={row.imageUrl} alt="" className="h-10 w-10 rounded-md object-cover bg-stone-100" />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-stone-100" />
                      )}
                      <div className="min-w-0">
                        <Link
                          href={`/admin/products/${row.id}/edit`}
                          className="font-medium text-stone-900 hover:text-(--color-brand-yellow) truncate block"
                        >
                          {row.name}
                          {row.isFeatured && (
                            <span className="ml-2 text-[9px] uppercase tracking-wider text-(--color-brand-yellow)">★ Featured</span>
                          )}
                        </Link>
                        <p className="text-[11px] text-stone-400 font-mono truncate">{row.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <TypePill type={row.type} />
                  </td>
                  <td className="px-3 py-3 text-stone-600">{row.categoryName}</td>
                  <td className="px-3 py-3 text-right">
                    <div className="font-mono tabular-nums text-stone-900">
                      {formatMoneyCents(row.priceCents)}
                    </div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      BTW {row.vatRate}%
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums">
                    <span className={row.stock === 0 ? 'text-red-600' : row.stock < 10 ? 'text-amber-700' : 'text-stone-700'}>
                      {row.stock}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-mono tabular-nums text-stone-600">
                    {row.sales30d}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-center">
                      <ProductActiveSwitch productId={row.id} initial={row.isActive} />
                    </div>
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

function TypePill({ type }: { type: 'meal' | 'package' | 'tryout' }) {
  const styles = {
    meal: 'bg-stone-100 text-stone-700 border-stone-200',
    package: 'bg-blue-50 text-blue-700 border-blue-200',
    tryout: 'bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) border-(--color-brand-yellow-bright)/30',
  };
  const label = { meal: 'Maaltijd', package: 'Pakket', tryout: 'Tryout' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${styles[type]}`}>
      {label[type]}
    </span>
  );
}
