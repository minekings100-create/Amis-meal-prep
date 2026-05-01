import { checkAdminAccess } from '@/lib/admin/auth';
import { getStockListing } from '@/lib/admin/stock';
import { StockFilterBar } from '@/components/admin/stock/filter-bar';
import { StockTable } from '@/components/admin/stock/stock-table';
import { ProductionUpdateDialog } from '@/components/admin/stock/production-dialog';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Voorraad' };

export default async function StockPage({
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

  const listing = await getStockListing({
    search: get('q') ?? '',
    categoryId: get('category'),
    lowOnly: get('filter') === 'low',
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.025em]">Voorraad</h1>
          <p className="text-stone-600 mt-1 text-sm">
            {listing.rows.length} producten zichtbaar
            {listing.isMocked && (
              <span className="text-amber-700 ml-2">(demo data — Supabase niet verbonden)</span>
            )}
          </p>
        </div>
        <ProductionUpdateDialog rows={listing.rows} />
      </header>

      <StockFilterBar categories={listing.categories} />

      <StockTable initialRows={listing.rows} />
    </div>
  );
}
