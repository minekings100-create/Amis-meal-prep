'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import type { Product } from '@/types/database';
import { formatMoneyCents } from '@/lib/utils/money';
import { useCart } from '@/lib/cart/store';

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('shop.card');
  const tp = useTranslations('product');
  const locale = useLocale();
  const add = useCart((s) => s.add);

  const name = locale === 'en' ? product.name_en : product.name_nl;
  const outOfStock = product.stock <= 0;
  const isPackage = product.type !== 'meal';

  return (
    <article className="group relative">
      <Link href={`/shop/${product.slug}`} className="block focus:outline-none">
        {/* Plate-on-circle image, MegaFit style */}
        <div className="relative aspect-square rounded-full bg-[--color-bg-soft] overflow-hidden ring-1 ring-[--color-line] transition-transform duration-300 ease-out group-hover:scale-[1.02] group-hover:ring-[--color-accent-bright]/40">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs uppercase tracking-[0.18em] text-[--color-ink-soft]">
                {t('outOfStock')}
              </span>
            </div>
          )}
          {product.compare_at_price_cents && product.compare_at_price_cents > product.price_cents && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] rounded-full bg-[--color-accent] text-white">
              −
              {Math.round(
                ((product.compare_at_price_cents - product.price_cents) /
                  product.compare_at_price_cents) *
                  100,
              )}
              %
            </span>
          )}
        </div>

        <div className="mt-5 px-1">
          <h3 className="font-medium text-[--color-ink] group-hover:text-[--color-accent] transition-colors">
            {name}
          </h3>
          {product.kcal && (
            <p className="font-mono text-[11px] text-[--color-gray] mt-1 tracking-wide">
              {product.kcal} kcal · {product.protein_g}g {tp('protein').toLowerCase()}
            </p>
          )}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono font-semibold tabular-nums">
              {formatMoneyCents(product.price_cents)}
            </span>
            {product.compare_at_price_cents &&
              product.compare_at_price_cents > product.price_cents && (
                <span className="font-mono text-xs text-[--color-gray] line-through">
                  {formatMoneyCents(product.compare_at_price_cents)}
                </span>
              )}
            {isPackage && (
              <span className="text-[10px] uppercase tracking-[0.16em] text-[--color-gray]">
                {product.type === 'package' ? 'pakket' : 'try-out'}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        type="button"
        disabled={outOfStock}
        onClick={(e) => {
          e.preventDefault();
          add({
            productId: product.id,
            slug: product.slug,
            name,
            imageUrl: product.image_url,
            unitPriceCents: product.price_cents,
          });
        }}
        aria-label={t('addToCart')}
        className="absolute top-3 right-3 h-10 w-10 inline-flex items-center justify-center rounded-full bg-[--color-ink] text-white opacity-0 group-hover:opacity-100 hover:bg-[--color-accent] transition-all duration-200 ease-out disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
      </button>
    </article>
  );
}
