import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { OrdersTab, OrdersTabCounts } from '@/lib/admin/orders';

const TABS: Array<{ key: OrdersTab; label: string }> = [
  { key: 'all', label: 'Alle' },
  { key: 'new', label: 'Nieuw' },
  { key: 'ready', label: 'Klaar voor verzending' },
  { key: 'shipped', label: 'Verzonden' },
  { key: 'delivered', label: 'Geleverd' },
  { key: 'cancelled', label: 'Geannuleerd' },
  { key: 'refunded', label: 'Refund' },
];

export function OrdersTabs({
  active,
  counts,
  buildHref,
}: {
  active: OrdersTab;
  counts: OrdersTabCounts;
  buildHref: (tab: OrdersTab) => string;
}) {
  return (
    <nav className="flex items-center gap-1 border-b border-stone-200 -mb-px overflow-x-auto">
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const count = counts[tab.key];
        return (
          <Link
            key={tab.key}
            href={buildHref(tab.key)}
            className={cn(
              'group relative flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'text-stone-900 border-b-2 border-(--color-accent)'
                : 'text-stone-500 hover:text-stone-900 border-b-2 border-transparent',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-mono tabular-nums',
                isActive
                  ? 'bg-(--color-accent-bright)/20 text-(--color-accent)'
                  : 'bg-stone-100 text-stone-600 group-hover:bg-stone-200',
              )}
            >
              {count}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
