import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight, Leaf, ChefHat, Truck, Activity } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/product-card';
import { listProducts, listAthletes } from '@/lib/data/products';
import type { Locale } from '@/lib/i18n/config';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('home');
  const [featured, athletes] = await Promise.all([
    listProducts({ featuredOnly: true, type: 'meal' }),
    listAthletes(),
  ]);

  const standardItems = ['fresh', 'macros', 'quality', 'delivery'] as const;
  const standardIcons = {
    fresh: Leaf,
    macros: Activity,
    quality: ChefHat,
    delivery: Truck,
  } as const;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[--color-ink] text-white grain">
        <div
          aria-hidden
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(124,194,79,0.25), transparent 50%), radial-gradient(circle at 80% 80%, rgba(74,138,60,0.35), transparent 60%)',
          }}
        />
        <div className="container-amis relative grid lg:grid-cols-2 gap-12 lg:gap-16 py-20 lg:py-28 items-center">
          <div className="relative z-10">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent-bright] mb-6">
              {t('hero.eyebrow')}
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl leading-[0.95] font-bold tracking-[-0.04em] max-w-[14ch]">
              {t('hero.title')}
            </h1>
            <p className="mt-6 text-base md:text-lg text-white/70 max-w-md leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/shop">
                  {t('hero.ctaShop')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                <Link href="/shop/amis-kennismakingspakket">{t('hero.ctaTryout')}</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-square w-full max-w-[560px] mx-auto">
            {/* Plate visual */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(124,194,79,0.4),transparent_60%)]" />
            <div className="absolute inset-6 rounded-full bg-white/5 ring-1 ring-white/10 backdrop-blur-sm" />
            <div className="absolute inset-12 rounded-full overflow-hidden ring-1 ring-white/15">
              <Image
                src="https://placehold.co/800x800/4a8a3c/ffffff/png?text=Signature+Plate"
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 560px, 80vw"
                className="object-cover"
              />
            </div>
            {/* Macro chips */}
            <div className="absolute -left-4 top-1/4 hidden md:block bg-white text-[--color-ink] rounded-full px-4 py-2 shadow-[var(--shadow-glow)]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[--color-gray]">protein</p>
              <p className="font-mono font-semibold">42g</p>
            </div>
            <div className="absolute -right-4 bottom-1/4 hidden md:block bg-white text-[--color-ink] rounded-full px-4 py-2 shadow-[var(--shadow-glow)]">
              <p className="text-[10px] uppercase tracking-[0.16em] text-[--color-gray]">kcal</p>
              <p className="font-mono font-semibold">580</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOT MENU */}
      <section className="container-amis py-20 md:py-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">
              {t('menu.subtitle')}
            </p>
            <h2 className="text-3xl md:text-4xl tracking-[-0.03em]">{t('menu.title')}</h2>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-sm text-[--color-ink] hover:text-[--color-accent] transition-colors"
          >
            {t('menu.viewAll')} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* AMIS STANDARD */}
      <section className="bg-[--color-bg-soft] border-y border-[--color-line]">
        <div className="container-amis py-20 md:py-28">
          <div className="text-center mb-16">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">
              {t('standard.subtitle')}
            </p>
            <h2 className="text-3xl md:text-4xl tracking-[-0.03em] max-w-2xl mx-auto">
              {t('standard.title')}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-[--color-line] border border-[--color-line] rounded-[--radius]">
            {standardItems.map((key) => {
              const Icon = standardIcons[key];
              return (
                <div key={key} className="bg-white p-8 first:rounded-tl-[--radius] last:rounded-br-[--radius]">
                  <div className="h-10 w-10 rounded-full bg-[--color-accent-bright]/15 inline-flex items-center justify-center text-[--color-accent] mb-5">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-semibold mb-2">{t(`standard.items.${key}.title`)}</h3>
                  <p className="text-sm text-[--color-ink-soft] leading-relaxed">
                    {t(`standard.items.${key}.body`)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ATHLETES */}
      {athletes.length > 0 && (
        <section className="container-amis py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.24em] text-[--color-accent] mb-3">
                {t('athletes.subtitle')}
              </p>
              <h2 className="text-3xl md:text-4xl tracking-[-0.03em]">{t('athletes.title')}</h2>
            </div>
            <Link
              href="/atleten"
              className="inline-flex items-center gap-1 text-sm text-[--color-ink] hover:text-[--color-accent] transition-colors"
            >
              {t('athletes.viewAll')} <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {athletes.slice(0, 3).map((a) => (
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
                    <h3 className="text-2xl font-semibold mt-1 tracking-[-0.02em]">{a.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* TESTIMONIALS */}
      <section className="bg-[--color-ink] text-white">
        <div className="container-amis py-20 md:py-28">
          <h2 className="text-3xl md:text-4xl tracking-[-0.03em] mb-12 text-white">
            {t('testimonials.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
              <figure key={i} className="border-t border-white/15 pt-6">
                <blockquote className="text-lg leading-relaxed text-white/90">
                  &ldquo;{q.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 text-sm">
                  <span className="font-medium text-white">{q.name}</span>
                  <span className="text-white/40">·</span>
                  <span className="text-white/60">{q.role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
