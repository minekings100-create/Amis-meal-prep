'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useCart, cartSubtotalCents } from '@/lib/cart/store';
import { formatMoneyCents } from '@/lib/utils/money';
import { CartItemsSkeleton } from '@/components/shop/cart-item-skeleton';

export default function CartPage() {
  const t = useTranslations('cart');
  const tp = useTranslations('product');
  const locale = useLocale();
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const subtotal = cartSubtotalCents(lines);

  return (
    <div className="container-amis py-12 md:py-16 max-w-5xl">
      <header className="mb-8 md:mb-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-3">
          {locale === 'en' ? 'Order' : 'Bestelling'}
        </p>
        <h1 className="text-4xl md:text-5xl tracking-[-0.035em] font-bold">{t('title')}</h1>
      </header>

      {!mounted ? (
        <CartItemsSkeleton size="page" count={2} />
      ) : lines.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 md:p-16 text-center">
          <p className="text-(--color-ink-soft) mb-6">{t('empty')}</p>
          <Button asChild>
            <Link href="/shop">{t('continueShopping')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12">
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.productId}
                className="flex gap-4 md:gap-5 p-4 md:p-5 rounded-2xl border border-stone-200 bg-white"
              >
                <Link
                  href={`/shop/${line.slug}`}
                  className="shrink-0 h-20 w-20 md:h-24 md:w-24 rounded-full bg-stone-100 overflow-hidden ring-1 ring-stone-200/60"
                >
                  {line.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <Link
                    href={`/shop/${line.slug}`}
                    className="font-medium text-stone-900 hover:text-(--color-brand-yellow) transition-colors leading-tight"
                  >
                    {line.name}
                  </Link>
                  <p className="font-mono text-xs text-stone-500 mt-1">
                    {formatMoneyCents(line.unitPriceCents)} {tp('perMeal')}
                  </p>
                  <div className="mt-auto pt-3 flex items-center gap-3 flex-wrap">
                    <div className="inline-flex items-center rounded-full bg-stone-100">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        aria-label={t('decrease')}
                        className="h-9 w-9 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 rounded-full hover:bg-white"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-sm w-7 text-center tabular-nums">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        aria-label={t('increase')}
                        className="h-9 w-9 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 rounded-full hover:bg-white"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      className="text-xs text-stone-500 hover:text-red-600 inline-flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                      {t('remove')}
                    </button>
                  </div>
                </div>
                <div className="shrink-0 text-right self-start">
                  <p className="font-mono font-semibold tabular-nums text-stone-900">
                    {formatMoneyCents(line.unitPriceCents * line.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="rounded-2xl border border-stone-200 bg-white p-5 md:p-6 h-fit lg:sticky lg:top-24">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-4">
              {locale === 'en' ? 'Summary' : 'Overzicht'}
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-stone-600">{t('subtotal')}</dt>
                <dd className="font-mono tabular-nums text-stone-900">{formatMoneyCents(subtotal)}</dd>
              </div>
              <div className="flex justify-between text-xs">
                <dt className="text-stone-500">{t('shipping')}</dt>
                <dd className="text-stone-500">
                  {locale === 'en' ? 'calculated at checkout' : 'berekend bij checkout'}
                </dd>
              </div>
              <div className="border-t border-stone-100 mt-3 pt-3 flex justify-between items-baseline">
                <dt className="text-base font-semibold text-stone-900">{t('total')}</dt>
                <dd className="font-mono text-xl font-bold tabular-nums text-stone-900">
                  {formatMoneyCents(subtotal)}
                </dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-5 w-full inline-flex items-center justify-center h-12 rounded-2xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 active:scale-[0.99] transition-all shadow-[0_8px_24px_-8px_rgba(10,10,10,0.35)]"
            >
              {t('checkout')}
            </Link>
            <Link
              href="/shop"
              className="mt-2 block text-center text-xs text-stone-500 hover:text-stone-900 transition-colors"
            >
              {t('continueShopping')}
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
