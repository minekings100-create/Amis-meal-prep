import { createServiceRoleClient } from '@/lib/supabase/server';

export type ReviewsTab = 'pending' | 'published' | 'deleted';

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  customerName: string;
  customerEmail: string;
  isVerifiedPurchase: boolean;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug: string;
  createdAt: string;
  isPublished: boolean;
  isDeleted: boolean;
  deletedReason: string | null;
}

export interface ReviewsListing {
  rows: AdminReview[];
  counts: { pending: number; published: number; deleted: number };
  isMocked: boolean;
}

export interface ReviewsListParams {
  tab: ReviewsTab;
  rating?: number;
  productId?: string;
  dateFrom?: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getReviewsListing(params: ReviewsListParams): Promise<ReviewsListing> {
  if (!isSupabaseConfigured()) return mockedListing(params);

  const sb = createServiceRoleClient();
  const [pendingRes, publishedRes, deletedRes] = await Promise.all([
    sb.from('reviews').select('id', { count: 'exact', head: true }).eq('is_published', false).eq('is_deleted', false),
    sb.from('reviews').select('id', { count: 'exact', head: true }).eq('is_published', true).eq('is_deleted', false),
    sb.from('reviews').select('id', { count: 'exact', head: true }).eq('is_deleted', true),
  ]);

  let q = sb
    .from('reviews')
    .select(
      'id,rating,title,body,is_published,is_deleted,deleted_reason,created_at,order_id,user_id,product_id,products(name_nl,image_url,slug),profiles(first_name,last_name,email)',
    )
    .order('created_at', { ascending: false })
    .limit(200);

  if (params.tab === 'pending') q = q.eq('is_published', false).eq('is_deleted', false);
  else if (params.tab === 'published') q = q.eq('is_published', true).eq('is_deleted', false);
  else q = q.eq('is_deleted', true);

  if (params.rating) q = q.eq('rating', params.rating);
  if (params.productId) q = q.eq('product_id', params.productId);
  if (params.dateFrom) q = q.gte('created_at', params.dateFrom);

  const { data } = await q;

  const rows: AdminReview[] = (data ?? []).map((r) => {
    const product = (r as { products: { name_nl: string; image_url: string | null; slug: string } | null }).products;
    const profile = (r as { profiles: { first_name: string | null; last_name: string | null; email: string } | null }).profiles;
    return {
      id: r.id,
      rating: r.rating,
      title: r.title,
      body: r.body,
      customerName: profile
        ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email
        : '—',
      customerEmail: profile?.email ?? '',
      isVerifiedPurchase: !!r.order_id,
      productId: r.product_id,
      productName: product?.name_nl ?? '—',
      productImage: product?.image_url ?? null,
      productSlug: product?.slug ?? '',
      createdAt: r.created_at,
      isPublished: r.is_published,
      isDeleted: r.is_deleted,
      deletedReason: r.deleted_reason,
    };
  });

  return {
    rows,
    counts: {
      pending: pendingRes.count ?? 0,
      published: publishedRes.count ?? 0,
      deleted: deletedRes.count ?? 0,
    },
    isMocked: false,
  };
}

function mockedListing(params: ReviewsListParams): ReviewsListing {
  const baseImg = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop';
  const all: AdminReview[] = [
    { id: 'r1', rating: 5, title: 'Top maaltijden!', body: 'Eerlijke macro\'s, smaak op punt, geen meal-vervanger glibber. Bestel zeker weer.', customerName: 'Sanne van Loon', customerEmail: 'sanne@example.com', isVerifiedPurchase: true, productId: 'p1', productName: 'Kip Teriyaki Bowl', productImage: baseImg, productSlug: 'kip-teriyaki', createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), isPublished: false, isDeleted: false, deletedReason: null },
    { id: 'r2', rating: 5, title: 'Beste meal prep in Maastricht', body: 'Lokale bezorging op tijd, doosjes hermetisch dicht, smaak echt vers.', customerName: 'Mike Janssen', customerEmail: 'mike@example.com', isVerifiedPurchase: true, productId: 'p4', productName: 'Cut Pakket — 7 maaltijden', productImage: baseImg, productSlug: 'cut-pakket-7', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), isPublished: false, isDeleted: false, deletedReason: null },
    { id: 'r3', rating: 4, title: 'Lekker maar wat aan de droge kant', body: 'De zalm was iets te lang gegrild voor mijn gevoel. Verder prima.', customerName: 'Lotte Hendriks', customerEmail: 'lotte@example.com', isVerifiedPurchase: true, productId: 'p2', productName: 'Zalm met Quinoa', productImage: baseImg, productSlug: 'zalm-quinoa', createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), isPublished: false, isDeleted: false, deletedReason: null },
    { id: 'r4', rating: 2, title: 'Tegenvallend', body: 'Verwacht meer voor de prijs.', customerName: 'Anoniem', customerEmail: 'anon@example.com', isVerifiedPurchase: false, productId: 'p1', productName: 'Kip Teriyaki Bowl', productImage: baseImg, productSlug: 'kip-teriyaki', createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(), isPublished: false, isDeleted: false, deletedReason: null },
    { id: 'r5', rating: 5, title: 'Past perfect in m\'n cut', body: 'Macros kloppen, smaak top, meal prep zonder gedoe. Aanrader.', customerName: 'Daan Smit', customerEmail: 'daan@example.com', isVerifiedPurchase: true, productId: 'p4', productName: 'Cut Pakket — 7 maaltijden', productImage: baseImg, productSlug: 'cut-pakket-7', createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), isPublished: true, isDeleted: false, deletedReason: null },
    { id: 'r6', rating: 4, title: 'Goed', body: 'Solide maaltijd, mag iets pittiger wat mij betreft.', customerName: 'Eva Bos', customerEmail: 'eva@example.com', isVerifiedPurchase: true, productId: 'p1', productName: 'Kip Teriyaki Bowl', productImage: baseImg, productSlug: 'kip-teriyaki', createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), isPublished: true, isDeleted: false, deletedReason: null },
    { id: 'r7', rating: 1, title: '!!!!', body: 'spam advert vis: bezoek nu mijn-website.fake', customerName: 'Spam Bot', customerEmail: 'spam@spam.com', isVerifiedPurchase: false, productId: 'p1', productName: 'Kip Teriyaki Bowl', productImage: baseImg, productSlug: 'kip-teriyaki', createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), isPublished: false, isDeleted: true, deletedReason: 'spam' },
  ];

  let rows = all;
  if (params.tab === 'pending') rows = rows.filter((r) => !r.isPublished && !r.isDeleted);
  else if (params.tab === 'published') rows = rows.filter((r) => r.isPublished && !r.isDeleted);
  else rows = rows.filter((r) => r.isDeleted);

  if (params.rating) rows = rows.filter((r) => r.rating === params.rating);
  if (params.productId) rows = rows.filter((r) => r.productId === params.productId);

  return {
    rows,
    counts: {
      pending: all.filter((r) => !r.isPublished && !r.isDeleted).length,
      published: all.filter((r) => r.isPublished && !r.isDeleted).length,
      deleted: all.filter((r) => r.isDeleted).length,
    },
    isMocked: true,
  };
}
