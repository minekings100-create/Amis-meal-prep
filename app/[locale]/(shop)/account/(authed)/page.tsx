import { ArrowRight, Sparkles, ShoppingBag, Repeat } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireCustomer } from '@/lib/account/auth';
import { getCustomerStats } from '@/lib/account/orders';
import { formatMoneyCents } from '@/lib/utils/money';
import { OrderListRow } from '@/components/account/order-list-row';

export const metadata = { title: 'Account' };
export const dynamic = 'force-dynamic';

export default async function AccountDashboardPage() {
  const customer = await requireCustomer('/account');
  const stats = await getCustomerStats(customer.userId);
  const isNewCustomer = stats.totalOrders === 0;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">
          Hoi {customer.firstName ?? 'daar'}
        </h1>
        <p className="text-stone-600 mt-1">Welkom terug bij AMIS Meals.</p>
      </header>

      {/* Welcome offer for first-time customers */}
      {isNewCustomer && (
        <div className="rounded-2xl bg-gradient-to-br from-(--color-accent) to-(--color-accent-bright) text-white p-6 md:p-8 mb-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" aria-hidden />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 mb-3">
              <Sparkles className="h-3 w-3" />
              Welkom bij AMIS
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.02em] mb-2">
              10% korting op je eerste bestelling
            </h2>
            <p className="text-white/90 mb-5 max-w-md">
              Plaats je eerste order met code{' '}
              <span className="inline-block px-2 py-0.5 bg-white/20 rounded-md font-mono font-semibold">
                WELKOM10
              </span>
              {' '}en bespaar 10% op het hele assortiment.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-2xl bg-white text-(--color-accent) font-semibold text-sm hover:bg-stone-50 transition-colors"
            >
              Naar shop <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Bestellingen" value={String(stats.totalOrders)} />
        <StatCard label="Levensduur uitgegeven" value={formatMoneyCents(stats.ltvCents)} accent />
        <StatCard label="Reviews geplaatst" value={String(stats.reviewsCount)} />
      </div>

      {/* Recent orders */}
      <section className="mb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-base font-semibold text-stone-900">Recente bestellingen</h2>
          {stats.recentOrders.length > 0 && (
            <Link
              href="/account/orders"
              className="text-xs text-(--color-accent) hover:underline inline-flex items-center gap-1"
            >
              Alle bekijken <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
            <p className="text-stone-500">Nog geen bestellingen.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {stats.recentOrders.map((o) => (
              <OrderListRow key={o.id} order={o} />
            ))}
          </ul>
        )}
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="text-base font-semibold text-stone-900 mb-4">Snelle acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionCard
            href="/shop"
            icon={<ShoppingBag className="h-5 w-5" />}
            title="Naar shop"
            sub="Bestel je weekvoorraad"
          />
          <ActionCard
            href="/account/orders"
            icon={<Repeat className="h-5 w-5" />}
            title="Bestelling herhalen"
            sub="Vorige order opnieuw plaatsen"
          />
          <ActionCard
            href="/account/profile"
            icon={<Sparkles className="h-5 w-5" />}
            title="Profiel"
            sub="NAW + voorkeuren"
          />
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={
        accent
          ? 'rounded-2xl bg-(--color-accent-bright)/10 border border-(--color-accent-bright)/30 px-5 py-4'
          : 'rounded-2xl bg-white border border-stone-200 px-5 py-4'
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">{label}</p>
      <p
        className={
          accent
            ? 'mt-1 font-mono text-3xl font-bold tabular-nums text-(--color-accent)'
            : 'mt-1 font-mono text-3xl font-semibold tabular-nums text-stone-900'
        }
      >
        {value}
      </p>
    </div>
  );
}

function ActionCard({
  href,
  icon,
  title,
  sub,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-stone-200 bg-white p-4 hover:border-stone-300 transition-colors flex items-center gap-3 group"
    >
      <div className="h-10 w-10 rounded-xl bg-stone-100 text-stone-700 inline-flex items-center justify-center group-hover:bg-(--color-accent-bright)/15 group-hover:text-(--color-accent) transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-900 text-sm">{title}</p>
        <p className="text-xs text-stone-500">{sub}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-(--color-accent) transition-colors" />
    </Link>
  );
}
