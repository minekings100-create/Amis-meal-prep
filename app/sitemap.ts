import type { MetadataRoute } from 'next';
import { listProducts } from '@/lib/data/products';

const SITE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://amismeals.nl';

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
  priority: number;
}> = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/shop', changeFrequency: 'daily', priority: 0.9 },
  { path: '/over-ons', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'yearly', priority: 0.5 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/algemene-voorwaarden', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/privacybeleid', changeFrequency: 'yearly', priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.flatMap((r) => {
    const nlUrl = `${SITE}${r.path}`;
    const enUrl = `${SITE}/en${r.path === '/' ? '' : r.path}`;
    return [
      {
        url: nlUrl,
        lastModified,
        changeFrequency: r.changeFrequency,
        priority: r.priority,
        alternates: {
          languages: { nl: nlUrl, en: enUrl },
        },
      },
      {
        url: enUrl,
        lastModified,
        changeFrequency: r.changeFrequency,
        priority: Math.max(0.1, r.priority - 0.1),
        alternates: {
          languages: { nl: nlUrl, en: enUrl },
        },
      },
    ];
  });

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await listProducts();
    productEntries = products.flatMap((p) => {
      const nlUrl = `${SITE}/shop/${p.slug}`;
      const enUrl = `${SITE}/en/shop/${p.slug}`;
      const updated = p.updated_at ? new Date(p.updated_at) : lastModified;
      return [
        {
          url: nlUrl,
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
          alternates: { languages: { nl: nlUrl, en: enUrl } },
        },
        {
          url: enUrl,
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
          alternates: { languages: { nl: nlUrl, en: enUrl } },
        },
      ];
    });
  } catch {
    // Ignore: DB might be unreachable during build; sitemap still useful with static routes.
  }

  return [...staticEntries, ...productEntries];
}
