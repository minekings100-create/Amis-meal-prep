import { ArrowRight, ShoppingBag, MessageCircle, HelpCircle, Home } from 'lucide-react';
import { getLocale } from 'next-intl/server';
import { Link } from '@/lib/i18n/navigation';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { getCurrentCustomer } from '@/lib/account/auth';
import { isLocale } from '@/lib/i18n/config';

export const metadata = {
  title: '404 — Pagina niet gevonden',
};

export default async function LocaleNotFound() {
  let isEN = false;
  try {
    const rawLocale = await getLocale();
    isEN = isLocale(rawLocale) && rawLocale === 'en';
  } catch {
    isEN = false;
  }
  const customer = await getCurrentCustomer().catch(() => null);

  return (
    <>
      <Header isAuthed={Boolean(customer)} />
      <main className="flex-1">
        <div className="relative min-h-[80vh] grid place-items-center px-6 py-16 overflow-hidden bg-white">
          {/* Decorative plate-circle — subtle yellow tint */}
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[640px] w-[640px] rounded-full bg-(--color-brand-yellow)/10 blur-2xl pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[440px] w-[440px] rounded-full border-2 border-(--color-brand-yellow)/25 pointer-events-none"
          />

          <div className="relative z-10 text-center max-w-lg">
            <p className="font-mono text-[10rem] md:text-[14rem] font-bold text-(--color-brand-yellow) tracking-[-0.04em] leading-none mb-2">
              404
            </p>
            <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em] mb-3 text-stone-900">
              {isEN ? "This page doesn't exist" : 'Deze pagina bestaat niet'}
            </h1>
            <p className="text-stone-600 mb-8 max-w-sm mx-auto">
              {isEN
                ? 'Maybe it moved, was renamed, or never existed. No worries — our meals are still waiting for you.'
                : 'Misschien is hij verhuisd, hernoemd of nooit bestaan. Geen zorg — onze maaltijden staan gewoon op je te wachten.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black) transition-colors duration-[250ms]"
              >
                <Home className="h-4 w-4" />
                {isEN ? 'Back home' : 'Terug naar home'}
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-full bg-(--color-brand-yellow) text-(--color-brand-black) text-sm font-semibold hover:bg-(--color-brand-black) hover:text-white transition-colors duration-[250ms]"
              >
                <ShoppingBag className="h-4 w-4" />
                {isEN ? 'To the shop' : 'Naar shop'}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="flex items-center gap-2 justify-center text-xs text-stone-500">
              <span>{isEN ? 'Or try:' : 'Of probeer:'}</span>
              <Link
                href="/faq"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-stone-200 bg-white hover:border-stone-900 hover:text-stone-900 transition-colors"
              >
                <HelpCircle className="h-3 w-3" /> FAQ
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-stone-200 bg-white hover:border-stone-900 hover:text-stone-900 transition-colors"
              >
                <MessageCircle className="h-3 w-3" /> Contact
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
