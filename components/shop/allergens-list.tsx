import { useTranslations } from 'next-intl';
import type { Product } from '@/types/database';
import { Badge } from '@/components/ui/badge';

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

  if (present.length === 0) {
    return <p className="text-sm text-[--color-ink-soft]">{tp('noAllergens')}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {present.map(([, label]) => (
        <Badge key={label} variant="outline">
          {t(label)}
        </Badge>
      ))}
    </div>
  );
}
