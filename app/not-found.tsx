import Link from 'next/link';
import { ArrowRight, ShoppingBag } from 'lucide-react';

export const metadata = {
  title: '404 — Pagina niet gevonden',
};

export default function NotFound() {
  return (
    <div className="relative min-h-[80vh] grid place-items-center px-6 py-16 overflow-hidden bg-stone-50">
      {/* Decorative plate-circle behind content */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[640px] w-[640px] rounded-full bg-(--color-accent-bright)/10 blur-2xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[440px] w-[440px] rounded-full border border-(--color-accent-bright)/20 pointer-events-none"
      />

      <div className="relative z-10 text-center max-w-md">
        <p className="font-mono text-7xl md:text-9xl font-bold text-(--color-accent) tracking-[-0.04em] leading-none mb-6">
          404
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] mb-2">
          Deze pagina bestaat niet
        </h1>
        <p className="text-stone-600 mb-8 max-w-sm mx-auto">
          Misschien is hij verhuisd, hernoemd of nooit bestaan. Geen zorg — onze maaltijden staan
          gewoon op je te wachten.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            Terug naar home
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-(--color-accent) text-white text-sm font-semibold hover:bg-(--color-accent)/90 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Naar shop
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
