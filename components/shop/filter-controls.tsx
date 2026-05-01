'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { useSearchParams } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { ALLERGEN_KEYS, type ProductFilters } from '@/lib/shop/types';
import {
  buildFilterURL,
  toggleInList,
  PRICE_RANGE_CENTS,
} from '@/lib/shop/filters';
import { GOAL_TAGS, ATTRIBUTE_TAGS } from '@/lib/tags';
import type { GoalTag, AttributeTag } from '@/types/database';
import { cn } from '@/lib/utils/cn';
import { formatMoneyCents } from '@/lib/utils/money';

export function FilterControls({
  filters,
  onChange,
}: {
  filters: ProductFilters;
  /** When provided, button-clicks call this instead of pushing to URL — used for mobile-sheet
   *  draft state that only commits when user taps "Show results". */
  onChange?: (patch: Parameters<typeof buildFilterURL>[1]) => void;
}) {
  const t = useTranslations('shop.filters');
  const tAllergens = useTranslations('allergens');
  const locale = useLocale() as 'nl' | 'en';
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [allergensExpanded, setAllergensExpanded] = useState(false);

  function patch(p: Parameters<typeof buildFilterURL>[1]) {
    if (onChange) {
      onChange(p);
      return;
    }
    const url = buildFilterURL(pathname, p, new URLSearchParams(sp.toString()));
    startTransition(() => router.replace(url));
  }

  const visibleAllergens = useMemo(
    () => (allergensExpanded ? ALLERGEN_KEYS : ALLERGEN_KEYS.slice(0, 4)),
    [allergensExpanded],
  );

  const goalTags = filters.goalTags ?? [];
  const attrTags = filters.attributeTags ?? [];
  const allergenAvoid = filters.allergensAvoid ?? [];

  return (
    <div className="space-y-7">
      {/* TYPE */}
      <Section title={t('type')}>
        <div className="space-y-1">
          <RadioRow
            label={t('all')}
            checked={!filters.type}
            onChange={() => patch({ type: null })}
          />
          {(['meal', 'package', 'tryout'] as const).map((tp) => (
            <RadioRow
              key={tp}
              label={t(tp)}
              checked={filters.type === tp}
              onChange={() => patch({ type: tp })}
            />
          ))}
        </div>
      </Section>

      {/* GOAL */}
      <Section title={t('goal')}>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(GOAL_TAGS) as GoalTag[]).map((g) => {
            const active = goalTags.includes(g);
            const cfg = GOAL_TAGS[g];
            const label = locale === 'en' ? cfg.labelEn : cfg.labelNl;
            return (
              <button
                key={g}
                type="button"
                onClick={() => patch({ goal: toggleInList(goalTags, g) })}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full transition-colors border',
                  active
                    ? `${cfg.solidBg} ${cfg.solidText} border-transparent`
                    : `${cfg.bg} ${cfg.text} ${cfg.border} hover:opacity-80`,
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ATTRIBUTES */}
      <Section title={t('attributes')}>
        <div className="space-y-1.5">
          {(Object.keys(ATTRIBUTE_TAGS) as AttributeTag[]).map((a) => {
            const cfg = ATTRIBUTE_TAGS[a];
            const Icon = cfg.icon;
            const checked = attrTags.includes(a);
            const label = locale === 'en' ? cfg.labelEn : cfg.labelNl;
            return (
              <CheckboxRow
                key={a}
                label={label}
                icon={<Icon className="h-3.5 w-3.5" aria-hidden />}
                checked={checked}
                onChange={() => patch({ attr: toggleInList(attrTags, a) })}
              />
            );
          })}
        </div>
      </Section>

      {/* ALLERGENS */}
      <Section title={t('allergensAvoid')}>
        <div className="space-y-1.5">
          {visibleAllergens.map((a) => (
            <CheckboxRow
              key={a}
              label={tAllergens(a)}
              checked={allergenAvoid.includes(a)}
              onChange={() => patch({ nf: toggleInList(allergenAvoid, a) })}
            />
          ))}
          <button
            type="button"
            onClick={() => setAllergensExpanded((v) => !v)}
            className="mt-2 text-xs font-medium text-[--color-accent] hover:text-[--color-ink] transition-colors"
          >
            {allergensExpanded ? t('showFewerAllergens') : t('showAllAllergens')}
          </button>
        </div>
      </Section>

      {/* PRICE */}
      <Section title={t('priceRange')}>
        <PriceRange
          min={PRICE_RANGE_CENTS.min}
          max={PRICE_RANGE_CENTS.max}
          value={[
            filters.minPriceCents ?? PRICE_RANGE_CENTS.min,
            filters.maxPriceCents ?? PRICE_RANGE_CENTS.max,
          ]}
          onChange={(lo, hi) =>
            patch({
              min: lo === PRICE_RANGE_CENTS.min ? null : lo,
              max: hi === PRICE_RANGE_CENTS.max ? null : hi,
            })
          }
        />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 mb-3">
        {title}
      </h3>
      {children}
    </section>
  );
}

function RadioRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center gap-3 px-2 py-1.5 -mx-2 rounded-md text-left text-sm hover:bg-stone-50 transition-colors"
    >
      <span
        className={cn(
          'h-4 w-4 rounded-full border-2 inline-flex items-center justify-center shrink-0 transition-colors',
          checked
            ? 'border-[--color-accent] bg-[--color-accent]'
            : 'border-stone-300 bg-white',
        )}
      >
        {checked && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className={checked ? 'font-medium text-stone-900' : 'text-stone-700'}>{label}</span>
    </button>
  );
}

function CheckboxRow({
  label,
  icon,
  checked,
  onChange,
}: {
  label: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="w-full flex items-center gap-3 px-2 py-1.5 -mx-2 rounded-md text-left text-sm hover:bg-stone-50 transition-colors"
    >
      <span
        className={cn(
          'h-4 w-4 rounded border-2 inline-flex items-center justify-center shrink-0 transition-colors',
          checked
            ? 'border-[--color-accent] bg-[--color-accent]'
            : 'border-stone-300 bg-white',
        )}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      {icon && <span className="text-stone-500">{icon}</span>}
      <span className={checked ? 'font-medium text-stone-900' : 'text-stone-700'}>{label}</span>
    </button>
  );
}

function PriceRange({
  min,
  max,
  value,
  onChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (lo: number, hi: number) => void;
}) {
  const [lo, hi] = value;
  const step = 50;

  function setLo(v: number) {
    const next = Math.min(v, hi - step);
    onChange(Math.max(min, next), hi);
  }
  function setHi(v: number) {
    const next = Math.max(v, lo + step);
    onChange(lo, Math.min(max, next));
  }

  const loPct = ((lo - min) / (max - min)) * 100;
  const hiPct = ((hi - min) / (max - min)) * 100;

  return (
    <div className="px-1">
      <div className="relative h-6">
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 rounded-full bg-stone-200" />
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1 rounded-full bg-[--color-accent]"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => setLo(Number(e.target.value))}
          aria-label="Min price"
          className="price-range-thumb absolute top-0 left-0 right-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => setHi(Number(e.target.value))}
          aria-label="Max price"
          className="price-range-thumb absolute top-0 left-0 right-0 w-full h-6 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto"
        />
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs tabular-nums text-stone-700">
        <span>{formatMoneyCents(lo)}</span>
        <span>{formatMoneyCents(hi)}</span>
      </div>
    </div>
  );
}
