import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ProductCard } from '@/components/shop/product-card';
import { ShopFilters } from '@/components/shop/shop-filters';
import { listCategories, listProducts, type ProductFilters } from '@/lib/data/products';
import type { Locale } from '@/lib/i18n/config';

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

  const typeParam = typeof sp.type === 'string' ? sp.type : undefined;
  const filters: ProductFilters = {
    type:
      typeParam === 'meal' || typeParam === 'package' || typeParam === 'tryout'
        ? typeParam
        : undefined,
    categorySlug: typeof sp.category === 'string' ? sp.category : undefined,
    sort:
      sp.sort === 'price-asc' || sp.sort === 'price-desc'
        ? (sp.sort as 'price-asc' | 'price-desc')
        : 'featured',
  };

  const [products, categories] = await Promise.all([listProducts(filters), listCategories()]);

  return (
    <>
      <section className="container-amis pt-16 pb-10">
        <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">Menu</p>
        <h1 className="text-4xl md:text-5xl tracking-[-0.035em]">{t('title')}</h1>
      </section>

      <ShopFilters categories={categories} />

      <section className="container-amis py-16">
        {products.length === 0 ? (
          <p className="text-center text-[--color-ink-soft] py-24">
            Geen producten gevonden voor deze filters.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-14">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
