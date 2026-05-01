import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/config';
import { FaqClient } from '@/components/legal/faq-client';

export const metadata = {
  title: 'Veelgestelde vragen',
  description:
    'Antwoorden op de meestgestelde vragen over bestellen, bezorging, maaltijden, betaling en account bij AMIS Meals.',
};

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEN = locale === 'en';
  return <FaqClient locale={isEN ? 'en' : 'nl'} />;
}
