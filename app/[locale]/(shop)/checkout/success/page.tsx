import { redirect } from 'next/navigation';
import { Link } from '@/lib/i18n/navigation';
import { CheckCircle2, Package, Truck, Mail, ArrowRight } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/lib/i18n/config';
import { getPublicOrderByNumber } from '@/lib/admin/public-order';
import { formatMoneyCents } from '@/lib/utils/money';
import { ConfettiBurst } from '@/components/checkout/confetti-burst';
import { CopyButton } from '@/components/checkout/copy-button';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Bestelling geplaatst' };

const dateFmt = new Intl.DateTimeFormat('nl-NL', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const orderRaw = sp.order;
  const orderNumber = Array.isArray(orderRaw) ? orderRaw[0] : orderRaw;
  if (!orderNumber) redirect('/shop');

  const order = await getPublicOrderByNumber(orderNumber);
  if (!order) redirect('/shop');

  const expectedShipDate = new Date();
  expectedShipDate.setDate(expectedShipDate.getDate() + (order.shippingMethod === 'local' ? 1 : 2));

  return (
    <div className="container-amis py-16 md:py-24 max-w-3xl">
      <ConfettiBurst orderNumber={order.orderNumber} />

      {/* Hero */}
      <div className="text-center mb-12 md:mb-14">
        <div className="relative inline-flex h-24 w-24 items-center justify-center rounded-full bg-(--color-brand-yellow-bright)/15 mb-6 ring-8 ring-(--color-brand-yellow-bright)/8">
          <CheckCircle2 className="h-12 w-12 text-(--color-brand-yellow)" strokeWidth={2.5} />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-(--color-brand-yellow) mb-3">
          Bestelling geplaatst
        </p>
        <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em] mb-5">
          Bedankt voor je bestelling!
        </h1>
        <div className="inline-flex items-center gap-2 rounded-full bg-stone-100 pl-4 pr-1 py-1">
          <span className="text-sm text-stone-700">
            Ordernummer:{' '}
            <span className="font-mono font-semibold text-stone-900">{order.orderNumber}</span>
          </span>
          <CopyButton value={order.orderNumber} />
        </div>
        <p className="text-stone-600 mt-5">
          We hebben een bevestigingsmail gestuurd naar{' '}
          <span className="font-medium text-stone-900">{order.customerEmail}</span>
        </p>
        {order.isMocked && (
          <p className="text-stone-400 text-[11px] font-mono mt-3">
            demo mode — geen echte order in database
          </p>
        )}
      </div>

      {/* What happens next */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 mb-6">
        <h2 className="text-base font-semibold text-stone-900 mb-5">Wat gebeurt er nu?</h2>
        <ol className="space-y-4">
          <Step
            n={1}
            icon={<Package className="h-4 w-4" />}
            title="Wij bereiden je maaltijden vers"
            body="Onze keuken-crew ziet je bestelling en plant 'm in voor productie."
          />
          <Step
            n={2}
            icon={<Truck className="h-4 w-4" />}
            title={`Verzending op ${dateFmt.format(expectedShipDate)}`}
            body={
              order.shippingMethod === 'local'
                ? 'Onze bezorger brengt het persoonlijk langs. Tussen 16:00 en 20:00.'
                : 'PostNL haalt het pakket op en bezorgt binnen 1-2 werkdagen.'
            }
          />
          <Step
            n={3}
            icon={<Mail className="h-4 w-4" />}
            title="Track & trace volgt per email"
            body="Zodra je pakket onderweg is krijg je een mail met een volgcode."
          />
        </ol>
      </section>

      {/* Order summary */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 mb-6">
        <h2 className="text-base font-semibold text-stone-900 mb-5">Bestelling</h2>
        <ul className="divide-y divide-stone-100">
          {order.items.map((it, i) => (
            <li key={i} className="flex items-center gap-3 py-3 text-sm">
              {it.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={it.imageUrl} alt="" className="h-12 w-12 rounded-lg object-cover bg-stone-100" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-stone-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 truncate">{it.name}</p>
                <p className="text-xs text-stone-500 font-mono">
                  {formatMoneyCents(it.unitPriceCents)} × {it.quantity}
                </p>
              </div>
              <span className="font-mono tabular-nums text-stone-900">
                {formatMoneyCents(it.totalCents)}
              </span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 pt-4 border-t border-stone-100 space-y-1 text-sm">
          <Row label="Subtotaal" cents={order.totals.subtotalCents} />
          {order.totals.discountCents > 0 && (
            <Row label="Korting" cents={-order.totals.discountCents} accent />
          )}
          <Row label="Verzending" cents={order.totals.shippingCents} />
          <div className="flex justify-between pt-2 border-t border-stone-200 mt-2">
            <dt className="font-semibold text-stone-900">Totaal</dt>
            <dd className="font-mono font-bold text-stone-900">
              {formatMoneyCents(order.totals.totalCents)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Address */}
      <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 mb-8">
        <h2 className="text-base font-semibold text-stone-900 mb-3">Bezorgadres</h2>
        <p className="text-sm text-stone-700 leading-relaxed">
          {order.customerFirstName} {order.customerLastName}
          <br />
          {order.shippingAddress.street} {order.shippingAddress.houseNumber}
          <br />
          <span className="font-mono">{order.shippingAddress.postalCode}</span>{' '}
          {order.shippingAddress.city}, {order.shippingAddress.country}
        </p>
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/account/orders/${order.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-2xl bg-(--color-brand-yellow) text-(--color-brand-black) font-semibold text-sm hover:bg-(--color-brand-yellow)/90"
        >
          Bekijk je bestelling <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/shop"
          className="flex-1 inline-flex items-center justify-center gap-2 h-12 rounded-2xl border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50"
        >
          Terug naar shop
        </Link>
      </div>

      {/* Account CTA for guests */}
      <div className="mt-10 rounded-2xl bg-gradient-to-br from-(--color-brand-yellow-bright)/10 to-stone-50 border border-(--color-brand-yellow-bright)/20 px-6 py-6 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-(--color-brand-yellow) mb-2">
          Sneller volgende keer
        </p>
        <p className="text-sm text-stone-700 mb-4 max-w-md mx-auto">
          Maak een account aan om je bestelling te volgen en sneller af te rekenen — een paar
          seconden werk.
        </p>
        <Link
          href={`/account/register?email=${encodeURIComponent(order.customerEmail)}`}
          className="inline-flex items-center gap-1.5 h-11 px-5 rounded-xl bg-(--color-brand-yellow) text-(--color-brand-black) text-sm font-semibold hover:bg-(--color-brand-yellow)/90 active:scale-[0.99] transition-all"
        >
          Account aanmaken
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function Step({
  n,
  icon,
  title,
  body,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <div className="relative shrink-0">
        <div className="h-9 w-9 rounded-full bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) inline-flex items-center justify-center font-semibold text-sm">
          {n}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 inline-flex items-center gap-2">
          <span className="text-stone-400">{icon}</span>
          {title}
        </p>
        <p className="text-sm text-stone-600 mt-0.5">{body}</p>
      </div>
    </li>
  );
}

function Row({ label, cents, accent }: { label: string; cents: number; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <dt className="text-stone-600">{label}</dt>
      <dd
        className={`font-mono tabular-nums ${accent ? 'text-(--color-brand-yellow) font-medium' : 'text-stone-900'}`}
      >
        {formatMoneyCents(cents)}
      </dd>
    </div>
  );
}
