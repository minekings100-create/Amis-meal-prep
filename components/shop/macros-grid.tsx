import { useTranslations } from 'next-intl';
import type { Product } from '@/types/database';
import { cn } from '@/lib/utils/cn';

interface Macro {
  key: 'kcal' | 'protein' | 'carbs' | 'fat' | 'fiber' | 'salt';
  label: string;
  value: number | null;
  unit: 'kcal' | 'g';
  /** Reference-intake daily value (Voedingscentrum NL portie). */
  referenceValue: number;
  /** True for the headline (calories) and the brand-accented row (protein). */
  emphasis?: 'kcal' | 'protein';
}

const RI = {
  kcal: 2000,
  protein: 50,
  carbs: 260,
  fat: 70,
  fiber: 30,
  salt: 6,
};

export function MacrosGrid({ product }: { product: Product }) {
  const t = useTranslations('product');
  if (!product.kcal && !product.protein_g) return null;

  const macros: Macro[] = [
    { key: 'kcal', label: t('kcal'), value: product.kcal, unit: 'kcal', referenceValue: RI.kcal, emphasis: 'kcal' },
    { key: 'protein', label: t('protein'), value: product.protein_g, unit: 'g', referenceValue: RI.protein, emphasis: 'protein' },
    { key: 'carbs', label: t('carbs'), value: product.carbs_g, unit: 'g', referenceValue: RI.carbs },
    { key: 'fat', label: t('fat'), value: product.fat_g, unit: 'g', referenceValue: RI.fat },
    { key: 'fiber', label: t('fiber'), value: product.fiber_g, unit: 'g', referenceValue: RI.fiber },
    { key: 'salt', label: t('salt'), value: product.salt_g, unit: 'g', referenceValue: RI.salt },
  ];

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8">
      <header className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
          Voedingswaarden
        </p>
        <p className="text-sm text-stone-400 mt-0.5">per portie</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6">
        {macros.map((m, i) => {
          // Right border on md+ except the last column (every 3rd item).
          // Mobile: bottom border between the two columns rows.
          const isLastInDesktopRow = (i + 1) % 3 === 0;
          const isLastInMobileRow = (i + 1) % 2 === 0;
          return (
            <div
              key={m.key}
              className={cn(
                'px-3 md:px-5',
                !isLastInMobileRow && 'border-r border-stone-100 md:border-r-0',
                !isLastInDesktopRow && 'md:border-r md:border-stone-100',
              )}
            >
              <MacroCell macro={m} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MacroCell({ macro }: { macro: Macro }) {
  const value = macro.value;
  const pct =
    value !== null
      ? Math.min(100, Math.round((value / macro.referenceValue) * 100))
      : 0;
  const valueColor =
    macro.emphasis === 'protein' ? 'text-(--color-brand-yellow-deep)' : 'text-stone-900';
  const fillColor =
    macro.emphasis === 'protein' ? 'bg-(--color-brand-yellow-deep)' : 'bg-stone-900';

  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {macro.label}
      </p>
      <p className={cn('mt-1 text-3xl font-light tabular-nums tracking-tight', valueColor)}>
        {value ?? '–'}
        {value !== null && (
          <span className="text-base font-light text-stone-400 ml-1">{macro.unit}</span>
        )}
      </p>
      <div className="mt-3 h-1 w-full rounded-full bg-stone-100 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', fillColor)}
          style={{ width: value !== null ? `${pct}%` : '0%' }}
        />
      </div>
      <p className="mt-1.5 text-xs text-stone-400 tabular-nums">
        {value !== null ? `${pct}% RI` : '—'}
      </p>
    </div>
  );
}
