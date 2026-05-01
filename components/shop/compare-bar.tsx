'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X } from 'lucide-react';
import { useCompareStore, type CompareItem } from '@/lib/compare/store';

export function CompareBar() {
  const t = useTranslations('compare');
  const locale = useLocale() as 'nl' | 'en';
  const items = useCompareStore((s) => s.items);
  const open = useCompareStore((s) => s.open);
  const clear = useCompareStore((s) => s.clear);
  const remove = useCompareStore((s) => s.remove);
  const reduce = useReducedMotion();

  // Avoid SSR mismatch — bar is client-only based on persisted state.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const visible = hydrated && items.length > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? false : { y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 100, opacity: 0 }}
          transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 max-w-[calc(100vw-1rem)]"
          role="region"
          aria-label={t('title')}
        >
          <div className="flex items-center gap-3 rounded-full bg-stone-900 text-white shadow-[0_18px_50px_-12px_rgba(0,0,0,0.45)] pl-2 pr-2 py-2">
            {/* Thumbnails — hidden on small mobile to keep the bar compact */}
            <ul className="hidden sm:flex items-center gap-1 pl-2">
              {items.map((it) => (
                <Thumb key={it.id} item={it} locale={locale} onRemove={() => remove(it.id)} />
              ))}
            </ul>
            <span className="text-sm font-medium pl-1 sm:pl-0 pr-1">
              {t('itemCount', { count: items.length })}
            </span>
            <button
              type="button"
              onClick={open}
              className="inline-flex items-center h-10 px-5 rounded-full bg-(--color-accent-bright) text-stone-900 text-sm font-semibold hover:bg-white transition-colors active:scale-95"
            >
              {t('compare')}
            </button>
            <button
              type="button"
              onClick={clear}
              aria-label={t('clearAll')}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Thumb({
  item,
  locale,
  onRemove,
}: {
  item: CompareItem;
  locale: 'nl' | 'en';
  onRemove: () => void;
}) {
  const name = locale === 'en' ? item.nameEn : item.nameNl;
  return (
    <li className="relative group">
      <div className="h-10 w-10 rounded-full overflow-hidden ring-1 ring-white/15 bg-stone-700">
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={name} className="h-full w-full object-cover" />
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-white/90 text-stone-900 inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="h-2.5 w-2.5" strokeWidth={3} />
      </button>
    </li>
  );
}
