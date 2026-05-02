import Link from 'next/link';
import { Printer } from 'lucide-react';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getProductionPlanning } from '@/lib/admin/kitchen';
import { KitchenTable } from '@/components/admin/kitchen/kitchen-table';
import { KitchenDatePicker } from '@/components/admin/kitchen/date-picker';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Productie planning' };

export default async function KitchenPage({
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
  const date = get('date') ?? new Date().toISOString().slice(0, 10);

  const planning = await getProductionPlanning(date);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.025em]">Productie planning</h1>
          <p className="text-stone-600 mt-1 text-sm">
            Wat moet er gemaakt worden voor verzending op deze datum.
            {planning.isMocked && (
              <span className="text-amber-700 ml-2">(demo data)</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <KitchenDatePicker date={planning.date} />
          <Link
            href={`/admin/kitchen/print?date=${planning.date}`}
            target="_blank"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-black"
          >
            <Printer className="h-4 w-4" /> Print picklijst
          </Link>
        </div>
      </header>

      {/* Summary band */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <SummaryStat label="Totaal te produceren" value={String(planning.totalUnits)} accent />
        <SummaryStat label="Aantal orders" value={String(planning.totalOrders)} />
        <SummaryStat label="Unieke maaltijden" value={String(planning.rows.length)} />
      </div>

      <KitchenTable rows={planning.rows} />
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={
        accent
          ? 'rounded-2xl px-5 py-4 bg-(--color-brand-yellow-bright)/10 border border-(--color-brand-yellow-bright)/30'
          : 'rounded-2xl px-5 py-4 bg-white border border-stone-200'
      }
    >
      <p className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{label}</p>
      <p
        className={
          accent
            ? 'mt-1 font-mono text-3xl tabular-nums text-(--color-brand-yellow) font-bold'
            : 'mt-1 font-mono text-3xl tabular-nums text-stone-900 font-semibold'
        }
      >
        {value}
      </p>
    </div>
  );
}
