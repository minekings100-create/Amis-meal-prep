import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Product } from '@/types/database';

const ALLERGEN_KEYS = [
  ['contains_gluten', 'gluten'],
  ['contains_lactose', 'lactose'],
  ['contains_nuts', 'nuts'],
  ['contains_eggs', 'eggs'],
  ['contains_soy', 'soy'],
  ['contains_fish', 'fish'],
  ['contains_shellfish', 'shellfish'],
  ['contains_sesame', 'sesame'],
  ['contains_celery', 'celery'],
  ['contains_mustard', 'mustard'],
  ['contains_lupine', 'lupine'],
  ['contains_sulfite', 'sulfite'],
  ['contains_mollusks', 'mollusks'],
] as const;

export function AllergensList({ product }: { product: Product }) {
  const t = useTranslations('allergens');
  const tp = useTranslations('product');

  const present = ALLERGEN_KEYS.filter(([flag]) => product[flag]);
  const absent = ALLERGEN_KEYS.filter(([flag]) => !product[flag]);

  if (present.length === 0) {
    return <p className="text-sm text-(--color-ink-soft)">{tp('noAllergens')}</p>;
  }

  return (
    <div className="space-y-3">
      {present.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 mb-2">
            Bevat
          </p>
          <div className="flex flex-wrap gap-1.5">
            {present.map(([, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-red-200 bg-red-50 text-red-700 text-xs font-medium"
              >
                <X className="h-3 w-3" strokeWidth={2.5} />
                {t(label)}
              </span>
            ))}
          </div>
        </div>
      )}
      {absent.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 mb-2">
            Vrij van
          </p>
          <div className="flex flex-wrap gap-1.5">
            {absent.map(([, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium"
              >
                <Check className="h-3 w-3" strokeWidth={2.5} />
                {t(label)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
