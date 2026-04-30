import { useTranslations } from 'next-intl';
import type { Product } from '@/types/database';

export function MacrosGrid({ product }: { product: Product }) {
  const t = useTranslations('product');
  if (!product.kcal && !product.protein_g) return null;

  const items: Array<{ label: string; value: string; unit: string }> = [];
  if (product.kcal) items.push({ label: t('kcal'), value: String(product.kcal), unit: 'kcal' });
  if (product.protein_g)
    items.push({ label: t('protein'), value: String(product.protein_g), unit: 'g' });
  if (product.carbs_g) items.push({ label: t('carbs'), value: String(product.carbs_g), unit: 'g' });
  if (product.fat_g) items.push({ label: t('fat'), value: String(product.fat_g), unit: 'g' });
  if (product.fiber_g) items.push({ label: t('fiber'), value: String(product.fiber_g), unit: 'g' });
  if (product.salt_g) items.push({ label: t('salt'), value: String(product.salt_g), unit: 'g' });

  return (
    <div className="border border-[--color-line] rounded-[--radius] overflow-hidden">
      <div className="grid grid-cols-3 md:grid-cols-6 divide-x divide-[--color-line]">
        {items.map((it) => (
          <div key={it.label} className="p-4 text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[--color-gray]">
              {it.label}
            </p>
            <p className="font-mono text-2xl font-semibold mt-1 tabular-nums">
              {it.value}
              <span className="text-xs text-[--color-gray] ml-0.5">{it.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
