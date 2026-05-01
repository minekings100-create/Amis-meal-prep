import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getOrderDetail } from '@/lib/admin/order-detail';
import {
  CustomerCard,
  AddressCard,
  CustomerNoteCard,
  OrderTotals,
  OrderItemsTable,
} from '@/components/admin/orders/detail-cards';
import { InternalNotes } from '@/components/admin/orders/internal-notes';
import { StatusTimeline } from '@/components/admin/orders/status-timeline';
import { OrderActions } from '@/components/admin/orders/order-actions';
import { ActivityLog } from '@/components/admin/orders/activity-log';
import { PaymentPill } from '@/components/admin/orders/status-pills';

export const dynamic = 'force-dynamic';

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const ctx = await checkAdminAccess('staff');
  const { id } = await params;
  const order = await getOrderDetail(id);
  if (!order) notFound();

  const paymentStatus =
    order.status === 'refunded'
      ? 'refunded'
      : order.molliePaymentStatus === 'paid' || ['paid', 'preparing', 'shipped', 'delivered'].includes(order.status)
        ? 'paid'
        : order.molliePaymentStatus === 'failed' || order.molliePaymentStatus === 'expired' || order.molliePaymentStatus === 'canceled'
          ? 'failed'
          : 'pending';

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Breadcrumbs + back */}
      <nav className="text-xs text-stone-500 mb-3 flex items-center gap-1.5">
        <Link href="/admin" className="hover:text-stone-900">Admin</Link>
        <span className="text-stone-300">/</span>
        <Link href="/admin/orders" className="hover:text-stone-900">Bestellingen</Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700 font-mono">{order.orderNumber}</span>
      </nav>

      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Terug naar overzicht
          </Link>
          <div className="flex items-baseline gap-3">
            <h1 className="text-3xl font-bold tracking-[-0.025em] font-mono">
              {order.orderNumber}
            </h1>
            <PaymentPill status={paymentStatus} />
          </div>
          <p className="text-stone-600 mt-1 text-sm">
            Aangemaakt {new Date(order.createdAt).toLocaleString('nl-NL', { dateStyle: 'long', timeStyle: 'short' })}
            {order.isMocked && (
              <span className="text-amber-700 ml-2">(demo data)</span>
            )}
          </p>
        </div>
      </div>

      {/* 8/4 grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT — 8 columns */}
        <div className="lg:col-span-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <CustomerCard customer={order.customer} />
            <AddressCard shipping={order.shipping} />
          </div>
          {order.customerNote && <CustomerNoteCard note={order.customerNote} />}
          <OrderItemsTable items={order.items} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <OrderTotals totals={order.totals} />
            <InternalNotes orderId={order.id} initialValue={order.internalNote} />
          </div>
        </div>

        {/* RIGHT — 4 columns */}
        <div className="lg:col-span-4 space-y-5">
          <StatusTimeline order={order} />
          <OrderActions order={order} isOwner={ctx.role === 'owner'} />
          <ActivityLog activity={order.activity} />
        </div>
      </div>
    </div>
  );
}
