import Link from 'next/link';
import { Mail, Phone, MapPin, ExternalLink, Truck, MessageSquare } from 'lucide-react';
import { formatMoneyCents } from '@/lib/utils/money';
import type { OrderDetail } from '@/lib/admin/order-detail';

export function CustomerCard({ customer }: { customer: OrderDetail['customer'] }) {
  return (
    <Card title="Klant">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-stone-900">
            {customer.firstName} {customer.lastName}
          </p>
          {customer.userId ? (
            <Link
              href={`/admin/customers/${customer.userId}`}
              className="text-xs text-[--color-accent] hover:underline"
            >
              {customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'} totaal →
            </Link>
          ) : (
            <span className="text-xs text-stone-400">Gast-bestelling</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Mail className="h-3.5 w-3.5 text-stone-400" />
          <a href={`mailto:${customer.email}`} className="hover:text-stone-900 truncate">
            {customer.email}
          </a>
        </div>
        {customer.phone && (
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Phone className="h-3.5 w-3.5 text-stone-400" />
            <a href={`tel:${customer.phone}`} className="hover:text-stone-900">
              {customer.phone}
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}

export function AddressCard({ shipping }: { shipping: OrderDetail['shipping'] }) {
  const fullAddress = `${shipping.street} ${shipping.houseNumber}, ${shipping.postalCode} ${shipping.city}`;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  return (
    <Card title="Bezorgadres">
      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-stone-400 mt-0.5 shrink-0" />
          <div className="text-sm text-stone-700 leading-relaxed">
            {shipping.street} {shipping.houseNumber}
            <br />
            <span className="font-mono">{shipping.postalCode}</span> {shipping.city}
            <br />
            <span className="text-stone-500">{shipping.country}</span>
          </div>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[--color-accent] hover:underline"
        >
          Bekijk op Google Maps <ExternalLink className="h-3 w-3" />
        </a>
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Truck className="h-3.5 w-3.5 text-stone-400" />
            {shipping.method === 'local' ? 'Lokale bezorging' : 'PostNL'}
          </div>
          {shipping.isLocal ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[--color-accent-bright]/15 text-[--color-accent] text-[10px] font-bold uppercase tracking-wider border border-[--color-accent-bright]/30">
              Maastricht
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">
              PostNL
            </span>
          )}
        </div>
        {shipping.trackingNumber && (
          <div className="pt-3 border-t border-stone-100">
            <p className="text-xs text-stone-500 mb-1">Tracking</p>
            {shipping.trackingUrl ? (
              <a
                href={shipping.trackingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-mono text-[--color-accent] hover:underline inline-flex items-center gap-1"
              >
                {shipping.trackingNumber} <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-sm font-mono text-stone-700">{shipping.trackingNumber}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export function CustomerNoteCard({ note }: { note: string }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-amber-700" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
          Klant-opmerking
        </h3>
      </div>
      <p className="text-sm text-amber-900 leading-relaxed whitespace-pre-wrap">{note}</p>
    </div>
  );
}

export function OrderTotals({ totals }: { totals: OrderDetail['totals'] }) {
  return (
    <Card title="Totalen">
      <dl className="space-y-2 text-sm">
        <Row label="Subtotaal" cents={totals.subtotalCents} />
        {totals.discountCents > 0 && (
          <Row label="Korting" cents={-totals.discountCents} negative />
        )}
        <Row label="Verzendkosten" cents={totals.shippingCents} />
        <Row label="BTW (incl.)" cents={totals.taxCents} muted />
        <div className="pt-2 mt-2 border-t border-stone-200">
          <Row label="Totaal" cents={totals.totalCents} bold />
        </div>
      </dl>
    </Card>
  );
}

function Row({
  label,
  cents,
  bold,
  muted,
  negative,
}: {
  label: string;
  cents: number;
  bold?: boolean;
  muted?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? 'text-stone-400' : 'text-stone-600'}>{label}</dt>
      <dd
        className={[
          'font-mono tabular-nums',
          bold ? 'text-base font-semibold text-stone-900' : 'text-stone-900',
          muted && 'text-stone-400 text-xs',
          negative && 'text-[--color-accent]',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {formatMoneyCents(cents)}
      </dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export function OrderItemsTable({ items }: { items: OrderDetail['items'] }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <h3 className="px-5 pt-5 pb-3 text-xs font-bold uppercase tracking-wider text-stone-500">
        Items ({items.length})
      </h3>
      <table className="w-full">
        <thead className="border-b border-stone-100">
          <tr className="text-[11px] uppercase tracking-wider text-stone-500">
            <th className="text-left px-5 py-2 font-medium">Product</th>
            <th className="text-right px-3 py-2 font-medium">Aantal</th>
            <th className="text-right px-3 py-2 font-medium">Prijs/stuk</th>
            <th className="text-right px-5 py-2 font-medium">Totaal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {items.map((it) => (
            <tr key={it.id} className="hover:bg-stone-50/50">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  {it.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.imageUrl}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover bg-stone-100"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-stone-100" />
                  )}
                  <div>
                    <p className="font-medium text-stone-900 text-sm">{it.name}</p>
                    {it.productId && (
                      <Link
                        href={`/admin/products/${it.productId}/edit`}
                        className="text-[10px] text-stone-400 hover:text-stone-600"
                      >
                        Bewerk product →
                      </Link>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-3 text-right font-mono tabular-nums text-stone-700">
                ×{it.quantity}
              </td>
              <td className="px-3 py-3 text-right font-mono tabular-nums text-stone-500">
                {formatMoneyCents(it.unitPriceCents)}
              </td>
              <td className="px-5 py-3 text-right font-mono tabular-nums font-medium text-stone-900">
                {formatMoneyCents(it.totalCents)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
