'use client';

import { Suspense, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { Mail, Lock, User, ArrowRight, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { registerAction } from '@/app/_actions/account';

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterInner />
    </Suspense>
  );
}

function RegisterInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const prefilledEmail = sp.get('email') ?? '';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const minLen = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const passwordValid = minLen && hasNumber && hasUpper;
  const confirmsMatch = password.length > 0 && password === confirm;

  function submit() {
    setError(null);
    if (!firstName || !lastName || !email || !password) {
      setError('Vul alle verplichte velden in');
      return;
    }
    if (!passwordValid) {
      setError('Wachtwoord voldoet niet aan de eisen');
      return;
    }
    if (!confirmsMatch) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }
    if (!terms) {
      setError('Accepteer de algemene voorwaarden');
      return;
    }
    start(async () => {
      const res = await registerAction({ email, password, firstName, lastName, newsletter });
      if (!res.ok) {
        setError(res.message ?? 'Registratie mislukt');
        return;
      }
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
          <h1 className="text-3xl md:text-4xl font-bold tracking-[-0.025em]">Account aanmaken</h1>
          <p className="text-sm text-stone-600 mt-2">Sneller bestellen + bestelhistorie</p>
        </div>

      <div className="rounded-2xl bg-white border border-stone-200/80 p-6 md:p-7 shadow-[0_2px_24px_-12px_rgba(0,0,0,0.08)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <Field icon={<User className="h-3.5 w-3.5" />} placeholder="Voornaam" value={firstName} onChange={setFirstName} />
            <Field icon={<User className="h-3.5 w-3.5" />} placeholder="Achternaam" value={lastName} onChange={setLastName} />
          </div>
          <Field icon={<Mail className="h-3.5 w-3.5" />} type="email" placeholder="email@adres.nl" value={email} onChange={setEmail} />
          <Field icon={<Lock className="h-3.5 w-3.5" />} type="password" placeholder="Wachtwoord" value={password} onChange={setPassword} />
          {password.length > 0 && (
            <ul className="text-xs space-y-0.5 pl-1">
              <Requirement met={minLen}>Minimaal 8 karakters</Requirement>
              <Requirement met={hasNumber}>Bevat een cijfer</Requirement>
              <Requirement met={hasUpper}>Bevat een hoofdletter</Requirement>
            </ul>
          )}
          <Field icon={<Lock className="h-3.5 w-3.5" />} type="password" placeholder="Bevestig wachtwoord" value={confirm} onChange={setConfirm} />
          {confirm.length > 0 && !confirmsMatch && (
            <p className="text-xs text-red-600">Wachtwoorden komen niet overeen</p>
          )}

          <label className="flex items-start gap-2 pt-2">
            <input
              type="checkbox"
              checked={terms}
              onChange={(e) => setTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-(--color-brand-yellow)"
            />
            <span className="text-xs text-stone-700 leading-snug">
              Ik ga akkoord met de{' '}
              <Link href="/algemene-voorwaarden" className="text-(--color-brand-yellow) hover:underline" target="_blank">
                algemene voorwaarden
              </Link>{' '}
              en het{' '}
              <Link href="/privacybeleid" className="text-(--color-brand-yellow) hover:underline" target="_blank">
                privacybeleid
              </Link>
              .
            </span>
          </label>
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={newsletter}
              onChange={(e) => setNewsletter(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-(--color-brand-yellow)"
            />
            <span className="text-xs text-stone-700">Hou me op de hoogte van nieuwe maaltijden en aanbiedingen</span>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 disabled:opacity-60 inline-flex items-center justify-center gap-2 mt-4"
          >
            {pending ? 'Bezig…' : 'Account aanmaken'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>

      <p className="text-sm text-stone-600 text-center mt-6">
        Al een account?{' '}
        <Link href="/account/login" className="text-(--color-brand-yellow) hover:underline font-medium">
          Inloggen
        </Link>
      </p>
      </div>
    </div>
  );
}

function Field({
  icon,
  type = 'text',
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  type?: string;
  placeholder: string;
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

function Requirement({ met, children }: { met: boolean; children: React.ReactNode }) {
  return (
    <li className={cn('inline-flex items-center gap-1.5', met ? 'text-(--color-brand-yellow)' : 'text-stone-400')}>
      {met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      {children}
    </li>
  );
}
