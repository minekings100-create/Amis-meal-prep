'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import type { Category } from '@/types/database';

export function ShopFilters({ categories }: { categories: Category[] }) {
  const t = useTranslations('shop.filters');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`);
    });
  }

  const activeType = params.get('type');
  const activeCategory = params.get('category');
  const activeSort = params.get('sort') ?? 'featured';

  const typeOptions: Array<{ value: string; label: string }> = [
    { value: '', label: t('all') },
    { value: 'meal', label: t('meal') },
    { value: 'package', label: t('package') },
    { value: 'tryout', label: t('tryout') },
  ];

  return (
    <div className="border-y border-[--color-line] bg-[--color-bg-soft]">
      <div className="container-amis flex flex-wrap items-center gap-4 py-5 text-sm">
        <div className="flex items-center gap-1 mr-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[--color-gray] mr-2">
            {t('type')}
          </span>
          {typeOptions.map((opt) => {
            const active = (activeType ?? '') === opt.value;
            return (
              <button
                key={opt.value || 'all'}
                onClick={() => setParam('type', opt.value || null)}
                className={
                  'px-3 py-1.5 rounded-full transition-colors ' +
                  (active
                    ? 'bg-[--color-ink] text-white'
                    : 'text-[--color-ink-soft] hover:bg-white')
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 mr-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[--color-gray] mr-2">
            {t('category')}
          </span>
          <button
            onClick={() => setParam('category', null)}
            className={
              'px-3 py-1.5 rounded-full transition-colors ' +
              (!activeCategory
                ? 'bg-[--color-ink] text-white'
                : 'text-[--color-ink-soft] hover:bg-white')
            }
          >
            {t('all')}
          </button>
          {categories.map((c) => {
            const active = activeCategory === c.slug;
            return (
              <button
                key={c.id}
                onClick={() => setParam('category', c.slug)}
                className={
                  'px-3 py-1.5 rounded-full transition-colors ' +
                  (active
                    ? 'bg-[--color-ink] text-white'
                    : 'text-[--color-ink-soft] hover:bg-white')
                }
              >
                {locale === 'en' ? c.name_en : c.name_nl}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <label className="text-[10px] uppercase tracking-[0.18em] text-[--color-gray]" htmlFor="sort">
            {t('sort')}
          </label>
          <select
            id="sort"
            value={activeSort}
            onChange={(e) => setParam('sort', e.target.value === 'featured' ? null : e.target.value)}
            className="bg-white border border-[--color-line] rounded-full h-9 pl-3 pr-8 text-sm focus:outline-none focus:border-[--color-accent]"
          >
            <option value="featured">{t('sortFeatured')}</option>
            <option value="price-asc">{t('sortPriceAsc')}</option>
            <option value="price-desc">{t('sortPriceDesc')}</option>
          </select>
        </div>
      </div>
    </div>
  );
}
