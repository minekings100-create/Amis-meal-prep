'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { useCart, cartSubtotalCents } from '@/lib/cart/store';
import { formatMoneyCents } from '@/lib/utils/money';

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
    <div className="container-amis py-16 md:py-24 max-w-4xl">
      <h1 className="text-4xl md:text-5xl tracking-[-0.035em] mb-12">{t('title')}</h1>

      {!mounted ? (
        <p className="text-[--color-ink-soft]">…</p>
      ) : lines.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-[--color-ink-soft] mb-6">{t('empty')}</p>
          <Button asChild>
            <Link href="/shop">{t('continueShopping')}</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12">
          <ul className="divide-y divide-[--color-line] border-y border-[--color-line]">
            {lines.map((line) => (
              <li key={line.productId} className="flex gap-6 py-6">
                <div className="h-24 w-24 rounded-[--radius-sm] bg-[--color-bg-soft] overflow-hidden">
                  {line.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="flex-1">
                  <Link href={`/shop/${line.slug}`} className="font-medium hover:underline">
                    {line.name}
                  </Link>
                  <p className="font-mono text-sm text-[--color-ink-soft] mt-1">
                    {formatMoneyCents(line.unitPriceCents)} {tp('perMeal')}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="inline-flex items-center border border-[--color-line] rounded-full">
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity - 1)}
                        aria-label={t('decrease')}
                        className="h-9 w-9 inline-flex items-center justify-center text-[--color-ink-soft] hover:text-[--color-ink]"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-mono text-sm w-7 text-center">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(line.productId, line.quantity + 1)}
                        aria-label={t('increase')}
                        className="h-9 w-9 inline-flex items-center justify-center text-[--color-ink-soft] hover:text-[--color-ink]"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.productId)}
                      className="text-sm text-[--color-gray] hover:text-[--color-ink] inline-flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      {t('remove')}
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold tabular-nums">
                    {formatMoneyCents(line.unitPriceCents * line.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <aside className="border border-[--color-line] rounded-[--radius] p-6 h-fit lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold tracking-[-0.02em] mb-6">
              {locale === 'en' ? 'Summary' : 'Overzicht'}
            </h2>
            <div className="flex justify-between text-sm py-2">
              <span className="text-[--color-ink-soft]">{t('subtotal')}</span>
              <span className="font-mono">{formatMoneyCents(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 text-[--color-ink-soft]">
              <span>{t('shipping')}</span>
              <span className="font-mono text-xs">
                {locale === 'en' ? 'calculated at checkout' : 'berekend bij checkout'}
              </span>
            </div>
            <div className="border-t border-[--color-line] mt-4 pt-4 flex justify-between font-medium">
              <span>{t('total')}</span>
              <span className="font-mono font-semibold">{formatMoneyCents(subtotal)}</span>
            </div>
            <Button asChild size="lg" className="w-full mt-6">
              <Link href="/checkout">{t('checkout')}</Link>
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
