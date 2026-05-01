'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useCart, cartSubtotalCents } from '@/lib/cart/store';
import { useCheckout } from '@/lib/checkout/store';
import { formatMoneyCents } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';

const VAT_RATE = 0.09;

export function getShippingFeeCents(method: 'local' | 'postnl' | null, subtotalCents: number): number {
  if (method === 'local') return subtotalCents >= 4000 ? 0 : 395;
  if (method === 'postnl') return subtotalCents >= 6000 ? 0 : 695;
  return 0;
}

export function OrderSummary({ collapsibleOnMobile = false }: { collapsibleOnMobile?: boolean }) {
  const lines = useCart((s) => s.lines);
  const subtotal = cartSubtotalCents(lines);
  const shippingMethod = useCheckout((s) => s.shippingMethod);
  const discountValue = useCheckout((s) => s.discountValueCents);
  const discountCode = useCheckout((s) => s.discountCode);

  const shippingCents = getShippingFeeCents(shippingMethod, subtotal);
  // Discount applied first, then VAT calculated on (subtotal - discount + shipping).
  const discountedSubtotal = Math.max(0, subtotal - discountValue);
  const totalExVat = discountedSubtotal + shippingCents;
  // VAT inclusive: total stays same; we just split it for display.
  const vatCents = Math.round(totalExVat - totalExVat / (1 + VAT_RATE));
  const totalCents = totalExVat;

  const [open, setOpen] = useState(!collapsibleOnMobile);

  return (
    <aside className="rounded-2xl border border-stone-200 bg-white">
      {collapsibleOnMobile && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden w-full flex items-center justify-between px-5 py-4 border-b border-stone-100"
        >
          <span className="text-sm font-semibold text-stone-900">
            Bestelling
            <span className="ml-2 font-mono text-stone-500">{formatMoneyCents(totalCents)}</span>
          </span>
          {open ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
        </button>
      )}
      <div className={cn('p-5', collapsibleOnMobile && !open && 'hidden md:block')}>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">Overzicht</h2>

        {/* Items */}
        <ul className="space-y-3 mb-4 max-h-[280px] overflow-y-auto cart-scroll pr-1">
          {lines.map((line) => (
            <li key={line.productId} className="flex gap-3 items-center text-sm">
              <div className="relative h-12 w-12 shrink-0 rounded-lg bg-stone-100 overflow-hidden ring-1 ring-stone-200/60">
                {line.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 inline-flex items-center justify-center rounded-full bg-stone-900 text-white text-[10px] font-mono tabular-nums">
                  {line.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 leading-tight truncate">{line.name}</p>
                <p className="font-mono text-xs text-stone-500 mt-0.5">
                  {formatMoneyCents(line.unitPriceCents)}
                </p>
              </div>
              <span className="font-mono text-sm tabular-nums text-stone-900">
                {formatMoneyCents(line.unitPriceCents * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        {/* Totals */}
        <dl className="space-y-1.5 text-sm border-t border-stone-100 pt-4">
          <div className="flex justify-between">
            <dt className="text-stone-600">Subtotaal</dt>
            <dd className="font-mono tabular-nums text-stone-900">{formatMoneyCents(subtotal)}</dd>
          </div>
          {discountValue > 0 && (
            <div className="flex justify-between text-(--color-accent)">
              <dt>Korting{discountCode && <span className="text-stone-500 ml-1">({discountCode})</span>}</dt>
              <dd className="font-mono tabular-nums">−{formatMoneyCents(discountValue)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-stone-600">Verzending</dt>
            <dd className="font-mono tabular-nums text-stone-900">
              {shippingMethod === null ? (
                <span className="text-stone-400 text-xs">vanaf €3,95</span>
              ) : shippingCents === 0 ? (
                <span className="text-(--color-accent) font-semibold">Gratis</span>
              ) : (
                formatMoneyCents(shippingCents)
              )}
            </dd>
          </div>
          <div className="flex justify-between text-xs">
            <dt className="text-stone-400">BTW (9% incl.)</dt>
            <dd className="font-mono tabular-nums text-stone-400">{formatMoneyCents(vatCents)}</dd>
          </div>
          <div className="border-t border-stone-200 mt-3 pt-3 flex justify-between items-baseline">
            <dt className="text-base font-semibold text-stone-900">Totaal</dt>
            <dd className="font-mono text-xl font-bold tabular-nums text-stone-900">
              {formatMoneyCents(totalCents)}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
