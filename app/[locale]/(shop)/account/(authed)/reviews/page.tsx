import { Star } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireCustomer } from '@/lib/account/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils/cn';

export const metadata = { title: 'Reviews' };
export const dynamic = 'force-dynamic';

interface CustomerReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  productName: string;
  productSlug: string;
  createdAt: string;
  isPublished: boolean;
  isDeleted: boolean;
}

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

async function listReviews(userId: string): Promise<CustomerReview[]> {
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (!hasSupabase) {
    const now = Date.now();
    const day = 1000 * 60 * 60 * 24;
    return [
      { id: 'r1', rating: 5, title: 'Topkwaliteit!', body: 'Lekker pittig en macros kloppen perfect. Past in mijn cut.', productName: 'Kip Teriyaki Bowl', productSlug: 'kip-teriyaki', createdAt: new Date(now - 8 * day).toISOString(), isPublished: true, isDeleted: false },
      { id: 'r2', rating: 4, title: 'Goed pakket', body: 'Genoeg variatie en alle maaltijden zijn gezond. Soms wat te veel saus.', productName: 'Cut Pakket — 7 maaltijden', productSlug: 'cut-pakket-7', createdAt: new Date(now - 22 * day).toISOString(), isPublished: true, isDeleted: false },
    ];
  }
  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('reviews')
    .select('id,rating,title,body,is_published,is_deleted,created_at,product_id,products(name_nl,slug)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  type Row = {
    id: string;
    rating: number;
    title: string | null;
    body: string | null;
    is_published: boolean;
    is_deleted: boolean;
    created_at: string;
    products: { name_nl: string; slug: string } | { name_nl: string; slug: string }[] | null;
  };
  return ((data as unknown as Row[]) ?? []).map((r) => {
    const prod = Array.isArray(r.products) ? r.products[0] ?? null : r.products;
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      productName: prod?.name_nl ?? '—',
      productSlug: prod?.slug ?? '',
      createdAt: r.created_at,
      isPublished: r.is_published,
      isDeleted: r.is_deleted,
    };
  });
}

export default async function CustomerReviewsPage() {
  const customer = await requireCustomer('/account/reviews');
  const reviews = await listReviews(customer.userId);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em]">Reviews</h1>
        <p className="text-stone-600 mt-1 text-sm">Reviews die je hebt geplaatst.</p>
      </header>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <Star className="h-7 w-7 text-stone-400 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-stone-500">Je hebt nog geen reviews geplaatst.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl bg-white border border-stone-200 dark:bg-(--color-bg-elevated) dark:border-(--color-border) p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Stars rating={r.rating} />
                    <span className="text-xs font-mono text-stone-500">
                      {dateFmt.format(new Date(r.createdAt))}
                    </span>
                  </div>
                  {r.title && <h3 className="font-semibold text-stone-900">{r.title}</h3>}
                </div>
                <ReviewStatus isPublished={r.isPublished} isDeleted={r.isDeleted} />
              </div>
              {r.body && <p className="text-sm text-stone-700 mt-1.5">{r.body}</p>}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100 text-xs">
                <Link
                  href={`/shop/${r.productSlug}`}
                  className="text-stone-600 hover:text-(--color-brand-yellow) transition-colors"
                >
                  Op {r.productName} →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="inline-flex">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            'h-3.5 w-3.5',
            n <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200',
          )}
        />
      ))}
    </div>
  );
}

function ReviewStatus({ isPublished, isDeleted }: { isPublished: boolean; isDeleted: boolean }) {
  if (isDeleted) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-stone-100 text-stone-500 border-stone-200">
        Verwijderd
      </span>
    );
  }
  if (isPublished) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) border-(--color-brand-yellow-bright)/30">
        Gepubliceerd
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-amber-100 text-amber-800 border-amber-200">
      In review
    </span>
  );
}
