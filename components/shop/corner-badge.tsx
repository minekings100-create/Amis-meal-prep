import { Flame } from 'lucide-react';
import type { AttributeTag, Product } from '@/types/database';
import { cn } from '@/lib/utils/cn';

/**
 * Corner badge — at most one per product card. Sits top-3 left-3 inside the
 * card padding, sticker-style (rounded-md, not pill). Priority order:
 *   1. sale       — derived from compare_at_price > price; shows −X%
 *   2. limited
 *   3. new
 *   4. bestseller (subtle pulse, Flame icon)
 *
 * The `attribute_tags` driver matches the existing AttributeTag enum so
 * authors stay in the admin form they already know.
 */
type CornerKind = 'sale' | 'limited' | 'new' | 'bestseller';

const PRIORITY: CornerKind[] = ['sale', 'limited', 'new', 'bestseller'];

function pickKind(product: Pick<Product, 'compare_at_price_cents' | 'price_cents' | 'attribute_tags'>): {
  kind: CornerKind;
  salePct: number | null;
} | null {
  const onSale =
    product.compare_at_price_cents !== null &&
    product.compare_at_price_cents > product.price_cents;
  const salePct = onSale
    ? Math.round(
        ((product.compare_at_price_cents! - product.price_cents) /
          product.compare_at_price_cents!) *
          100,
      )
    : null;

  const tagSet = new Set<AttributeTag>(product.attribute_tags ?? []);
  for (const k of PRIORITY) {
    if (k === 'sale' && onSale) return { kind: 'sale', salePct };
    if (k !== 'sale' && tagSet.has(k as AttributeTag)) return { kind: k, salePct: null };
  }
  return null;
}

export function CornerBadge({
  product,
}: {
  product: Pick<Product, 'compare_at_price_cents' | 'price_cents' | 'attribute_tags'>;
}) {
  const picked = pickKind(product);
  if (!picked) return null;

  const baseClasses =
    'absolute top-3 left-3 z-10 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap';

  switch (picked.kind) {
    case 'sale':
      return (
        <span className={cn(baseClasses, 'bg-red-600 text-white')}>−{picked.salePct}%</span>
      );
    case 'limited':
      return (
        <span className={cn(baseClasses, 'bg-(--color-brand-black) text-white')}>Limited</span>
      );
    case 'new':
      return (
        <span className={cn(baseClasses, 'bg-(--color-brand-yellow) text-(--color-brand-black)')}>
          Nieuw
        </span>
      );
    case 'bestseller':
      return (
        <span
          className={cn(
            baseClasses,
            'bg-(--color-brand-black) text-(--color-brand-yellow) animate-corner-pulse',
          )}
        >
          <Flame className="h-3 w-3" strokeWidth={2.5} />
          Bestseller
        </span>
      );
  }
}
