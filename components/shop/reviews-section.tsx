import { useTranslations } from 'next-intl';
import { Star } from 'lucide-react';
import type { Review } from '@/types/database';

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const t = useTranslations('product');

  if (reviews.length === 0) {
    return (
      <section className="py-12 border-t border-(--color-line)">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
          Productervaringen
        </p>
        <h2 className="text-2xl md:text-3xl tracking-[-0.025em] font-semibold mb-4">
          {t('reviews')}
        </h2>
        <p className="text-(--color-ink-soft) text-sm">Nog geen reviews voor deze maaltijd.</p>
      </section>
    );
  }

  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section className="py-12 border-t border-(--color-line)">
      <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-2">
            Productervaringen
          </p>
          <h2 className="text-2xl md:text-3xl tracking-[-0.025em] font-semibold">{t('reviews')}</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex" aria-label={`${avg.toFixed(1)} / 5`}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                className={
                  'h-4 w-4 ' +
                  (n <= Math.round(avg)
                    ? 'fill-(--color-brand-yellow-bright) text-(--color-brand-yellow-bright)'
                    : 'text-(--color-line)')
                }
              />
            ))}
          </div>
          <span className="font-mono text-sm tabular-nums">
            {avg.toFixed(1)} <span className="text-(--color-gray)">/ {reviews.length}</span>
          </span>
        </div>
      </div>
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        {reviews.map((r) => (
          <li
            key={r.id}
            className="rounded-2xl bg-stone-50 border border-stone-200/60 p-5 md:p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={
                    'h-3.5 w-3.5 ' +
                    (n <= r.rating
                      ? 'fill-(--color-brand-yellow-bright) text-(--color-brand-yellow-bright)'
                      : 'text-(--color-line)')
                  }
                />
              ))}
              <span className="text-xs font-mono text-(--color-gray) ml-1">
                {new Date(r.created_at).toLocaleDateString('nl-NL', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
            {r.title && <h3 className="font-semibold mb-1 text-stone-900">{r.title}</h3>}
            {r.body && (
              <p className="text-sm text-(--color-ink-soft) leading-relaxed">{r.body}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
