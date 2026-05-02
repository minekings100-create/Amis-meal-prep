'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { FilterControls } from './filter-controls';
import { activeFilterCount } from '@/lib/shop/filters';
import type { ProductFilters } from '@/lib/shop/types';

export function FilterSidebar({ filters }: { filters: ProductFilters }) {
  const t = useTranslations('shop.filters');
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const count = activeFilterCount(filters);

  function clearAll() {
    const next = new URLSearchParams(sp.toString());
    ['type', 'goal', 'attr', 'nf', 'min', 'max'].forEach((k) => next.delete(k));
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  }

  return (
    <aside
      aria-label={t('title')}
      className="hidden lg:block w-64 shrink-0 sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-4 -mr-4"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
          {t('title')}
        </h2>
        {count > 0 && (
          <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-(--color-accent-bright)/20 text-(--color-accent) font-mono text-[10px] tabular-nums font-semibold">
            {count}
          </span>
        )}
      </div>

      <FilterControls filters={filters} />

      {count > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="mt-8 w-full inline-flex items-center justify-center gap-1.5 px-4 h-10 rounded-full border border-stone-300 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 hover:border-stone-400 transition-colors"
        >
          {t('clearAll')}
        </button>
      )}
    </aside>
  );
}
