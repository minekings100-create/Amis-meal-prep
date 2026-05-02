'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to monitoring (Sentry/etc) once that's wired up.
    console.error('[error.tsx]', error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== 'production';

  return (
    <div className="relative min-h-[80vh] grid place-items-center px-6 py-16 overflow-hidden bg-stone-50">
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[640px] w-[640px] rounded-full bg-amber-100/60 blur-2xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[440px] w-[440px] rounded-full border border-amber-200/60 pointer-events-none"
      />

      <div className="relative z-10 text-center max-w-md">
        <p className="font-mono text-6xl md:text-8xl font-bold text-amber-700 tracking-[-0.04em] leading-none mb-6">
          500
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] mb-2">
          Er ging iets mis aan onze kant
        </h1>
        <p className="text-stone-600 mb-8 max-w-sm mx-auto">
          We hebben de fout geregistreerd. Probeer het opnieuw of ga terug naar de homepage.
        </p>
        {isDev && (
          <pre className="text-left mb-6 rounded-md bg-stone-900 text-stone-100 p-3 text-[11px] font-mono overflow-x-auto max-h-40 overflow-y-auto">
            {error.message}
            {error.digest && `\n\nDigest: ${error.digest}`}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl bg-(--color-brand-black) text-white text-sm font-semibold hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black) transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Probeer opnieuw
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-2xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50 transition-colors"
          >
            <Home className="h-4 w-4" />
            Naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
