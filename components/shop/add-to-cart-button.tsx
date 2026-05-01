'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/lib/cart/store';
import type { Product } from '@/types/database';

export function AddToCartButton({
  product,
  displayName,
}: {
  product: Product;
  displayName: string;
}) {
  const t = useTranslations('product');
  const tc = useTranslations('cart');
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex gap-3 items-stretch">
      <div className="inline-flex items-center border border-(--color-line) rounded-[--radius-sm]">
        <button
          type="button"
          onClick={() => setQty(Math.max(1, qty - 1))}
          aria-label={tc('decrease')}
          className="h-12 w-11 inline-flex items-center justify-center text-(--color-ink-soft) hover:text-(--color-ink)"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 text-center font-mono font-medium tabular-nums">{qty}</span>
        <button
          type="button"
          onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
          aria-label={tc('increase')}
          className="h-12 w-11 inline-flex items-center justify-center text-(--color-ink-soft) hover:text-(--color-ink)"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <Button
        size="lg"
        disabled={outOfStock}
        onClick={() =>
          add(
            {
              productId: product.id,
              slug: product.slug,
              name: displayName,
              imageUrl: product.image_url,
              unitPriceCents: product.price_cents,
            },
            qty,
          )
        }
        className="flex-1"
      >
        <ShoppingBag className="h-4 w-4" />
        {outOfStock ? t('outOfStock') : t('addToCart')}
      </Button>
    </div>
  );
}
