import Link from 'next/link';
import { Lock, ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Geen toegang', robots: { index: false } };

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="h-14 w-14 mx-auto rounded-full bg-stone-200 inline-flex items-center justify-center text-stone-700 mb-6">
          <Lock className="h-5 w-5" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500 mb-3">403</p>
        <h1 className="text-3xl font-bold tracking-[-0.025em] mb-4">Geen toegang</h1>
        <p className="text-stone-600 leading-relaxed mb-8">
          Het AMIS-admin paneel is alleen beschikbaar voor medewerkers. Vraag een eigenaar om je
          account toegang te geven.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar de shop
        </Link>
      </div>
    </div>
  );
}
