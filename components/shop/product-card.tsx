'use client';

import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { Plus } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import type { Product } from '@/types/database';
import { formatMoneyCents } from '@/lib/utils/money';
import { useCart } from '@/lib/cart/store';
import { toast } from '@/lib/toast/store';
import { GoalBadge } from './goal-badge';
import { AttributeBadges } from './attribute-badges';
import { CompareButton } from './compare-button';
import { CornerBadge } from './corner-badge';

export function ProductCard({ product }: { product: Product }) {
  const t = useTranslations('shop.card');
  const locale = useLocale() as 'nl' | 'en';
  const add = useCart((s) => s.add);

  const name = locale === 'en' ? product.name_en : product.name_nl;
  const outOfStock = product.stock <= 0;
  const onSale =
    product.compare_at_price_cents !== null &&
    product.compare_at_price_cents > product.price_cents;
  const showTypePill = product.type === 'package' || product.type === 'tryout';
  const typeLabel = product.type === 'package' ? t('typePackage') : t('typeTryout');

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    add(
      {
        productId: product.id,
        slug: product.slug,
        name,
        imageUrl: product.image_url,
        unitPriceCents: product.price_cents,
      },
      1,
      { silent: true },
    );
    toast(t('addedToCart', { name }));
  }

  return (
    <article className="group relative h-full">
      <Link
        href={`/shop/${product.slug}`}
        className="flex h-full flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand-yellow) focus-visible:ring-offset-2 rounded-2xl"
      >
        <div className="relative flex flex-1 flex-col bg-white border border-stone-200 dark:bg-(--color-bg-elevated) dark:border-(--color-border) rounded-2xl p-5 md:p-6 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_18px_44px_-20px_rgba(19,22,19,0.18)] group-hover:border-(--color-brand-yellow-bright)/40 dark:bg-(--color-bg-elevated) dark:border-(--color-border) dark:group-hover:shadow-[0_18px_44px_-20px_rgba(0,0,0,0.6)]">
          {/* Corner badge: at most one (sale > limited > new > bestseller). */}
          <CornerBadge product={product} />

          {showTypePill && (
            <span className="absolute top-3 right-14 z-10 inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {typeLabel}
            </span>
          )}

          {/* Compare toggle — top-right, sits in card padding outside the plate circle */}
          <CompareButton
            className="absolute top-3 right-3 z-10"
            item={{
              id: product.id,
              slug: product.slug,
              nameNl: product.name_nl,
              nameEn: product.name_en,
              imageUrl: product.image_url,
              priceCents: product.price_cents,
              kcal: product.kcal,
              proteinG: product.protein_g,
              carbsG: product.carbs_g,
              fatG: product.fat_g,
              fiberG: product.fiber_g,
              saltG: product.salt_g,
              goalTag: product.goal_tag,
            }}
          />


          {/* Plate-circle: visual element inside the rectangular card. Aspect-square so
              the plate height stays identical regardless of badge / name length. */}
          <div className="relative aspect-square w-full max-w-[300px] mx-auto rounded-full overflow-hidden bg-stone-50 ring-1 ring-stone-100 dark:bg-(--color-bg-soft) dark:ring-(--color-border)">
            {product.image_url && (
              <Image
                src={product.image_url}
                alt={name}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 40vw, 80vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
              />
            )}
            {outOfStock && (
              <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
                <span className="text-xs uppercase tracking-[0.18em] text-stone-700">
                  {t('outOfStock')}
                </span>
              </div>
            )}
          </div>

          {/* Content column — flex-1 so the footer can sit on mt-auto and align across
              cards in the same grid row. */}
          <div className="mt-5 flex flex-1 flex-col">
            {/* Badges row — fixed min-height so cards without attribute tags stay
                vertically aligned with cards that have them. */}
            <div className="flex min-h-[28px] flex-wrap items-center gap-2">
              {product.goal_tag && (
                <GoalBadge tag={product.goal_tag} locale={locale} variant="solid" size="md" />
              )}
              {product.attribute_tags.length > 0 && (
                <AttributeBadges tags={product.attribute_tags} locale={locale} max={3} size="sm" />
              )}
            </div>

            {/* Product name */}
            <h3 className="mt-4 font-semibold text-lg tracking-tight text-stone-900 dark:text-(--color-text) line-clamp-2 group-hover:text-(--color-brand-black) dark:group-hover:text-(--color-brand-yellow) transition-colors">
              {name}
            </h3>

            {/* Macros grid — full labels, mono numbers */}
            {product.kcal !== null && (
              <div className="mt-4 grid grid-cols-4 border border-stone-200 rounded-xl overflow-hidden dark:bg-(--color-bg-soft) dark:border-(--color-border)">
                <MacroCell
                  label={t('macroProtein')}
                  value={product.protein_g}
                  unit="g"
                  accent
                />
                <MacroCell label={t('macroCarbs')} value={product.carbs_g} unit="g" />
                <MacroCell label={t('macroFat')} value={product.fat_g} unit="g" />
                <MacroCell label={t('macroKcal')} value={product.kcal} />
              </div>
            )}

            {/* Footer: pinned to the bottom via mt-auto. Two rows so the strikethrough
                "compare-at" price gets its own breathing room and never collides with
                the Add button on package cards. */}
            <div className="mt-auto pt-5 space-y-3">
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-mono text-xl font-semibold tabular-nums">
                  {formatMoneyCents(product.price_cents)}
                </span>
                {onSale && (
                  <span className="font-mono text-sm text-stone-500 line-through tabular-nums">
                    {formatMoneyCents(product.compare_at_price_cents!)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-3">
                {product.kcal === null && product.type !== 'meal' ? (
                  <span className="text-[11px] uppercase tracking-[0.16em] text-stone-500">
                    {t('perMeal')}
                  </span>
                ) : (
                  <span aria-hidden />
                )}
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={outOfStock}
                  aria-label={`${t('addToCart')} — ${name}`}
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 active:scale-95 transition-all duration-200 ease-out disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand-yellow) focus-visible:ring-offset-2"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  <span>{t('addToCart')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function MacroCell({
  label,
  value,
  unit,
  accent = false,
}: {
  label: string;
  value: number | null;
  unit?: string;
  accent?: boolean;
}) {
  return (
    <div className="px-2 py-2.5 text-center border-r border-stone-200 dark:border-(--color-border) last:border-r-0">
      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] text-stone-500 dark:text-(--color-text-muted)">
        {label}
      </div>
      <div
        className={
          'font-mono text-sm font-semibold tabular-nums mt-0.5 ' +
          (accent ? 'text-(--color-brand-yellow)' : 'text-stone-900 dark:text-(--color-text)')
        }
      >
        {value ?? '–'}
        {unit && value !== null && (
          <span className="text-[10px] text-stone-500 dark:text-(--color-text-muted) font-medium ml-0.5">{unit}</span>
        )}
      </div>
    </div>
  );
}
