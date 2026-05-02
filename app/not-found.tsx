import Link from 'next/link';

export const metadata = {
  title: '404 — Pagina niet gevonden',
};

/**
 * Minimal global 404 fallback. The richer, locale-aware 404 lives at
 * app/[locale]/not-found.tsx (with shop header/footer). Admin routes
 * use app/admin/not-found.tsx. This file only fires for the rare
 * case where a request bypasses both the i18n middleware and the
 * /admin segment.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 bg-stone-50">
      <div className="text-center max-w-sm">
        <p className="font-mono text-5xl font-bold text-(--color-brand-yellow) tracking-[-0.04em] mb-4">
          404
        </p>
        <h1 className="text-xl font-bold tracking-[-0.025em] mb-2">Pagina niet gevonden</h1>
        <Link
          href="/"
          className="mt-4 inline-flex items-center justify-center h-11 px-5 rounded-xl bg-(--color-brand-black) text-white text-sm font-semibold hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black) transition-colors"
        >
          Terug naar home
        </Link>
      </div>
    </div>
  );
}
