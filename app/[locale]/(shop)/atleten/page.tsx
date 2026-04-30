import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { listAthletes } from '@/lib/data/products';
import type { Locale } from '@/lib/i18n/config';

export default async function AthletesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const athletes = await listAthletes();
  const t = await getTranslations('home.athletes');

  return (
    <div className="container-amis py-16 md:py-24">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">
        {t('subtitle')}
      </p>
      <h1 className="text-4xl md:text-5xl tracking-[-0.035em] mb-12">{t('title')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {athletes.map((a) => (
          <Link key={a.id} href={`/atleten/${a.slug}`} className="group block">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[--radius] bg-[--color-bg-soft]">
              {a.portrait_url && (
                <Image
                  src={a.portrait_url}
                  alt={a.name}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[--color-ink]/80 via-[--color-ink]/10 to-transparent" />
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
    </div>
  );
}
