'use client';

import { useState, useTransition } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function NewsletterForm({ subscribeLabel }: { subscribeLabel: string }) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Geen geldig e-mailadres');
      return;
    }
    start(async () => {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        setSuccess(true);
        setEmail('');
      } catch {
        setError('Er ging iets mis');
      }
    });
  }

  return (
    <form onSubmit={submit} className="flex gap-2 max-w-sm">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@adres.nl"
        disabled={success}
        aria-label="Email"
        className="flex-1 h-10 rounded-md bg-white/10 border border-white/15 px-3 text-sm text-white placeholder:text-white/40 transition-colors hover:border-white/30 focus:outline-none focus:border-(--color-brand-yellow-bright) focus:bg-white/15 disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={pending || success}
        className={cn(
          'h-10 px-4 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1.5',
          success
            ? 'bg-(--color-brand-black) text-white'
            : 'bg-(--color-brand-yellow-bright) text-(--color-ink) hover:bg-white',
        )}
      >
        {success ? <><Check className="h-3.5 w-3.5" /> Aangemeld</> : <>{pending ? '…' : subscribeLabel} <ArrowRight className="h-3 w-3" /></>}
      </button>
      {error && <span className="absolute mt-12 text-xs text-red-300">{error}</span>}
    </form>
  );
}
