import { Leaf, Beef, MapPin, ArrowRight } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import type { Locale } from '@/lib/i18n/config';

export const metadata = {
  title: 'Over ons',
  description:
    'AMIS Meals is de meal-prep tak van AMIS — vers, hoog-eiwit en vanuit Maastricht.',
};

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEN = locale === 'en';

  const pillars = isEN
    ? [
        { icon: Leaf, title: 'Always fresh', body: 'Cooked the day of (or before) shipping. Never frozen, delivered chilled.' },
        { icon: Beef, title: 'High-protein', body: 'Macros calibrated for athletes — Cut, Bulk, Performance and Maintenance ranges.' },
        { icon: MapPin, title: 'Local roots', body: 'Built next to AMIS restaurant in Maastricht. Local delivery on Thursdays.' },
      ]
    : [
        { icon: Leaf, title: 'Altijd vers', body: 'Bereid op de productiedag of de dag ervoor. Nooit ingevroren, gekoeld geleverd.' },
        { icon: Beef, title: 'Hoog-eiwit', body: 'Macros afgestemd op sporters — Cut, Bulk, Performance en Onderhoud.' },
        { icon: MapPin, title: 'Lokaal hart', body: 'Gebouwd naast AMIS restaurant in Maastricht. Donderdag lokaal bezorgd.' },
      ];

  return (
    <div className="relative">
      {/* Brand backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-12 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-(--color-brand-yellow-bright)/8 blur-3xl"
      />

      <div className="container-amis relative py-16 md:py-24 max-w-4xl">
        <header className="mb-12 md:mb-16 max-w-3xl">
          <p className="text-[10px] uppercase tracking-[0.24em] text-(--color-brand-yellow) mb-3 font-semibold">
            {isEN ? 'About' : 'Over ons'}
          </p>
          <h1 className="text-4xl md:text-6xl font-bold tracking-[-0.035em] leading-[1.05]">
            {isEN ? 'Built in Maastricht.' : 'Gebouwd in Maastricht.'}
          </h1>
          <p className="text-stone-600 mt-6 text-lg md:text-xl leading-relaxed max-w-2xl">
            {isEN
              ? 'AMIS Meals is the meal-prep arm of AMIS — built for athletes and people who take their nutrition seriously. We cook so you can train.'
              : 'AMIS Meals is de meal-prep tak van AMIS — gemaakt voor sporters en mensen die hun voeding serieus nemen. Wij koken zodat jij kunt trainen.'}
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {pillars.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className="rounded-2xl border border-stone-200 bg-white p-6 hover:border-stone-300 transition-colors"
              >
                <div className="h-10 w-10 rounded-xl bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) inline-flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="font-semibold text-stone-900 tracking-[-0.01em]">{p.title}</h2>
                <p className="text-sm text-stone-600 mt-2 leading-relaxed">{p.body}</p>
              </div>
            );
          })}
        </section>

        <div className="rounded-2xl bg-(--color-ink) text-white p-6 md:p-8 relative overflow-hidden">
          <div
            aria-hidden
            className="absolute -bottom-12 -right-12 select-none pointer-events-none text-[14rem] font-bold tracking-[-0.06em] text-white/[0.04] leading-none"
          >
            AMIS
          </div>
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="max-w-xl">
              <h3 className="text-xl md:text-2xl font-bold tracking-[-0.02em]">
                {isEN ? 'Ready to fuel the week?' : 'Klaar om je week vol te plannen?'}
              </h3>
              <p className="text-white/70 mt-2 text-sm">
                {isEN
                  ? 'Browse losse maaltijden or grab a weekly package from the shop.'
                  : 'Kies losse maaltijden of pak een weekpakket uit de shop.'}
              </p>
            </div>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black) shrink-0"
            >
              {isEN ? 'To the shop' : 'Naar de shop'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
