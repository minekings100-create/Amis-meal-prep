import { Truck, AlertTriangle, CreditCard, Star } from 'lucide-react';
import { getDashboardStats } from '@/lib/admin/stats';
import { StatCard } from '@/components/admin/stat-card';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { RecentOrders } from '@/components/admin/recent-orders';
import { RefreshButton } from '@/components/admin/refresh-button';
import { formatMoneyCents } from '@/lib/utils/money';

export const revalidate = 60;
export const metadata = { title: 'Dashboard' };

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-8 flex items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.025em]">Dashboard</h1>
          <p className="text-stone-600 mt-1">
            Overzicht van vandaag.{' '}
            {stats.isMocked && (
              <span className="text-amber-700 text-sm">(demo data — Supabase niet verbonden)</span>
            )}
          </p>
        </div>
        <RefreshButton />
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Te verzenden vandaag"
          value={stats.shipReadyCount}
          href="/admin/orders?filter=ready-to-ship"
          icon={Truck}
          tone="default"
        />
        <StatCard
          label="Lage voorraad"
          value={stats.lowStockCount}
          href="/admin/stock?filter=low"
          icon={AlertTriangle}
          tone="warn"
          hint="Producten onder 10 stuks"
        />
        <StatCard
          label="Mislukte betalingen 24u"
          value={stats.failedPayments24hCount}
          href="/admin/orders?filter=failed"
          icon={CreditCard}
          tone="danger"
        />
        <StatCard
          label="Reviews wachten"
          value={stats.reviewsPendingCount}
          href="/admin/reviews"
          icon={Star}
          tone="warn"
        />
      </div>

      {/* Bottom: 2 columns */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT (2/3) */}
        <section className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="text-base font-semibold text-stone-900">Omzet</h2>
            <span className="text-xs text-stone-500">Laatste 30 dagen</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <RevenueStat label="Vandaag" cents={stats.revenueTodayCents} />
            <RevenueStat label="Deze week" cents={stats.revenueWeekCents} />
            <RevenueStat label="Deze maand" cents={stats.revenueMonthCents} accent />
          </div>

          <RevenueChart data={stats.trend30d} />
        </section>

        {/* RIGHT (1/3) */}
        <section className="lg:col-span-1">
          <RecentOrders orders={stats.recentOrders} />
        </section>
      </div>
    </div>
  );
}

function RevenueStat({
  label,
  cents,
  accent,
}: {
  label: string;
  cents: number;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? 'rounded-xl bg-(--color-brand-yellow-bright)/10 border border-(--color-brand-yellow-bright)/30 px-4 py-3'
          : 'rounded-xl bg-stone-50 border border-stone-100 px-4 py-3'
      }
    >
      <p className="text-[11px] uppercase tracking-wider text-stone-500 font-medium">{label}</p>
      <p
        className={
          accent
            ? 'mt-1 font-mono text-2xl tabular-nums tracking-[-0.03em] text-(--color-brand-yellow)'
            : 'mt-1 font-mono text-2xl tabular-nums tracking-[-0.03em] text-stone-900'
        }
      >
        {formatMoneyCents(cents)}
      </p>
    </div>
  );
}
