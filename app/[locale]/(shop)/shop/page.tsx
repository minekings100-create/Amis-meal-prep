import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/shop/product-card';
import { ProductGridSkeleton } from '@/components/shop/product-card-skeleton';
import { FilterSidebar } from '@/components/shop/filter-sidebar';
import { FilterBottomSheet } from '@/components/shop/filter-bottom-sheet';
import { ActiveFilterPills } from '@/components/shop/active-filter-pills';
import { SortDropdown } from '@/components/shop/sort-dropdown';
import { BuildYourOwnBanner } from '@/components/shop/build-your-own-banner';
import { listProducts } from '@/lib/data/products';
import { parseFiltersFromSearchParams } from '@/lib/shop/filters';
import { maybeSlow } from '@/lib/utils/slow-mode';
import type { Locale } from '@/lib/i18n/config';
import type { ProductFilters } from '@/lib/shop/types';

export const dynamic = 'force-dynamic';

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const t = await getTranslations('shop');
  const filters = parseFiltersFromSearchParams(sp);

  // Dynamic intro
  let intro = t('intro.default');
  if (filters.goalTags?.length === 1) {
    intro = t(`intro.goal.${filters.goalTags[0]}`);
  } else if (filters.type === 'package') {
    intro = t('intro.package');
  } else if (filters.type === 'tryout') {
    intro = t('intro.tryout');
  } else if (filters.type === 'meal') {
    intro = t('intro.meal');
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
      <BuildYourOwnBanner />

      <header className="mb-10 lg:mb-14">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-4">
          Menu
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] tracking-[-0.035em] font-bold text-stone-900">
          {t('title')}
        </h1>
        <p className="mt-4 text-base md:text-lg text-stone-600 max-w-xl leading-relaxed">{intro}</p>
        <hr className="mt-10 border-stone-200" />
      </header>

      <div className="flex gap-10">
        <FilterSidebar filters={filters} />

        <div className="flex-1 min-w-0">
          <Suspense
            fallback={<ShopMainFallback />}
            // Re-suspend whenever the URL filters change
            key={JSON.stringify(sp)}
          >
            <ShopMain filters={filters} searchParams={sp} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function ShopMain({
  filters,
  searchParams,
}: {
  filters: ProductFilters;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await maybeSlow(searchParams);
  const products = await listProducts(filters);
  const t = await getTranslations('shop');

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <FilterBottomSheet filters={filters} resultCount={products.length} />
        <p className="text-sm text-stone-600 font-mono tabular-nums hidden sm:block">
          {t('results.count', { count: products.length })}
        </p>
        <div className="ml-auto">
          <SortDropdown value={filters.sort ?? 'featured'} />
        </div>
      </div>

      <div className="mb-6">
        <ActiveFilterPills filters={filters} />
      </div>

      <p className="text-sm text-stone-600 font-mono tabular-nums sm:hidden mb-4">
        {t('results.count', { count: products.length })}
      </p>

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-stone-500">{t('results.noMatch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 auto-rows-fr">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

function ShopMainFallback() {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="lg:hidden h-10 w-28 rounded-full bg-stone-100 animate-pulse" />
        <div className="ml-auto h-10 w-44 rounded-full bg-stone-100 animate-pulse" />
      </div>
      <div className="mb-6 h-8" />
      <ProductGridSkeleton count={6} />
    </>
  );
}
