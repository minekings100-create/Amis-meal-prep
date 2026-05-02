import { ArrowLeft, ArrowRight, Truck, Mail, Repeat, Check, Clock, Circle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { requireCustomer } from '@/lib/account/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { formatMoneyCents } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';
import type { OrderStatus } from '@/types/database';
import type { PublicOrder } from '@/lib/admin/public-order';
import { getPublicOrderByNumber } from '@/lib/admin/public-order';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'In wacht',
  paid: 'Betaald',
  preparing: 'Wordt bereid',
  shipped: 'Onderweg',
  delivered: 'Geleverd',
  cancelled: 'Geannuleerd',
  refunded: 'Refund',
};

function statusPillStyle(s: OrderStatus): string {
  if (s === 'pending') {
    return 'bg-(--color-brand-yellow-soft) text-(--color-brand-yellow-deep) border-(--color-brand-yellow)';
  }
  if (s === 'paid' || s === 'delivered') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (s === 'preparing' || s === 'shipped') return 'bg-blue-50 text-blue-800 border-blue-200';
  if (s === 'cancelled') return 'bg-red-50 text-red-800 border-red-200';
  if (s === 'refunded') return 'bg-stone-100 text-stone-700 border-stone-200';
  return 'bg-stone-100 text-stone-700 border-stone-200';
}

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bestelling' };

const dateFmt = new Intl.DateTimeFormat('nl-NL', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const STEPS: Array<{ key: string; label: string; statuses: OrderStatus[]; tsField: keyof Pick<PublicOrder, 'createdAt' | 'paidAt' | 'shippedAt' | 'deliveredAt'> }> = [
  { key: 'placed', label: 'Bestelling geplaatst', statuses: ['pending', 'paid', 'preparing', 'shipped', 'delivered'], tsField: 'createdAt' },
  { key: 'paid', label: 'Betaling ontvangen', statuses: ['paid', 'preparing', 'shipped', 'delivered'], tsField: 'paidAt' },
  { key: 'preparing', label: 'Wordt vers bereid', statuses: ['preparing', 'shipped', 'delivered'], tsField: 'paidAt' },
  { key: 'shipped', label: 'Onderweg naar jou', statuses: ['shipped', 'delivered'], tsField: 'shippedAt' },
  { key: 'delivered', label: 'Geleverd', statuses: ['delivered'], tsField: 'deliveredAt' },
];

async function getOrderForCustomer(orderId: string, userId: string): Promise<PublicOrder | null> {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (!hasSupabase) {
    // Mock — pretend the customer owns this order.
    return getPublicOrderByNumber(orderId.startsWith('mock-') ? 'AMIS-2026-12348' : orderId);
  }
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('orders')
    .select('order_number,user_id')
    .eq('id', orderId)
    .maybeSingle();
  type Stub = { order_number: string; user_id: string | null } | null;
  const r = data as unknown as Stub;
  if (!r) return null;
  if (r.user_id !== userId) return null;
  return getPublicOrderByNumber(r.order_number);
}

export default async function CustomerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await requireCustomer(`/account/orders/${id}`);
  const order = await getOrderForCustomer(id, customer.userId);
  if (!order) notFound();

  const isShipped = order.status === 'shipped' || order.status === 'delivered';
  const activeIdx = STEPS.findIndex((s) => s.statuses.includes(order.status));

  return (
    <div>
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar bestellingen
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] font-mono">
            {order.orderNumber}
          </h1>
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wider',
              statusPillStyle(order.status),
            )}
          >
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <p className="text-stone-600 mt-1 text-sm">
          Geplaatst op {dateFmt.format(new Date(order.createdAt))}
        </p>
      </header>

      {/* Tracking card — prominent when shipped */}
      {isShipped && order.trackingNumber && (
        <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-5 md:p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-200 text-amber-800 inline-flex items-center justify-center shrink-0">
              <Truck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-amber-800 font-bold">Onderweg</p>
              <p className="text-lg font-semibold text-amber-950 leading-tight">
                Je pakket is verzonden!
              </p>
              <p className="text-xs text-amber-800 mt-1 font-mono break-all">
                Tracking: {order.trackingNumber}
              </p>
              {order.trackingUrl && (
                <Link
                  href={order.trackingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-amber-900 text-white text-sm font-semibold hover:bg-amber-950"
                >
                  Volg je pakket bij PostNL <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
        {/* LEFT */}
        <div className="space-y-5">
          <Card title="Status">
            <ol className="space-y-3">
              {STEPS.map((step, i) => {
                const completed = i < activeIdx;
                const current = i === activeIdx;
                const ts = order[step.tsField];
                return (
                  <li key={step.key} className="flex gap-3 items-start">
                    <div
                      className={cn(
                        'h-7 w-7 rounded-full inline-flex items-center justify-center shrink-0',
                        completed
                          ? 'bg-(--color-brand-black) text-white'
                          : current
                            ? 'bg-(--color-brand-yellow-bright)/30 text-(--color-brand-yellow) border-2 border-(--color-brand-yellow)'
                            : 'bg-stone-100 text-stone-400',
                      )}
                    >
                      {completed ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : current ? (
                        <Clock className="h-3.5 w-3.5" />
                      ) : (
                        <Circle className="h-2 w-2" />
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <p
                        className={cn(
                          'text-sm leading-tight',
                          completed
                            ? 'font-medium text-stone-900'
                            : current
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
          </Card>

          <Card title="Items">
            <ul className="divide-y divide-stone-100">
              {order.items.map((it, i) => (
                <li key={i} className="flex items-center gap-3 py-3 text-sm">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-stone-100" />
                  ) : (
                    <div className="h-12 w-12 rounded-lg bg-stone-100" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-900 truncate">{it.name}</p>
                    <p className="text-xs text-stone-500 font-mono">
                      {formatMoneyCents(it.unitPriceCents)} × {it.quantity}
                    </p>
                  </div>
                  <span className="font-mono tabular-nums text-stone-900">
                    {formatMoneyCents(it.totalCents)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 pt-4 border-t border-stone-100 space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-600">Subtotaal</dt>
                <dd className="font-mono">{formatMoneyCents(order.totals.subtotalCents)}</dd>
              </div>
              {order.totals.discountCents > 0 && (
                <div className="flex justify-between text-(--color-brand-yellow)">
                  <dt>Korting</dt>
                  <dd className="font-mono">−{formatMoneyCents(order.totals.discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone-600">Verzending</dt>
                <dd className="font-mono">{formatMoneyCents(order.totals.shippingCents)}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-200 mt-3 font-semibold text-base">
                <dt>Totaal</dt>
                <dd className="font-mono tabular-nums">
                  {formatMoneyCents(order.totals.totalCents)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-5">
          <Card title="Bezorgadres">
            <p className="text-sm text-stone-700 leading-relaxed">
              {order.customerFirstName} {order.customerLastName}
              <br />
              {order.shippingAddress.street} {order.shippingAddress.houseNumber}
              <br />
              <span className="font-mono">{order.shippingAddress.postalCode}</span>{' '}
              {order.shippingAddress.city}, {order.shippingAddress.country}
            </p>
            <p className="text-xs text-stone-500 mt-3 pt-3 border-t border-stone-100">
              Verzendmethode:{' '}
              <span className="text-stone-700 font-medium">
                {order.shippingMethod === 'local' ? 'Lokale bezorging' : 'PostNL'}
              </span>
            </p>
          </Card>

          <div className="space-y-2">
            <Link
              href="/shop"
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50"
            >
              <Repeat className="h-3.5 w-3.5" />
              Bestelling herhalen
            </Link>
            <a
              href={`mailto:hallo@amismeals.nl?subject=Vraag%20over%20${encodeURIComponent(order.orderNumber)}`}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50"
            >
              <Mail className="h-3.5 w-3.5" />
              Vraag stellen
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white border border-stone-200 p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">{title}</h2>
      {children}
    </div>
  );
}
