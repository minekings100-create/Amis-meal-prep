import { Check, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { OrderDetail } from '@/lib/admin/order-detail';
import type { OrderStatus } from '@/types/database';

interface Step {
  key: string;
  label: string;
  statuses: OrderStatus[];
  timestamp: (d: OrderDetail) => string | null;
}

const STEPS: Step[] = [
  { key: 'created', label: 'Besteld', statuses: ['pending', 'paid', 'preparing', 'shipped', 'delivered'], timestamp: (d) => d.createdAt },
  { key: 'paid', label: 'Betaald', statuses: ['paid', 'preparing', 'shipped', 'delivered'], timestamp: (d) => d.paidAt },
  { key: 'preparing', label: 'In voorbereiding', statuses: ['preparing', 'shipped', 'delivered'], timestamp: (d) => (d.status === 'preparing' || d.status === 'shipped' || d.status === 'delivered' ? d.paidAt : null) },
  { key: 'shipped', label: 'Verzonden', statuses: ['shipped', 'delivered'], timestamp: (d) => d.shippedAt },
  { key: 'delivered', label: 'Geleverd', statuses: ['delivered'], timestamp: (d) => d.deliveredAt },
];

const dateFmt = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export function StatusTimeline({ order }: { order: OrderDetail }) {
  const isCancelled = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-5">Status</h3>
      {isCancelled ? (
        <div className="rounded-md bg-stone-100 px-3 py-2.5 text-sm text-stone-600">
          Order is{' '}
          <span className="font-semibold">
            {order.status === 'cancelled' ? 'geannuleerd' : 'gerefund'}
          </span>
          .
        </div>
      ) : (
        <ol className="relative">
          {STEPS.map((step, i) => {
            const completed = step.statuses.includes(order.status);
            const isCurrent = STEPS.findIndex((s) => s.statuses.includes(order.status)) === i;
            const ts = step.timestamp(order);
            const isLast = i === STEPS.length - 1;
            return (
              <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                {/* connector */}
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      'absolute left-[11px] top-6 bottom-0 w-px',
                      completed ? 'bg-(--color-brand-yellow)' : 'bg-stone-200',
                    )}
                  />
                )}
                {/* dot */}
                <div
                  className={cn(
                    'relative z-10 flex h-6 w-6 items-center justify-center rounded-full shrink-0 ring-4 ring-white',
                    completed
                      ? 'bg-(--color-brand-black) text-white'
                      : isCurrent
                        ? 'bg-(--color-brand-yellow-bright)/20 text-(--color-brand-yellow) border-2 border-(--color-brand-yellow-bright)'
                        : 'bg-stone-100 text-stone-400',
                  )}
                >
                  {completed ? (
                    <Check className="h-3 w-3" />
                  ) : isCurrent ? (
                    <Clock className="h-3 w-3" />
                  ) : (
                    <Circle className="h-2 w-2" />
                  )}
                </div>
                <div className="flex-1 pt-0.5">
                  <p
                    className={cn(
                      'text-sm leading-tight',
                      completed
                        ? 'font-semibold text-stone-900'
                        : isCurrent
                          ? 'font-semibold text-(--color-brand-yellow)'
                          : 'text-stone-400',
                    )}
                  >
                    {step.label}
                  </p>
                  {ts && (
                    <p className="text-[11px] font-mono text-stone-500 mt-0.5">
                      {dateFmt.format(new Date(ts))}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
