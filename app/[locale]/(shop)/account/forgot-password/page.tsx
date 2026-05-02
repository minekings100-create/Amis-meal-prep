'use client';

import { useState, useTransition } from 'react';
import { Link } from '@/lib/i18n/navigation';
import { Mail, ArrowLeft } from 'lucide-react';
import { requestPasswordResetAction } from '@/app/_actions/account';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    setInfo(null);
    start(async () => {
      const res = await requestPasswordResetAction(email);
      if (res.ok) setInfo(res.message ?? 'Reset-link verstuurd');
      else setError(res.message ?? 'Er ging iets mis');
    });
  }

  return (
    <div className="container-amis py-16 md:py-24 max-w-md">
      <Link
        href="/account/login"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar inloggen
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] mb-2">
        Wachtwoord vergeten?
      </h1>
      <p className="text-sm text-stone-600 mb-6">
        Vul je e-mailadres in en we sturen je een link om een nieuw wachtwoord in te stellen.
      </p>

      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-3"
        >
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@adres.nl"
              className="h-12 w-full pl-9 pr-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-(--color-brand-yellow)"
            />
          </div>
          {info && <p className="text-sm text-(--color-brand-yellow)">{info}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-xl bg-(--color-brand-yellow) text-(--color-brand-black) font-semibold text-sm hover:bg-(--color-brand-yellow)/90 disabled:opacity-60"
          >
            {pending ? 'Bezig…' : 'Stuur reset-link'}
          </button>
        </form>
      </div>
    </div>
  );
}
