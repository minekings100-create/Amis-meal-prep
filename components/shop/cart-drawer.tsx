'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { useCart, cartSubtotalCents } from '@/lib/cart/store';
import { formatMoneyCents } from '@/lib/utils/money';

export function CartDrawer() {
  const t = useTranslations('cart');
  const isOpen = useCart((s) => s.isOpen);
  const lines = useCart((s) => s.lines);
  const close = useCart((s) => s.close);
  const setQuantity = useCart((s) => s.setQuantity);
  const remove = useCart((s) => s.remove);
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(max-width: 767px)');
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  function handleDragEnd(_e: unknown, info: PanInfo) {
    if (info.offset.y > 80 || info.velocity.y > 500) close();
  }

  // Lock scroll + Esc-to-close while open. Pointer-events on container handled by AnimatePresence.
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50" aria-hidden={!isOpen}>
          {/* Backdrop — clickable to close */}
          <motion.div
            onClick={close}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Floating glass card */}
          <motion.aside
            role="dialog"
            aria-label={t('title')}
            initial={
              reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    scale: 0.95,
                    // Desktop slides from right, mobile from bottom — handled via responsive classes,
                    // animation values are uniform; the offset comes from the closed-state transform fallback.
                    x: 24,
                    y: 24,
                  }
            }
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.95, x: 24, y: 24 }
            }
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            // Mobile only: enable vertical drag-to-close (skip if user prefers reduced motion).
            drag={isMobile && !reduce ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
            className={[
              'absolute',
              // Desktop: vertically centered against right edge.
              'md:right-5 md:top-1/2 md:-translate-y-1/2',
              // Mobile: floats above bottom edge with margins.
              'inset-x-3 bottom-3 md:inset-x-auto md:bottom-auto',
              // Sizing.
              'w-auto md:w-[420px] max-w-[420px] mx-auto md:mx-0',
              'max-h-[80vh] md:max-h-[80vh]',
              // Glass card.
              'rounded-3xl bg-white/85 dark:bg-(--color-bg-soft)/85 backdrop-blur-xl',
              'border border-white/40 dark:border-white/10',
              'shadow-[0_24px_64px_-16px_rgba(19,22,19,0.32),0_0_0_1px_rgba(19,22,19,0.04)] dark:shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.04)]',
              'overflow-hidden flex flex-col',
            ].join(' ')}
          >
            {/* Mobile drag handle — visual affordance for swipe-down-to-close */}
            <div className="md:hidden flex justify-center pt-2 pb-1 cursor-grab active:cursor-grabbing">
              <span className="h-1 w-10 rounded-full bg-stone-300" aria-hidden />
            </div>

            <Header title={t('title')} count={lines.length} onClose={close} />

            <div className="flex-1 overflow-y-auto cart-scroll">
              {lines.length === 0 ? (
                <EmptyState
                  title={t('empty')}
                  sub={t('emptySub')}
                  cta={t('emptyCta')}
                  onClose={close}
                />
              ) : (
                <ul className="divide-y divide-stone-200/60 px-2">
                  {lines.map((line) => (
                    <li key={line.productId} className="flex gap-3 py-3 px-3 group">
                      <Link
                        href={`/shop/${line.slug}`}
                        onClick={close}
                        className="shrink-0 h-14 w-14 rounded-full bg-stone-100 overflow-hidden ring-1 ring-stone-200/60"
                      >
                        {line.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={line.imageUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/shop/${line.slug}`}
                          onClick={close}
                          className="font-medium text-sm text-stone-900 hover:text-(--color-brand-black) transition-colors truncate block leading-tight"
                        >
                          {line.name}
                        </Link>
                        <p className="font-mono text-xs text-stone-500 mt-0.5">
                          {formatMoneyCents(line.unitPriceCents)} ×{' '}
                          <span className="text-stone-700">{line.quantity}</span>
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full bg-stone-100/80 backdrop-blur-sm">
                            <button
                              type="button"
                              onClick={() => setQuantity(line.productId, line.quantity - 1)}
                              aria-label={t('decrease')}
                              className="h-7 w-7 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 rounded-full hover:bg-white"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="font-mono text-xs w-6 text-center tabular-nums">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(line.productId, line.quantity + 1)}
                              aria-label={t('increase')}
                              className="h-7 w-7 inline-flex items-center justify-center text-stone-600 hover:text-stone-900 rounded-full hover:bg-white"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-semibold tabular-nums text-stone-900">
                            {formatMoneyCents(line.unitPriceCents * line.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(line.productId)}
                            aria-label={t('remove')}
                            className="h-7 w-7 inline-flex items-center justify-center text-stone-400 hover:text-red-600 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <Footer
                subtotal={subtotal}
                shippingLabel={t('shippingPlaceholder')}
                checkoutLabel={t('checkout')}
                continueLabel={t('continueShopping')}
                onClose={close}
              />
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Header({
  title,
  count,
  onClose,
}: {
  title: string;
  count: number;
  onClose: () => void;
}) {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-stone-200/60">
      <div className="flex items-baseline gap-2">
        <h2 className="text-base font-semibold tracking-tight text-stone-900">{title}</h2>
        {count > 0 && (
          <span className="text-xs font-mono tabular-nums text-stone-500">
            {count} {count === 1 ? 'item' : 'items'}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="h-7 w-7 inline-flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100/80 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </header>
  );
}

function Footer({
  subtotal,
  shippingLabel,
  checkoutLabel,
  continueLabel,
  onClose,
}: {
  subtotal: number;
  shippingLabel: string;
  checkoutLabel: string;
  continueLabel: string;
  onClose: () => void;
}) {
  return (
    <footer className="border-t border-stone-200/60 bg-white/60 backdrop-blur-md px-5 pt-4 pb-4 space-y-3">
      <dl className="space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-stone-600">Subtotaal</dt>
          <dd className="font-mono tabular-nums text-stone-900">{formatMoneyCents(subtotal)}</dd>
        </div>
        <div className="flex justify-between text-xs">
          <dt className="text-stone-500">Verzending</dt>
          <dd className="text-stone-500">{shippingLabel}</dd>
        </div>
      </dl>
      <Link
        href="/checkout"
        onClick={onClose}
        className="w-full inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 active:scale-[0.99] transition-all shadow-[0_8px_24px_-8px_rgba(10,10,10,0.35)]"
      >
        {checkoutLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={onClose}
        className="block w-full text-center text-xs text-stone-600 hover:text-(--color-brand-black) transition-colors"
      >
        {continueLabel}
      </button>
    </footer>
  );
}

function EmptyState({
  title,
  sub,
  cta,
  onClose,
}: {
  title: string;
  sub: string;
  cta: string;
  onClose: () => void;
}) {
  return (
    <div className="px-6 py-12 text-center flex flex-col items-center">
      <div className="h-20 w-20 rounded-full bg-stone-100/80 inline-flex items-center justify-center mb-4 ring-1 ring-stone-200/60">
        <ShoppingBag className="h-8 w-8 text-stone-400" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-stone-900">{title}</h3>
      <p className="text-sm text-stone-500 mt-1 max-w-[220px]">{sub}</p>
      <Link
        href="/shop"
        onClick={onClose}
        className="mt-6 inline-flex items-center gap-1.5 h-11 px-6 rounded-2xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 active:scale-[0.99] transition-all"
      >
        {cta}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
