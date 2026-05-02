'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Link } from '@/lib/i18n/navigation';
import { useState } from 'react';
import { toast } from '@/lib/toast/store';

const COPY = {
  nl: {
    eyebrow: 'BUILD-YOUR-OWN',
    title: 'Stel je eigen AMIS pakket samen',
    body:
      'Kies zelf welke maaltijden je in jouw weekpakket wil. Vanaf 7 maaltijden, met korting bij grotere pakketten.',
    cta: 'Begin je pakket',
    note: 'Vanaf 5% korting · vanaf €9,95 per maaltijd',
    soon: 'Binnenkort beschikbaar — we werken aan de samensteller.',
  },
  en: {
    eyebrow: 'BUILD-YOUR-OWN',
    title: 'Create your own AMIS bundle',
    body:
      'Pick the meals you want in your weekly box. Starting at 7 meals, with discount on larger bundles.',
    cta: 'Start your bundle',
    note: 'From 5% discount · from €9.95 per meal',
    soon: 'Coming soon — we are building the bundle composer.',
  },
} as const;

// TODO: build the /shop/build composer route. Until then, the CTA shows a
// "binnenkort" toast and stays on /shop.
const BUILDER_ROUTE_AVAILABLE = false;

export function BuildYourOwnBanner() {
  const locale = useLocale() as 'nl' | 'en';
  const [pending, setPending] = useState(false);
  const c = COPY[locale] ?? COPY.nl;

  function handleClick(e: React.MouseEvent) {
    if (BUILDER_ROUTE_AVAILABLE) return; // let Link navigate
    e.preventDefault();
    if (pending) return;
    setPending(true);
    toast(c.soon);
    setTimeout(() => setPending(false), 1200);
  }

  return (
    <aside className="rounded-2xl bg-(--color-brand-black) text-white p-5 md:p-8 mb-6 md:mb-10 relative overflow-hidden">
      {/* Decorative plate-circle on the right — subtle on mobile, full on desktop */}
      <div
        aria-hidden
        className="absolute -right-10 md:-right-12 top-1/2 -translate-y-1/2 h-32 md:h-44 w-32 md:w-44 rounded-full bg-(--color-brand-yellow)/15 blur-2xl pointer-events-none"
      />
      <div
        aria-hidden
        className="hidden md:block absolute right-6 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full border-2 border-(--color-brand-yellow)/25 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
        <div className="md:flex-[3] min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-(--color-brand-yellow) mb-2">
            <Sparkles className="h-3 w-3" />
            {c.eyebrow}
          </div>
          <h2 className="text-xl md:text-3xl font-bold tracking-[-0.025em] text-white leading-tight">
            {c.title}
          </h2>
          <p className="mt-2 text-sm md:text-base text-white/80 leading-relaxed max-w-xl">
            {c.body}
          </p>
        </div>

        <div className="md:flex-[1] md:max-w-[220px] md:text-right">
          <Link
            href="/shop"
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-(--color-brand-yellow) text-(--color-brand-black) font-semibold text-sm hover:bg-white hover:text-(--color-brand-black) transition-colors duration-[250ms] w-full md:w-auto"
          >
            {pending ? '…' : c.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-white/60 text-center md:text-right">{c.note}</p>
        </div>
      </div>
    </aside>
  );
}
