import Link from 'next/link';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getReviewsListing, type ReviewsTab } from '@/lib/admin/reviews';
import { ReviewsList } from '@/components/admin/reviews/reviews-list';
import { cn } from '@/lib/utils/cn';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Reviews' };

const TABS: Array<{ key: ReviewsTab; label: string }> = [
  { key: 'pending', label: 'Te modereren' },
  { key: 'published', label: 'Gepubliceerd' },
  { key: 'deleted', label: 'Verwijderd' },
];

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await checkAdminAccess('staff');
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const tabRaw = (get('tab') ?? 'pending') as ReviewsTab;
  const tab: ReviewsTab = ['pending', 'published', 'deleted'].includes(tabRaw) ? tabRaw : 'pending';
  const ratingRaw = parseInt(get('rating') ?? '0', 10);
  const rating = ratingRaw >= 1 && ratingRaw <= 5 ? ratingRaw : undefined;

  const listing = await getReviewsListing({
    tab,
    rating,
    productId: get('product'),
  });

  function tabHref(t: ReviewsTab): string {
    const next = new URLSearchParams();
    if (t !== 'pending') next.set('tab', t);
    Object.entries(sp).forEach(([k, v]) => {
      if (k === 'tab') return;
      if (typeof v === 'string') next.set(k, v);
    });
    const qs = next.toString();
    return `/admin/reviews${qs ? `?${qs}` : ''}`;
  }

  function ratingHref(r: number | null): string {
    const next = new URLSearchParams();
    Object.entries(sp).forEach(([k, v]) => {
      if (k === 'rating') return;
      if (typeof v === 'string') next.set(k, v);
    });
    if (r) next.set('rating', String(r));
    const qs = next.toString();
    return `/admin/reviews${qs ? `?${qs}` : ''}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.025em]">Reviews</h1>
            <p className="text-stone-600 mt-1 text-sm">
              {listing.rows.length} zichtbaar
              {listing.isMocked && (
                <span className="text-amber-700 ml-2">(demo data — Supabase niet verbonden)</span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-1 border-b border-stone-200 -mb-px mt-6 overflow-x-auto">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Link
                key={t.key}
                href={tabHref(t.key)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2',
                  active
                    ? 'text-stone-900 border-[--color-accent]'
                    : 'text-stone-500 border-transparent hover:text-stone-900',
                )}
              >
                {t.label}
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-mono tabular-nums',
                    active ? 'bg-[--color-accent-bright]/20 text-[--color-accent]' : 'bg-stone-100 text-stone-600',
                  )}
                >
                  {listing.counts[t.key]}
                </span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Filter row */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href={ratingHref(null)}
          className={cn(
            'h-8 px-3 inline-flex items-center rounded-md border text-xs font-medium',
            rating === undefined
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50',
          )}
        >
          Alle ratings
        </Link>
        {[5, 4, 3, 2, 1].map((r) => (
          <Link
            key={r}
            href={ratingHref(r)}
            className={cn(
              'h-8 px-3 inline-flex items-center gap-1 rounded-md border text-xs font-medium',
              rating === r
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50',
            )}
          >
            {r}★
          </Link>
        ))}
      </div>

      <ReviewsList rows={listing.rows} tab={tab} />
    </div>
  );
}
