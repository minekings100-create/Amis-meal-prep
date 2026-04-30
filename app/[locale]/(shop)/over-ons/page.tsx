import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/config';

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-amis py-16 md:py-24 max-w-3xl">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">
        {locale === 'en' ? 'About' : 'Over ons'}
      </p>
      <h1 className="text-4xl md:text-5xl tracking-[-0.035em]">
        {locale === 'en' ? 'Built in Maastricht.' : 'Gebouwd in Maastricht.'}
      </h1>
      <div className="prose prose-neutral mt-8 max-w-none text-[--color-ink-soft] leading-relaxed">
        <p className="text-lg">
          {locale === 'en'
            ? 'AMIS Meals is the meal-prep arm of AMIS — built for athletes and people who take their nutrition seriously. We cook so you can train.'
            : 'AMIS Meals is de meal-prep tak van AMIS — gemaakt voor sporters en mensen die hun voeding serieus nemen. Wij koken zodat jij kunt trainen.'}
        </p>
      </div>
    </div>
  );
}
