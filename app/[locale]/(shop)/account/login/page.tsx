'use client';

import { Suspense, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  loginWithPasswordAction,
  loginWithMagicLinkAction,
} from '@/app/_actions/account';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
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
    <div className="relative">
      {/* Soft plate-circle brand backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 h-[520px] w-[520px] rounded-full bg-(--color-brand-yellow-bright)/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-32 -translate-x-1/2 h-[360px] w-[360px] rounded-full border border-(--color-brand-yellow-bright)/15"
      />
      <div className="container-amis relative py-12 md:py-16 max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em]">Inloggen</h1>
          <p className="text-sm text-stone-600 mt-2">Welkom terug bij AMIS Meals</p>
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

      <div className="rounded-2xl bg-white border border-stone-200/80 p-6 md:p-7 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-xl mb-5">
          <button
            type="button"
            onClick={() => setMode('password')}
            className={cn(
              'h-9 rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5',
              mode === 'password'
                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60'
                : 'text-stone-600 hover:text-stone-900',
            )}
          >
            <Lock className="h-3 w-3" /> Wachtwoord
          </button>
          <button
            type="button"
            onClick={() => setMode('magic')}
            className={cn(
              'h-9 rounded-lg text-xs font-semibold transition-all inline-flex items-center justify-center gap-1.5',
              mode === 'magic'
                ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200/60'
                : 'text-stone-600 hover:text-stone-900',
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
          {info && <p className="text-sm text-(--color-brand-yellow)">{info}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-xl bg-(--color-brand-yellow) text-(--color-brand-black) font-semibold text-sm hover:bg-(--color-brand-yellow)/90 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {pending ? 'Bezig…' : mode === 'password' ? 'Inloggen' : 'Stuur magic link'}
            <ArrowRight className="h-4 w-4" />
          </button>
          {mode === 'password' && (
            <div className="text-center pt-1">
              <Link
                href="/account/forgot-password"
                className="text-xs text-stone-500 hover:text-(--color-brand-yellow) transition-colors"
              >
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
          className="text-(--color-brand-yellow) hover:underline font-medium"
        >
          Registreren
        </Link>
      </p>
      </div>
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
        className="h-12 w-full pl-9 pr-3 rounded-xl border border-stone-200 bg-stone-50/60 text-sm transition-colors hover:border-stone-300 focus:outline-none focus:border-(--color-brand-yellow) focus:bg-white focus:ring-2 focus:ring-(--color-brand-yellow-bright)/30"
      />
    </div>
  );
}
