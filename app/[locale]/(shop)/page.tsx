import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { ProductCard } from '@/components/shop/product-card';
import { RevealSection } from '@/components/layout/reveal-section';
import { HeroParallaxImage } from '@/components/layout/hero-parallax-image';
import { CountUp } from '@/components/layout/count-up';
import { listProducts } from '@/lib/data/products';
import { AmisStandard } from '@/components/home/amis-standard';
import type { Locale } from '@/lib/i18n/config';

// Two hero photos — the server picks one randomly per request, so the homepage
// feels alive without animating bouncy carousels. Both are food shots in landscape
// crop with breathing room on the right (subject right-of-center) so the dark
// left-overlay carries the text without obscuring the dish.
const HERO_PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=2400&h=1350&q=85',
    altKey: 'food-bowl',
  },
  {
    src: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=2400&h=1350&q=85',
    altKey: 'salmon',
  },
] as const;

function pickHeroPhoto() {
  return HERO_PHOTOS[Math.floor(Math.random() * HERO_PHOTOS.length)];
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const featured = await listProducts({ featuredOnly: true, type: 'meal' });

  const heroPhoto = pickHeroPhoto();
  const heroAlt =
    locale === 'en'
      ? 'AMIS meal — high-protein, freshly cooked'
      : 'AMIS maaltijd — vers bereid, hoog eiwit';

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AMIS Meals',
    url: process.env.NEXT_PUBLIC_APP_URL ?? 'https://amismeals.nl',
    logo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://amismeals.nl'}/icon.png`,
    description: 'Vers bereide hoog-eiwit maaltijden vanuit Maastricht.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Maastricht',
      addressCountry: 'NL',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hallo@amismeals.nl',
      availableLanguage: ['nl', 'en'],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      {/* HERO — full-screen photo with text overlay + stats overlay at bottom */}
      <section className="relative w-full min-h-[88vh] md:min-h-screen flex flex-col overflow-hidden bg-stone-900">
        {/* Photo with subtle parallax (desktop only) */}
        <HeroParallaxImage src={heroPhoto.src} alt={heroAlt} />
        {/* Left-darker → right-lighter overlay so text on left stays readable */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r from-stone-950/75 via-stone-950/45 to-stone-950/10"
        />
        {/* Top gradient under floating nav for nav-icon contrast */}
        <div
          aria-hidden
          className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-stone-950/40 to-transparent pointer-events-none"
        />
        {/* Bottom gradient — fades to near-black so the stats overlay reads clearly */}
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-stone-950/70 to-transparent pointer-events-none"
        />

        {/* Text overlay — vertically centered with subtle upward bias to make room for stats */}
        <div className="relative z-10 flex-1 flex items-center w-full">
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-32 md:pb-40 lg:translate-y-[-24px]">
            <div className="max-w-2xl">
              <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-white/80 font-medium mb-6">
                {t('hero.eyebrow')}
              </p>
              <h1 className="font-sans text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-bold text-white leading-[0.95] tracking-[-0.035em] mb-6">
                {t.rich('hero.title', {
                  em: (chunks) => (
                    <span className="relative inline-block not-italic">
                      {chunks}
                      <span
                        aria-hidden
                        className="absolute -bottom-1 left-0 right-0 h-[6px] bg-(--color-brand-yellow-bright)"
                      />
                    </span>
                  ),
                })}
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-md mb-10 leading-relaxed">
                {t('hero.subtitle')}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-(--color-brand-yellow-bright) px-7 h-12 font-semibold text-stone-900 transition-all duration-200 hover:bg-white hover:gap-3 active:scale-95"
                >
                  {t('hero.ctaShop')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/over-ons"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/5 backdrop-blur px-7 h-12 font-semibold text-white transition-all duration-200 hover:bg-white hover:text-stone-900 active:scale-95"
                >
                  {t('hero.ctaHowItWorks')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* STATS overlay — glass band at the bottom of the hero, full-bleed */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/20">
          <dl className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-white/15">
            <HeroStat label={t('stats.proteinLabel')}>
              <CountUp end={42} suffix="g" />
            </HeroStat>
            <HeroStat label={t('stats.scoreLabel')}>
              <CountUp end={9.2} decimals={1} suffix="/10" />
            </HeroStat>
            <HeroStat label={t('stats.deliveryLabel')}>
              <span>{t('stats.deliveryValue')}</span>
            </HeroStat>
            <HeroStat label={t('stats.mealsLabel')}>
              <CountUp end={150} suffix="k+" />
            </HeroStat>
          </dl>
        </div>
      </section>

      {/* HOT MENU — quick teaser, intentionally subtler than a hero moment */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-16">
        <RevealSection>
          <div className="mb-8 md:mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500 mb-2">
              {t('menu.subtitle')}
            </p>
            <h2 className="text-2xl md:text-3xl tracking-[-0.025em] font-semibold">
              {t('menu.title')}
            </h2>
          </div>
        </RevealSection>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {featured.slice(0, 3).map((p, i) => (
            <RevealSection key={p.id} delay={i * 0.1}>
              <ProductCard product={p} />
            </RevealSection>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm text-stone-700 hover:text-(--color-brand-yellow) transition-colors font-medium underline-offset-4 hover:underline"
          >
            {t('menu.viewAll')} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* AMIS STANDARD — MegaFit-style values band */}
      <AmisStandard />

      {/* TESTIMONIALS */}
      <section className="bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
          <RevealSection>
            <div className="mb-10">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-(--color-brand-yellow-bright) mb-2">
                Stemmen uit de community
              </p>
              <h2 className="text-2xl md:text-3xl tracking-[-0.025em] font-semibold text-white">
                {t('testimonials.title')}
              </h2>
            </div>
          </RevealSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {[
              {
                quote:
                  'Eindelijk meal prep die niet smaakt naar maaltijdvervangers. Mijn lifts gaan omhoog en ik hoef niet meer te koken op trainingsdagen.',
                name: 'Sander',
                role: 'Bezig met cut',
              },
              {
                quote:
                  'De Korean Beef Bowl is m’n favoriet. Macros kloppen, smaak klopt, prijs eerlijk.',
                name: 'Joëlle',
                role: 'CrossFit',
              },
              {
                quote:
                  'Ik bestel al sinds week 1. Lokale bezorging in Maastricht is super clean — donderdag op de mat.',
                name: 'Tijn',
                role: 'Hardloper',
              },
            ].map((q, i) => (
              <RevealSection key={i} delay={i * 0.08}>
                <figure className="relative h-full rounded-2xl bg-white/[0.04] border border-white/10 p-6 md:p-7">
                  <span
                    aria-hidden
                    className="absolute top-4 right-5 text-5xl leading-none text-(--color-brand-yellow-bright)/40 font-serif"
                  >
                    &ldquo;
                  </span>
                  <blockquote className="text-base md:text-lg leading-relaxed text-white/90">
                    {q.quote}
                  </blockquote>
                  <figcaption className="mt-6 pt-4 border-t border-white/10 flex items-center gap-3 text-sm">
                    <span className="font-medium text-white">{q.name}</span>
                    <span className="text-white/30">·</span>
                    <span className="text-white/60">{q.role}</span>
                  </figcaption>
                </figure>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function HeroStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 flex flex-col items-start justify-center px-5 sm:px-6 lg:px-8 py-5 md:py-6">
      <dt className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.22em] text-white/70 order-2 mt-1 truncate max-w-full">
        {label}
      </dt>
      <dd className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white leading-tight order-1">
        {children}
      </dd>
    </div>
  );
}
