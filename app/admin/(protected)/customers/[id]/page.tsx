import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Star } from 'lucide-react';
import { checkAdminAccess } from '@/lib/admin/auth';
import { getCustomerDetail } from '@/lib/admin/customers';
import { formatMoneyCents } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';

export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await checkAdminAccess('staff');
  const { id } = await params;
  const detail = await getCustomerDetail(id);
  if (!detail) notFound();

  const c = detail.customer;
  const fullName = (c.firstName || c.lastName)
    ? `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim()
    : c.email;

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-3"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar klanten
      </Link>

      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.025em]">{fullName}</h1>
          <p className="text-stone-600 mt-1 text-sm">
            {c.email}
            {detail.isMocked && (
              <span className="text-amber-700 ml-2">(demo data)</span>
            )}
          </p>
        </div>
        <a
          href={`mailto:${c.email}`}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-black"
        >
          <Mail className="h-4 w-4" /> Email klant
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT — info + stats */}
        <div className="space-y-5">
          <Card title="Contact">
            <div className="space-y-3 text-sm">
              <Row icon={<Mail className="h-3.5 w-3.5 text-stone-400" />}>
                <a href={`mailto:${c.email}`} className="hover:text-stone-900 truncate">
                  {c.email}
                </a>
              </Row>
              {c.phone && (
                <Row icon={<Phone className="h-3.5 w-3.5 text-stone-400" />}>
                  <a href={`tel:${c.phone}`} className="hover:text-stone-900">{c.phone}</a>
                </Row>
              )}
            </div>
          </Card>

          <Card title="Statistieken">
            <dl className="grid grid-cols-2 gap-3">
              <Stat label="Orders" value={String(c.totalOrders)} />
              <Stat label="LTV" value={formatMoneyCents(c.ltvCents)} accent />
              <Stat label="Gem. order" value={formatMoneyCents(detail.averageOrderCents)} />
              <Stat label="Status" value={c.status.toUpperCase()} />
            </dl>
            <div className="mt-3 text-xs text-stone-500">
              Eerste order: {c.firstOrderAt ? dateFmt.format(new Date(c.firstOrderAt)) : '—'}
              <br />
              Laatste order: {c.lastOrderAt ? dateFmt.format(new Date(c.lastOrderAt)) : '—'}
            </div>
          </Card>

          <Card title="Interne notitie">
            <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
              {c.internalNote ?? <span className="text-stone-400">Nog geen notitie. (Bewerken nog niet beschikbaar — phase 2.)</span>}
            </p>
          </Card>
        </div>

        {/* RIGHT — orders + reviews */}
        <div className="lg:col-span-2 space-y-5">
          <Card title="Bestelhistorie">
            {detail.orders.length === 0 ? (
              <p className="text-sm text-stone-500">Nog geen bestellingen.</p>
            ) : (
              <table className="w-full text-sm">
                <tbody className="divide-y divide-stone-100">
                  {detail.orders.map((o) => (
                    <tr key={o.id}>
                      <td className="py-2.5 font-mono text-sm">
                        <Link href={`/admin/orders/${o.id}`} className="hover:text-[--color-accent]">{o.orderNumber}</Link>
                      </td>
                      <td className="py-2.5 text-xs text-stone-500 font-mono">
                        {dateFmt.format(new Date(o.createdAt))}
                      </td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{formatMoneyCents(o.totalCents)}</td>
                      <td className="py-2.5 text-right">
                        <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-semibold', statusPill(o.status))}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          <Card title="Reviews">
            {detail.reviews.length === 0 ? (
              <p className="text-sm text-stone-500">Nog geen reviews.</p>
            ) : (
              <ul className="space-y-3">
                {detail.reviews.map((r) => (
                  <li key={r.id} className="flex gap-3 items-start">
                    <div className="inline-flex">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={cn('h-3.5 w-3.5', n <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-200 fill-stone-200')}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-900">
                        {r.title || <span className="text-stone-400">Geen titel</span>}
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        {r.productName} · {dateFmt.format(new Date(r.createdAt))}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
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

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-stone-700">
      {icon}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-lg px-3 py-2', accent ? 'bg-[--color-accent-bright]/10 border border-[--color-accent-bright]/30' : 'bg-stone-50 border border-stone-100')}>
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{label}</p>
      <p className={cn('mt-0.5 font-mono text-base tabular-nums', accent ? 'text-[--color-accent] font-semibold' : 'text-stone-900')}>
        {value}
      </p>
    </div>
  );
}

function statusPill(status: string): string {
  if (status === 'paid' || status === 'preparing') return 'bg-[--color-accent-bright]/15 text-[--color-accent]';
  if (status === 'shipped' || status === 'delivered') return 'bg-stone-900 text-white';
  if (status === 'cancelled' || status === 'refunded') return 'bg-stone-100 text-stone-600';
  return 'bg-amber-100 text-amber-800';
}
