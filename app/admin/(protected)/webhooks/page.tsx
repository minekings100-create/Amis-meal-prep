import { checkAdminAccess } from '@/lib/admin/auth';
import { getWebhookListing, type WebhookListParams, type WebhookSource, type WebhookStatus } from '@/lib/admin/webhooks';
import { WebhooksList } from '@/components/admin/webhooks/webhooks-list';
import { WebhooksFilters } from '@/components/admin/webhooks/filters';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Webhooks' };

export default async function WebhooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await checkAdminAccess('owner');
  const sp = await searchParams;
  const get = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const sourceRaw = get('source');
  const source: WebhookSource | undefined =
    sourceRaw === 'mollie' || sourceRaw === 'sendcloud' || sourceRaw === 'resend' ? sourceRaw : undefined;

  const statusRaw = get('status');
  const status: WebhookStatus | undefined =
    statusRaw === 'received' || statusRaw === 'processed' || statusRaw === 'failed' ? statusRaw : undefined;

  const params: WebhookListParams = {
    source,
    status,
    search: get('q') ?? '',
    dateFrom: get('from'),
  };

  const listing = await getWebhookListing(params);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-[-0.025em]">Webhooks</h1>
        <p className="text-stone-600 mt-1 text-sm">
          Owner-only. Live log van Mollie, Sendcloud en Resend events.
          {listing.isMocked && <span className="text-amber-700 ml-2">(demo data)</span>}
        </p>
      </header>

      <WebhooksFilters />
      <WebhooksList rows={listing.rows} />
    </div>
  );
}
