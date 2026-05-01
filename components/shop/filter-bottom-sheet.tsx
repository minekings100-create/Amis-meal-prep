'use client';

import { useEffect, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { FilterControls } from './filter-controls';
import {
  activeFilterCount,
  buildFilterURL,
  parseFiltersFromSearchParams,
} from '@/lib/shop/filters';
import type { ProductFilters, AllergenKey } from '@/lib/shop/types';
import type { GoalTag, AttributeTag } from '@/types/database';

interface DraftPatch {
  type?: ProductFilters['type'] | null;
  goal?: GoalTag[];
  attr?: AttributeTag[];
  nf?: AllergenKey[];
  min?: number | null;
  max?: number | null;
}

export function FilterBottomSheet({
  filters,
  resultCount,
}: {
  filters: ProductFilters;
  resultCount: number;
}) {
  const t = useTranslations('shop.filters');
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // When sheet opens, take a draft copy of the current filters; mutations stay
  // local until the user taps "Show results".
  const [draft, setDraft] = useState<ProductFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  // Live-merged draft for FilterControls (it doesn't know about draft state).
  function applyPatch(patch: DraftPatch) {
    setDraft((d) => ({
      ...d,
      type: patch.type !== undefined ? (patch.type ?? undefined) : d.type,
      goalTags: patch.goal !== undefined ? patch.goal : d.goalTags,
      attributeTags: patch.attr !== undefined ? patch.attr : d.attributeTags,
      allergensAvoid: patch.nf !== undefined ? patch.nf : d.allergensAvoid,
      minPriceCents:
        patch.min !== undefined ? (patch.min === null ? undefined : patch.min) : d.minPriceCents,
      maxPriceCents:
        patch.max !== undefined ? (patch.max === null ? undefined : patch.max) : d.maxPriceCents,
    }));
  }

  function commitDraft() {
    const url = buildFilterURL(
      pathname,
      {
        type: draft.type ?? null,
        goal: draft.goalTags ?? [],
        attr: draft.attributeTags ?? [],
        nf: draft.allergensAvoid ?? [],
        min: draft.minPriceCents ?? null,
        max: draft.maxPriceCents ?? null,
      },
      new URLSearchParams(sp.toString()),
    );
    startTransition(() => {
      router.replace(url);
      setOpen(false);
    });
  }

  function clearDraft() {
    setDraft({ sort: filters.sort, goalTags: [], attributeTags: [], allergensAvoid: [] });
  }

  // Recompute the count from the URL's authoritative filters (not the in-flight draft)
  // for the trigger button label.
  const liveCount = activeFilterCount(parseFiltersFromSearchParams(Object.fromEntries(sp)));
  const draftCount = activeFilterCount(draft);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          data-testid="filter-trigger"
          className="lg:hidden inline-flex items-center gap-2 h-10 px-4 rounded-full border border-stone-300 bg-white text-sm font-medium text-stone-800 hover:border-stone-400 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>{t('openOnMobile')}</span>
          {liveCount > 0 && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[--color-accent] text-white text-[10px] font-semibold px-1 tabular-nums">
              {liveCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-950/45 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] flex flex-col bg-white rounded-t-2xl border-t border-stone-200 shadow-2xl data-[state=open]:animate-sheet-up"
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <span className="h-1 w-10 rounded-full bg-stone-300" />
          </div>
          <header className="flex items-center justify-between px-5 py-2 border-b border-stone-200">
            <Dialog.Title className="text-base font-semibold tracking-tight">
              {t('title')}
              {draftCount > 0 && (
                <span className="ml-2 font-mono text-xs text-stone-500 tabular-nums">
                  {draftCount}
                </span>
              )}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label={t('close')}
                className="h-9 w-9 inline-flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <FilterControls filters={draft} onChange={applyPatch} />
          </div>
          <footer className="border-t border-stone-200 px-5 py-3 flex items-center gap-3">
            {draftCount > 0 && (
              <button
                type="button"
                onClick={clearDraft}
                className="text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                {t('clearAll')}
              </button>
            )}
            <button
              type="button"
              onClick={commitDraft}
              className="ml-auto inline-flex items-center justify-center gap-1.5 h-12 px-6 rounded-full bg-[--color-accent-bright] text-stone-900 font-semibold text-sm hover:bg-[--color-accent] hover:text-white active:scale-95 transition-all"
            >
              {t('showResults')}{' '}
              <span className="font-mono tabular-nums">({resultCount})</span>
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
