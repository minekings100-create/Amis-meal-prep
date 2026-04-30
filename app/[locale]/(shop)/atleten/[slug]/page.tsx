import Image from 'next/image';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { getAthleteBySlug, getProductBySlug, listProducts } from '@/lib/data/products';
import { ProductCard } from '@/components/shop/product-card';
import type { Locale } from '@/lib/i18n/config';
import type { Product } from '@/types/database';

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ slug: string; locale: Locale }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const athlete = await getAthleteBySlug(slug);
  if (!athlete) notFound();

  // For mock data we lookup package by id; in Supabase mode we'd join.
  let pkg: Product | null = null;
  if (athlete.package_id) {
    const all = await listProducts({});
    pkg = all.find((p) => p.id === athlete.package_id) ?? null;
  }

  const bio = locale === 'en' ? athlete.bio_en : athlete.bio_nl;

  return (
    <div className="container-amis py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="relative aspect-[4/5] rounded-[--radius] overflow-hidden bg-[--color-bg-soft]">
          {athlete.portrait_url && (
            <Image
              src={athlete.portrait_url}
              alt={athlete.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">
            {athlete.sport}
            {athlete.goal && ` · ${athlete.goal}`}
          </p>
          <h1 className="text-4xl md:text-5xl tracking-[-0.035em]">{athlete.name}</h1>
          {bio && <p className="mt-6 text-lg text-[--color-ink-soft] leading-relaxed">{bio}</p>}

          {pkg && (
            <div className="mt-10 border border-[--color-line] rounded-[--radius] p-6 bg-[--color-bg-soft]">
              <p className="text-[10px] uppercase tracking-[0.18em] text-[--color-gray] mb-2">
                Signature plan
              </p>
              <h2 className="text-xl font-semibold tracking-[-0.02em]">
                {locale === 'en' ? pkg.name_en : pkg.name_nl}
              </h2>
              <p className="text-sm text-[--color-ink-soft] mt-2">
                {locale === 'en' ? pkg.description_en : pkg.description_nl}
              </p>
              <div className="mt-6 flex gap-3">
                <Button asChild>
                  <Link href={`/shop/${pkg.slug}`}>
                    {locale === 'en' ? 'Order this week' : 'Bestel deze week'}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {pkg && (
        <section className="mt-20 pt-12 border-t border-[--color-line]">
          <h2 className="text-2xl tracking-[-0.02em] mb-8">
            {locale === 'en' ? 'In this plan' : 'In dit plan'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {(await listProducts({ type: 'meal' })).slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
