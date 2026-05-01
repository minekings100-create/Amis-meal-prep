import { cn } from '@/lib/utils/cn';
import type { PaymentStatus, ShippingStatus } from '@/lib/admin/orders';

const paymentStyles: Record<PaymentStatus, { label: string; className: string }> = {
  pending: { label: 'In wacht', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  paid: { label: 'Betaald', className: 'bg-(--color-accent-bright)/15 text-(--color-accent) border-(--color-accent-bright)/30' },
  failed: { label: 'Mislukt', className: 'bg-red-100 text-red-700 border-red-200' },
  refunded: { label: 'Refund', className: 'bg-stone-100 text-stone-700 border-stone-200' },
};

const shippingStyles: Record<ShippingStatus, { label: string; className: string }> = {
  new: { label: 'Nieuw', className: 'bg-stone-100 text-stone-700 border-stone-200' },
  preparing: { label: 'Preparing', className: 'bg-blue-50 text-blue-800 border-blue-200' },
  shipped: { label: 'Verzonden', className: 'bg-[#0f1410] text-white border-[#0f1410]' },
  delivered: { label: 'Geleverd', className: 'bg-(--color-accent) text-white border-(--color-accent)' },
  cancelled: { label: 'Geannuleerd', className: 'bg-stone-200 text-stone-600 border-stone-300' },
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
