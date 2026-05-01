'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import { GOAL_TAGS, ATTRIBUTE_TAGS, attributeLabel, goalLabel } from '@/lib/tags';
import type { ProductFilters } from '@/lib/shop/types';
import { activeFilterCount, buildFilterURL, toggleInList } from '@/lib/shop/filters';
import { formatMoneyCents } from '@/lib/utils/money';

export function ActiveFilterPills({ filters }: { filters: ProductFilters }) {
  const t = useTranslations('shop.filters');
  const tAllergens = useTranslations('allergens');
  const locale = useLocale() as 'nl' | 'en';
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();

  const count = activeFilterCount(filters);
  if (count === 0) return null;

  function patch(p: Parameters<typeof buildFilterURL>[1]) {
    const url = buildFilterURL(pathname, p, new URLSearchParams(sp.toString()));
    startTransition(() => router.replace(url));
  }

  function clearAll() {
    const next = new URLSearchParams(sp.toString());
    ['type', 'goal', 'attr', 'nf', 'min', 'max'].forEach((k) => next.delete(k));
    const qs = next.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  }

  const pills: Array<{ key: string; label: string; onRemove: () => void }> = [];

  if (filters.type) {
    pills.push({
      key: `type:${filters.type}`,
      label: t(filters.type),
      onRemove: () => patch({ type: null }),
    });
  }
  for (const g of filters.goalTags ?? []) {
    pills.push({
      key: `goal:${g}`,
      label: goalLabel(g, locale),
      onRemove: () => patch({ goal: toggleInList(filters.goalTags ?? [], g) }),
    });
  }
  for (const a of filters.attributeTags ?? []) {
    pills.push({
      key: `attr:${a}`,
      label: attributeLabel(a, locale),
      onRemove: () => patch({ attr: toggleInList(filters.attributeTags ?? [], a) }),
    });
  }
  for (const a of filters.allergensAvoid ?? []) {
    pills.push({
      key: `nf:${a}`,
      label: `−${tAllergens(a)}`,
      onRemove: () => patch({ nf: toggleInList(filters.allergensAvoid ?? [], a) }),
    });
  }
  if (filters.minPriceCents !== undefined) {
    pills.push({
      key: 'min',
      label: `≥ ${formatMoneyCents(filters.minPriceCents)}`,
      onRemove: () => patch({ min: null }),
    });
  }
  if (filters.maxPriceCents !== undefined) {
    pills.push({
      key: 'max',
      label: `≤ ${formatMoneyCents(filters.maxPriceCents)}`,
      onRemove: () => patch({ max: null }),
    });
  }

  // Touch GOAL_TAGS / ATTRIBUTE_TAGS so dynamic-import side-effects (icons) aren't tree-shaken.
  void GOAL_TAGS;
  void ATTRIBUTE_TAGS;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pills.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={p.onRemove}
          className="group inline-flex items-center gap-1.5 h-8 pl-3 pr-2 rounded-full bg-stone-100 hover:bg-stone-200 text-sm text-stone-800 transition-colors"
        >
          <span>{p.label}</span>
          <X className="h-3.5 w-3.5 text-stone-500 group-hover:text-stone-900 transition-colors" />
        </button>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="ml-1 text-sm font-medium text-[--color-accent] hover:text-stone-900 transition-colors"
      >
        {t('clearAll')}
      </button>
    </div>
  );
}
