import { setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import type { Locale } from '@/lib/i18n/config';

export const metadata = { title: 'Inloggen' };

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const next = typeof sp.next === 'string' ? sp.next : '';
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const adminTarget = next.startsWith('/admin');

  return (
    <div className="max-w-md mx-auto px-6 py-16 md:py-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 mb-3">
        {adminTarget ? 'Admin' : 'Account'}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em] mb-3">
        {locale === 'en' ? 'Sign in' : 'Inloggen'}
      </h1>
      <p className="text-stone-600 leading-relaxed mb-8">
        {locale === 'en'
          ? 'Enter your email to receive a magic link.'
          : 'Voer je e-mailadres in om een magic link te ontvangen.'}
      </p>

      {!hasSupabase ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm font-semibold text-amber-900 mb-2">Dev mode — Supabase nog niet gekoppeld</p>
          <p className="text-sm text-amber-900/85 mb-4">
            Inlog werkt zodra je <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> en{' '}
            <code className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> hebt geconfigureerd.
          </p>
          {adminTarget && (
            <div className="border-t border-amber-200 pt-4 space-y-2">
              <p className="text-xs uppercase tracking-widest font-semibold text-amber-900">
                Admin shortcuts (alleen dev)
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/admin?as=owner"
                  className="inline-flex items-center px-3 h-8 rounded-full bg-amber-900 text-white text-xs font-semibold hover:bg-amber-800 transition-colors"
                >
                  Inloggen als owner
                </Link>
                <Link
                  href="/admin?as=staff"
                  className="inline-flex items-center px-3 h-8 rounded-full bg-stone-700 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                >
                  Inloggen als staff
                </Link>
                <Link
                  href="/admin?as=customer"
                  className="inline-flex items-center px-3 h-8 rounded-full bg-stone-200 text-stone-800 text-xs font-semibold hover:bg-stone-300 transition-colors"
                >
                  Inloggen als customer (403)
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <form className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            className="w-full h-11 rounded-md border border-stone-300 px-4 text-sm focus:outline-none focus:border-(--color-accent)"
          />
          <button
            type="submit"
            disabled
            className="w-full h-11 rounded-full bg-(--color-accent-bright) text-stone-900 font-semibold disabled:opacity-50"
          >
            Stuur magic link (Phase 2)
          </button>
        </form>
      )}
    </div>
  );
}
