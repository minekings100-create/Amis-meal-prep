'use client';

import { useState, useTransition } from 'react';
import { Link, useRouter } from '@/lib/i18n/navigation';
import { Lock, ArrowLeft } from 'lucide-react';
import { resetPasswordAction } from '@/app/_actions/account';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    if (pw !== confirm) {
      setError('Wachtwoorden komen niet overeen');
      return;
    }
    start(async () => {
      const res = await resetPasswordAction(pw);
      if (!res.ok) setError(res.message ?? 'Er ging iets mis');
      else if (res.redirectTo) router.push(res.redirectTo);
    });
  }

  return (
    <div className="container-amis py-16 md:py-24 max-w-md">
      <Link
        href="/account/login"
        className="inline-flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Terug
      </Link>

      <h1 className="text-2xl md:text-3xl font-bold tracking-[-0.025em] mb-2">
        Nieuw wachtwoord
      </h1>
      <p className="text-sm text-stone-600 mb-6">
        Kies een nieuw wachtwoord van minimaal 8 karakters.
      </p>

      <div className="rounded-2xl bg-white border border-stone-200 p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-3"
        >
          <Field icon={<Lock className="h-3.5 w-3.5" />} placeholder="Nieuw wachtwoord" value={pw} onChange={setPw} />
          <Field icon={<Lock className="h-3.5 w-3.5" />} placeholder="Bevestig wachtwoord" value={confirm} onChange={setConfirm} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full h-12 rounded-xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 disabled:opacity-60"
          >
            {pending ? 'Bezig…' : 'Wachtwoord wijzigen'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">{icon}</span>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-12 w-full pl-9 pr-3 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-(--color-brand-yellow)"
      />
    </div>
  );
}
