'use client';

import { useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  loginWithPasswordAction,
  loginWithMagicLinkAction,
} from '@/app/_actions/account';

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/account';
  const adminTarget = next.startsWith('/admin');
  const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    setInfo(null);
    start(async () => {
      const res =
        mode === 'password'
          ? await loginWithPasswordAction(email, password, next)
          : await loginWithMagicLinkAction(email, next);
      if (!res.ok) {
        setError(res.message ?? 'Inloggen mislukt');
        return;
      }
      if (res.message) setInfo(res.message);
      if (res.redirectTo) router.push(res.redirectTo);
    });
  }

  return (
    <div className="container-amis py-16 md:py-24 max-w-md">
      <div className="text-center mb-8">
        <div className="inline-flex items-baseline gap-2 mb-6">
          <span className="font-bold text-2xl tracking-[-0.04em]">AMIS</span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500">meals</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em]">Inloggen</h1>
        <p className="text-sm text-stone-600 mt-1">Welkom terug</p>
      </div>

      {!hasSupabase && adminTarget && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 mb-5 text-sm">
          <p className="font-semibold text-amber-900 mb-2">Admin shortcuts (dev)</p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin?as=owner"
              className="inline-flex items-center px-3 h-8 rounded-full bg-amber-900 text-white text-xs font-semibold hover:bg-amber-800"
            >
              Inloggen als owner
            </Link>
            <Link
              href="/admin?as=staff"
              className="inline-flex items-center px-3 h-8 rounded-full bg-stone-700 text-white text-xs font-semibold hover:bg-stone-800"
            >
              Inloggen als staff
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white border border-stone-200 p-6 md:p-7">
        <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={cn(
              'h-9 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
              mode === 'password' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700',
            )}
          >
            <Lock className="h-3 w-3" /> Wachtwoord
          </button>
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={cn(
              'h-9 rounded-lg text-xs font-semibold transition-colors inline-flex items-center justify-center gap-1.5',
              mode === 'magic' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700',
            )}
          >
            <Sparkles className="h-3 w-3" /> Magic link
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-3"
        >
          <Field
            icon={<Mail className="h-3.5 w-3.5" />}
            placeholder="email@adres.nl"
            type="email"
            value={email}
            onChange={setEmail}
          />
          {mode === 'password' && (
            <Field
              icon={<Lock className="h-3.5 w-3.5" />}
              placeholder="Wachtwoord"
              type="password"
              value={password}
              onChange={setPassword}
            />
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {info && <p className="text-sm text-(--color-accent)">{info}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-xl bg-(--color-accent) text-white font-semibold text-sm hover:bg-(--color-accent)/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {pending ? 'Bezig…' : mode === 'password' ? 'Inloggen' : 'Stuur magic link'}
            <ArrowRight className="h-4 w-4" />
          </button>
          {mode === 'password' && (
            <div className="text-center pt-1">
              <Link href="/account/forgot-password" className="text-xs text-stone-500 hover:text-stone-900">
                Wachtwoord vergeten?
              </Link>
            </div>
          )}
        </form>
      </div>

      <p className="text-sm text-stone-600 text-center mt-6">
        Nog geen account?{' '}
        <Link
          href={`/account/register?next=${encodeURIComponent(next)}`}
          className="text-(--color-accent) hover:underline font-medium"
        >
          Registreren
        </Link>
      </p>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  type,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full pl-9 pr-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-bright)/30"
      />
    </div>
  );
}
