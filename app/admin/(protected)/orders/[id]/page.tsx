import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Order detail' };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar bestellingen
      </Link>
      <h1 className="text-3xl font-bold tracking-[-0.025em]">Order #{id}</h1>
      <div className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="text-stone-500">
          Detail-view komt in Stap 4 — klant info, items, totalen, timeline en acties.
        </p>
      </div>
    </div>
  );
}
