import Image from 'next/image';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import { getProductBySlug, listPublishedReviews } from '@/lib/data/products';
import { formatMoneyCents } from '@/lib/utils/money';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { MacrosGrid } from '@/components/shop/macros-grid';
import { AllergensList } from '@/components/shop/allergens-list';
import { ReviewsSection } from '@/components/shop/reviews-section';
import { ProductDetailSkeleton } from '@/components/shop/product-detail-skeleton';
import { maybeSlow } from '@/lib/utils/slow-mode';
import type { Locale } from '@/lib/i18n/config';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = locale === 'en' ? product.name_en : product.name_nl;
  const description = locale === 'en' ? product.description_en : product.description_nl;
  return {
    title: name,
    description: description ?? undefined,
    openGraph: {
      title: name,
      description: description ?? undefined,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug, locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail slug={slug} locale={locale} searchParams={sp} />
    </Suspense>
  );
}

async function ProductDetail({
  slug,
  locale,
  searchParams,
}: {
  slug: string;
  locale: Locale;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await maybeSlow(searchParams);

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const reviews = await listPublishedReviews(product.id);
  const t = await getTranslations('product');

  const name = locale === 'en' ? product.name_en : product.name_nl;
  const description = locale === 'en' ? product.description_en : product.description_nl;
  const ingredients = locale === 'en' ? product.ingredients_en : product.ingredients_nl;
  const stockText = t('stock', { count: product.stock });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: product.image_url,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (product.price_cents / 100).toFixed(2),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    nutrition: product.kcal
      ? {
          '@type': 'NutritionInformation',
          calories: `${product.kcal} kcal`,
          proteinContent: product.protein_g ? `${product.protein_g} g` : undefined,
          carbohydrateContent: product.carbs_g ? `${product.carbs_g} g` : undefined,
          fatContent: product.fat_g ? `${product.fat_g} g` : undefined,
        }
      : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="sticky top-24 self-start">
            <div className="relative aspect-square rounded-full bg-stone-50 overflow-hidden ring-1 ring-stone-100">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={name}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-(--color-accent) mb-3">
              {product.type === 'meal'
                ? locale === 'en'
                  ? 'Meal'
                  : 'Maaltijd'
                : product.type === 'package'
                  ? 'Pakket'
                  : 'Try-out'}
            </p>
            <h1 className="text-4xl md:text-5xl tracking-[-0.035em] font-bold text-stone-900">
              {name}
            </h1>
            {description && (
              <p className="mt-4 text-lg text-stone-600 leading-relaxed">{description}</p>
            )}

            <div className="mt-8 flex items-baseline gap-4">
              <span className="font-mono text-3xl font-semibold tabular-nums">
                {formatMoneyCents(product.price_cents)}
              </span>
              {product.compare_at_price_cents &&
                product.compare_at_price_cents > product.price_cents && (
                  <span className="font-mono text-base text-stone-400 line-through">
                    {formatMoneyCents(product.compare_at_price_cents)}
                  </span>
                )}
              <span className="text-xs text-stone-500">{t('vatNote')}</span>
            </div>

            <p
              className={
                'mt-2 text-xs font-mono uppercase tracking-[0.16em] ' +
                (product.stock > 0 ? 'text-(--color-accent)' : 'text-stone-500')
              }
            >
              {stockText}
            </p>

            <div className="mt-8">
              <AddToCartButton product={product} displayName={name} />
            </div>

            <div className="mt-12">
              <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-4">
                {t('macros')}
              </h2>
              <MacrosGrid product={product} />
            </div>

            {ingredients && (
              <div className="mt-12">
                <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-3">
                  {t('ingredients')}
                </h2>
                <p className="text-sm text-stone-600 leading-relaxed">{ingredients}</p>
              </div>
            )}

            <div className="mt-12">
              <h2 className="text-xs uppercase tracking-[0.18em] text-stone-500 mb-4">
                {t('allergens')}
              </h2>
              <AllergensList product={product} />
            </div>
          </div>
        </div>

        <ReviewsSection reviews={reviews} />
      </div>
    </>
  );
}
