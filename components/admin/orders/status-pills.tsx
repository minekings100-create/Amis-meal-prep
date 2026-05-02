import { cn } from '@/lib/utils/cn';
import type { PaymentStatus, ShippingStatus } from '@/lib/admin/orders';

const paymentStyles: Record<PaymentStatus, { label: string; className: string }> = {
  pending: {
    label: 'In wacht',
    className: 'bg-(--color-brand-yellow-soft) text-(--color-brand-yellow-deep) border-(--color-brand-yellow)',
  },
  paid: { label: 'Betaald', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  failed: { label: 'Mislukt', className: 'bg-red-50 text-red-800 border-red-200' },
  refunded: { label: 'Refund', className: 'bg-stone-100 text-stone-700 border-stone-200' },
};

const shippingStyles: Record<ShippingStatus, { label: string; className: string }> = {
  new: { label: 'Nieuw', className: 'bg-stone-100 text-stone-700 border-stone-200' },
  preparing: { label: 'Preparing', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  shipped: { label: 'Verzonden', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  delivered: { label: 'Geleverd', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  cancelled: { label: 'Geannuleerd', className: 'bg-red-50 text-red-800 border-red-200' },
};

const pillBase =
  'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap';

export function PaymentPill({ status }: { status: PaymentStatus }) {
  const s = paymentStyles[status];
  return <span className={cn(pillBase, s.className)}>{s.label}</span>;
}

export function ShippingPill({ status }: { status: ShippingStatus }) {
  const s = shippingStyles[status];
  return <span className={cn(pillBase, s.className)}>{s.label}</span>;
}
