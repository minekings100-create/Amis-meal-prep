import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { requireCustomer } from '@/lib/account/auth';
import { listCustomerOrders } from '@/lib/account/orders';
import { OrderListRow } from '@/components/account/order-list-row';

export const metadata = { title: 'Bestellingen' };
export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const customer = await requireCustomer('/account/orders');
  const orders = await listCustomerOrders(customer.userId);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em]">Bestellingen</h1>
        <p className="text-stone-600 mt-1 text-sm">{orders.length} totaal</p>
      </header>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 mb-4">
            <ShoppingBag className="h-7 w-7 text-stone-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-stone-900">Nog geen bestellingen</h2>
          <p className="text-sm text-stone-500 mt-1 max-w-sm mx-auto">
            Begin met een AMIS-pakket of plaats een paar losse maaltijden — je bestellingen
            verschijnen hier.
          </p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-(--color-brand-yellow) text-(--color-brand-black) font-semibold text-sm hover:bg-(--color-brand-yellow)/90"
          >
            Naar shop <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <ul className="space-y-2">
          {orders.map((o) => (
            <OrderListRow key={o.id} order={o} />
          ))}
        </ul>
      )}
    </div>
  );
}
