import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/config';

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-amis py-16 md:py-24 max-w-2xl">
      <h1 className="text-4xl md:text-5xl tracking-[-0.035em]">Contact</h1>
      <div className="mt-8 space-y-4 text-(--color-ink-soft)">
        <p>
          <strong className="text-(--color-ink)">Email:</strong>{' '}
          <a href="mailto:hallo@amismeals.nl" className="text-(--color-accent) hover:underline">
            hallo@amismeals.nl
          </a>
        </p>
        <p>
          <strong className="text-(--color-ink)">
            {locale === 'en' ? 'Address' : 'Adres'}:
          </strong>{' '}
          Maastricht, NL
        </p>
      </div>
    </div>
  );
}
