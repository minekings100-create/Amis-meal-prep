'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { buildFilterURL } from '@/lib/shop/filters';
import type { SortKey } from '@/lib/shop/types';

const OPTIONS: SortKey[] = ['featured', 'new', 'price-asc', 'price-desc', 'protein-per-euro'];

export function SortDropdown({ value }: { value: SortKey }) {
  const t = useTranslations('shop.filters');
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  function setSort(next: SortKey) {
    const url = buildFilterURL(
      pathname,
      { sort: next === 'featured' ? null : next },
      new URLSearchParams(sp.toString()),
    );
    startTransition(() => router.replace(url));
  }

  return (
    <label className="inline-flex items-center gap-2">
      <span className="hidden sm:inline text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
        {t('sort')}
      </span>
      <span className="relative inline-flex">
        <select
          value={value}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="appearance-none h-10 pl-4 pr-9 rounded-full border border-stone-300 bg-white text-sm font-medium text-stone-800 hover:border-stone-400 focus:outline-none focus:border-(--color-brand-yellow) focus:ring-2 focus:ring-(--color-brand-yellow-bright)/30 transition-colors cursor-pointer"
        >
          {OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {labelFor(opt, t)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
      </span>
    </label>
  );
}

function labelFor(opt: SortKey, t: (k: string) => string): string {
  switch (opt) {
    case 'featured':
      return t('sortFeatured');
    case 'new':
      return t('sortNew');
    case 'price-asc':
      return t('sortPriceAsc');
    case 'price-desc':
      return t('sortPriceDesc');
    case 'protein-per-euro':
      return t('sortProteinPerEuro');
  }
}
