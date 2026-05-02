import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { formatMoneyCents } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { CustomerOrderListRow } from '@/lib/account/orders';
import type { OrderStatus } from '@/types/database';

const statusLabel: Record<OrderStatus, string> = {
  pending: 'In wacht',
  paid: 'Betaald',
  preparing: 'Wordt bereid',
  shipped: 'Onderweg',
  delivered: 'Geleverd',
  cancelled: 'Geannuleerd',
  refunded: 'Refund',
};

function statusStyles(s: OrderStatus): string {
  if (s === 'pending') {
    return 'bg-(--color-brand-yellow-soft) text-(--color-brand-yellow-deep) border-(--color-brand-yellow)';
  }
  if (s === 'paid' || s === 'delivered') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === 'preparing' || s === 'shipped') return 'bg-blue-50 text-blue-800 border-blue-200';
  if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
  if (s === 'refunded') return 'bg-stone-100 text-stone-700 border-stone-200';
  return 'bg-stone-100 text-stone-700 border-stone-200';
}

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

export function OrderListRow({ order }: { order: CustomerOrderListRow }) {
  const dateLine = `${dateFmt.format(new Date(order.createdAt))} · ${order.itemCount} ${
    order.itemCount === 1 ? 'product' : 'producten'
  }`;
  return (
    <li>
      <Link
        href={`/account/orders/${order.id}`}
        className="block px-4 py-3 rounded-xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-[0_2px_12px_-8px_rgba(0,0,0,0.12)] transition-all group"
      >
        {/* Mobile: 2-row stack. Desktop: single row with details split left/right. */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <p className="font-mono text-sm font-medium text-stone-900">{order.orderNumber}</p>
              <span
                className={cn(
                  'sm:hidden inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider shrink-0',
                  statusStyles(order.status),
                )}
              >
                {statusLabel[order.status]}
              </span>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2 mt-0.5">
              <p className="text-xs text-stone-500">{dateLine}</p>
              <span className="sm:hidden font-mono tabular-nums text-sm text-stone-900">
                {formatMoneyCents(order.totalCents)}
              </span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <span className="font-mono tabular-nums text-sm text-stone-900">
              {formatMoneyCents(order.totalCents)}
            </span>
            <span
              className={cn(
                'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider',
                statusStyles(order.status),
              )}
            >
              {statusLabel[order.status]}
            </span>
            <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-(--color-brand-yellow) group-hover:translate-x-0.5 transition-all" />
          </div>
          <ArrowRight className="sm:hidden h-4 w-4 text-stone-400 self-center group-hover:text-(--color-brand-yellow) group-hover:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </li>
  );
}
