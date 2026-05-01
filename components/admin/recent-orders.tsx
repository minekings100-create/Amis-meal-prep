import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatMoneyCents } from '@/lib/utils/money';
import type { RecentOrder } from '@/lib/admin/stats';
import type { OrderStatus } from '@/types/database';

const statusLabel: Record<OrderStatus, string> = {
  pending: 'In wacht',
  paid: 'Betaald',
  preparing: 'Bezig',
  shipped: 'Verzonden',
  delivered: 'Geleverd',
  cancelled: 'Geannuleerd',
  refunded: 'Refund',
};

function statusTone(s: OrderStatus): 'default' | 'accent' | 'ink' | 'outline' {
  if (s === 'paid' || s === 'preparing') return 'accent';
  if (s === 'shipped' || s === 'delivered') return 'ink';
  if (s === 'cancelled' || s === 'refunded') return 'outline';
  return 'default';
}

const relTime = new Intl.RelativeTimeFormat('nl-NL', { numeric: 'auto' });
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return relTime.format(-minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (hours < 24) return relTime.format(-hours, 'hour');
  const days = Math.round(hours / 24);
  return relTime.format(-days, 'day');
}

export function RecentOrders({ orders }: { orders: RecentOrder[] }) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-200 bg-white p-8 text-center">
        <p className="text-sm text-stone-500">Nog geen bestellingen.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200">
        <h3 className="text-sm font-semibold text-stone-900">Recente bestellingen</h3>
        <Link
          href="/admin/orders"
          className="text-xs font-medium text-stone-500 hover:text-stone-900 inline-flex items-center gap-1"
        >
          Alle bekijken <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <ul className="divide-y divide-stone-100">
        {orders.map((o) => (
          <li key={o.id}>
            <Link
              href={`/admin/orders/${o.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-stone-50 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-sm font-medium text-stone-900">
                    {o.orderNumber}
                  </span>
                  <span className="text-xs text-stone-400">{timeAgo(o.createdAt)}</span>
                </div>
                <p className="text-xs text-stone-500 truncate mt-0.5">{o.customerName}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-sm tabular-nums text-stone-900">
                  {formatMoneyCents(o.totalCents)}
                </span>
                <Badge variant={statusTone(o.status)} className="text-[9px] px-2 py-0.5">
                  {statusLabel[o.status]}
                </Badge>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
