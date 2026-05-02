import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const metadata = {
  title: '404 · AMIS Admin',
  robots: { index: false, follow: false },
};

export default function AdminNotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 py-16 bg-stone-50">
      <div className="max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-200 text-stone-700 mb-5">
          <AlertCircle className="h-6 w-6" />
        </div>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-stone-500 mb-2">
          Admin · 404
        </p>
        <h1 className="text-2xl font-bold tracking-[-0.025em] mb-2">Route niet gevonden</h1>
        <p className="text-sm text-stone-600 mb-8">
          Deze admin-route bestaat niet. Controleer het pad of ga terug naar het dashboard.
        </p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-stone-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Terug naar dashboard
        </Link>
      </div>
    </div>
  );
}
