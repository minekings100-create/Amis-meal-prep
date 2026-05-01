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
  if (s === 'paid' || s === 'preparing') return 'bg-blue-50 text-blue-700 border-blue-200';
  if (s === 'shipped') return 'bg-amber-50 text-amber-800 border-amber-200';
  if (s === 'delivered') return 'bg-(--color-accent-bright)/15 text-(--color-accent) border-(--color-accent-bright)/30';
  if (s === 'cancelled' || s === 'refunded') return 'bg-stone-100 text-stone-600 border-stone-200';
  return 'bg-stone-100 text-stone-700 border-stone-200';
}

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

export function OrderListRow({ order }: { order: CustomerOrderListRow }) {
  return (
    <li>
      <Link
        href={`/account/orders/${order.id}`}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors group"
      >
        <div className="min-w-0">
          <p className="font-mono text-sm font-medium text-stone-900">{order.orderNumber}</p>
          <p className="text-xs text-stone-500 mt-0.5">
            {dateFmt.format(new Date(order.createdAt))} · {order.itemCount}{' '}
            {order.itemCount === 1 ? 'product' : 'producten'}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
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
          <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-(--color-accent) transition-colors" />
        </div>
      </Link>
    </li>
  );
}
