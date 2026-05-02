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
    <aside className="rounded-2xl border border-stone-200 bg-gradient-to-br from-(--color-accent-bright)/8 to-white p-6 md:p-8 mb-8 md:mb-10 relative overflow-hidden">
      {/* Decorative plate-circle on the right (subtle) */}
      <div
        aria-hidden
        className="hidden md:block absolute -right-12 top-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-(--color-accent)/10 ring-8 ring-(--color-accent-bright)/15 pointer-events-none"
      />
      <div
        aria-hidden
        className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 h-28 w-28 rounded-full bg-(--color-accent-bright)/30 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
        <div className="md:flex-[3] min-w-0">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-(--color-accent) mb-2">
            <Sparkles className="h-3 w-3" />
            {c.eyebrow}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] text-stone-900">
            {c.title}
          </h2>
          <p className="mt-2 text-sm md:text-base text-stone-600 leading-relaxed max-w-xl">
            {c.body}
          </p>
        </div>

        <div className="md:flex-[1] md:max-w-[220px] md:text-right">
          <Link
            href="/shop"
            onClick={handleClick}
            className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-(--color-accent) text-white font-semibold text-sm hover:bg-(--color-accent)/90 active:scale-[0.99] transition-all w-full md:w-auto shadow-[0_8px_24px_-8px_rgba(74,138,60,0.5)]"
          >
            {pending ? '…' : c.cta}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-stone-500">{c.note}</p>
        </div>
      </div>
    </aside>
  );
}
