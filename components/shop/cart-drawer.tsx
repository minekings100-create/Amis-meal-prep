'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { useCart, cartSubtotalCents } from '@/lib/cart/store';
import { formatMoneyCents } from '@/lib/utils/money';
import { Button } from '@/components/ui/button';

export function CartDrawer() {
  const t = useTranslations('cart');
  const isOpen = useCart((s) => s.isOpen);
  const lines = useCart((s) => s.lines);
  const close = useCart((s) => s.close);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, close]);

  const subtotal = cartSubtotalCents(lines);

  return (
    <div
      className={
        'fixed inset-0 z-50 ' + (isOpen ? 'pointer-events-auto' : 'pointer-events-none')
      }
      aria-hidden={!isOpen}
    >
      <div
        onClick={close}
        className={
          'absolute inset-0 bg-[--color-ink]/40 transition-opacity duration-300 ' +
          (isOpen ? 'opacity-100' : 'opacity-0')
        }
      />
      <aside
        role="dialog"
        aria-label={t('title')}
        className={
          'absolute right-0 top-0 h-full w-full max-w-md bg-white border-l border-[--color-line] flex flex-col transition-transform duration-300 ease-out ' +
          (isOpen ? 'translate-x-0' : 'translate-x-full')
        }
      >
        <header className="flex items-center justify-between px-6 h-16 border-b border-[--color-line]">
          <h2 className="text-lg font-semibold tracking-tight">{t('title')}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="h-9 w-9 inline-flex items-center justify-center rounded-full text-[--color-ink-soft] hover:bg-[--color-bg-soft]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {lines.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-[--color-ink-soft]">{t('empty')}</p>
              <Button asChild variant="outline" size="sm" className="mt-6">
                <Link href="/shop" onClick={close}>
                  {t('continueShopping')}
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-[--color-line]">
              {lines.map((line) => (
                <li key={line.productId} className="flex gap-4 p-6">
                  <div className="h-20 w-20 shrink-0 rounded-[--radius-sm] bg-[--color-bg-soft] overflow-hidden">
                    {line.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/shop/${line.slug}`}
                      onClick={close}
                      className="font-medium text-sm hover:underline truncate block"
                    >
                      {line.name}
                    </Link>
                    <p className="font-mono text-xs text-[--color-ink-soft] mt-1">
                      {formatMoneyCents(line.unitPriceCents)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center border border-[--color-line] rounded-full">
                        <button
                          type="button"
                          onClick={() => setQuantity(line.productId, line.quantity - 1)}
                          aria-label={t('decrease')}
                          className="h-8 w-8 inline-flex items-center justify-center text-[--color-ink-soft] hover:text-[--color-ink]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-sm w-6 text-center">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => setQuantity(line.productId, line.quantity + 1)}
                          aria-label={t('increase')}
                          className="h-8 w-8 inline-flex items-center justify-center text-[--color-ink-soft] hover:text-[--color-ink]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(line.productId)}
                        aria-label={t('remove')}
                        className="text-[--color-gray] hover:text-[--color-ink] transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className="border-t border-[--color-line] p-6 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-[--color-ink-soft]">{t('subtotal')}</span>
              <span className="font-mono font-medium">{formatMoneyCents(subtotal)}</span>
            </div>
            <Button asChild size="lg" className="w-full">
              <Link href="/checkout" onClick={close}>
                {t('checkout')}
              </Link>
            </Button>
          </footer>
        )}
      </aside>
    </div>
  );
}
