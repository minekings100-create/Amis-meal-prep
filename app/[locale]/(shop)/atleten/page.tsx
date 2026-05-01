import Image from 'next/image';
import { Suspense } from 'react';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { listAthletes } from '@/lib/data/products';
import { AthletesGridSkeleton } from '@/components/shop/athlete-portrait-skeleton';
import { maybeSlow } from '@/lib/utils/slow-mode';
import type { Locale } from '@/lib/i18n/config';

export default async function AthletesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('home.athletes');

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-3">
        {t('subtitle')}
      </p>
      <h1 className="text-4xl md:text-5xl tracking-[-0.035em] font-bold text-stone-900 mb-12">
        {t('title')}
      </h1>

      <Suspense fallback={<AthletesGridSkeleton count={3} />}>
        <AthletesGrid searchParams={sp} />
      </Suspense>
    </div>
  );
}

async function AthletesGrid({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await maybeSlow(searchParams);
  const athletes = await listAthletes();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {athletes.map((a) => (
        <Link key={a.id} href={`/atleten/${a.slug}`} className="group block">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-stone-100">
            {a.portrait_url && (
              <Image
                src={a.portrait_url}
                alt={a.name}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/10 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[--color-accent-bright]">
                {a.sport}
              </p>
              <h2 className="text-2xl font-semibold mt-1 tracking-[-0.02em]">{a.name}</h2>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

