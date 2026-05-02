'use client';

import { useState, useTransition } from 'react';
import { ChevronDown, ChevronUp, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  updateProfileAction,
  deleteAccountAction,
} from '@/app/_actions/account';
import { useRouter } from '@/lib/i18n/navigation';
import type { CustomerProfile } from '@/lib/account/auth';

export function ProfileForm({ customer }: { customer: CustomerProfile }) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(customer.firstName ?? '');
  const [lastName, setLastName] = useState(customer.lastName ?? '');
  const [phone, setPhone] = useState(customer.phone ?? '');
  const [newsletter, setNewsletter] = useState(false);
  const [pwOpen, setPwOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      const res = await updateProfileAction({ firstName, lastName, phone, newsletter });
      if (res.ok) setSavedAt(new Date().toLocaleTimeString('nl-NL'));
      else setError(res.message ?? 'Fout bij opslaan');
    });
  }

  function deleteAccount() {
    start(async () => {
      const res = await deleteAccountAction();
      if (res.ok) router.push('/');
    });
  }

  return (
    <div className="space-y-5">
      <Card title="Persoonlijke gegevens">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Voornaam">
            <Input value={firstName} onChange={setFirstName} />
          </Field>
          <Field label="Achternaam">
            <Input value={lastName} onChange={setLastName} />
          </Field>
        </div>
        <Field label="Email" hint="Verifieer-flow voor wijzigen komt later">
          <Input value={customer.email} onChange={() => {}} disabled />
        </Field>
        <Field label="Telefoon">
          <Input value={phone} onChange={setPhone} type="tel" />
        </Field>
        <label className="flex items-start gap-2 mt-3">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-stone-300 text-(--color-brand-yellow)"
          />
          <span className="text-sm text-stone-700">
            Ja, hou me op de hoogte van nieuwe maaltijden en aanbiedingen
          </span>
        </label>
        <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
          <div className="text-xs text-stone-500">
            {savedAt && <span className="text-(--color-brand-yellow)">Opgeslagen om {savedAt}</span>}
            {error && <span className="text-red-600">{error}</span>}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-(--color-brand-black) text-white font-semibold text-sm hover:bg-stone-800 disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {pending ? 'Opslaan…' : 'Opslaan'}
          </button>
        </div>
      </Card>

      <div className="rounded-2xl bg-white border border-stone-200 dark:bg-(--color-bg-elevated) dark:border-(--color-border)">
        <button
          type="button"
          onClick={() => setPwOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="text-sm font-semibold text-stone-900">Wachtwoord wijzigen</span>
          {pwOpen ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
        </button>
        {pwOpen && (
          <div className="px-5 pb-5 pt-2 border-t border-stone-100">
            <p className="text-sm text-stone-600 mb-3">
              We sturen een reset-link naar <span className="font-medium">{customer.email}</span>.
            </p>
            <button
              type="button"
              className="h-10 px-4 rounded-md border border-stone-300 bg-white text-sm font-medium hover:bg-stone-50"
            >
              Stuur reset-link
            </button>
          </div>
        )}
      </div>

      {/* Danger zone */}
      <Card title="Account verwijderen" tone="danger">
        {deleteConfirm ? (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-900 mb-3">
              Weet je het zeker? Je account wordt direct verwijderd. Bestelhistorie blijft
              behouden voor administratieve doeleinden maar wordt geanonimiseerd.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="h-9 px-4 rounded-md border border-stone-300 bg-white text-sm hover:bg-stone-50"
              >
                Annuleren
              </button>
              <button
                onClick={deleteAccount}
                disabled={pending}
                className="h-9 px-4 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60"
              >
                {pending ? 'Verwijderen…' : 'Bevestig verwijderen'}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-md border border-red-200 bg-white text-sm text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Verwijder mijn account
          </button>
        )}
      </Card>
    </div>
  );
}

function Card({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'danger' }) {
  return (
    <section
      className={cn(
        'rounded-2xl bg-white border p-5 space-y-4',
        tone === 'danger' ? 'border-red-200' : 'border-stone-200',
      )}
    >
      <h2 className={cn('text-xs font-bold uppercase tracking-wider', tone === 'danger' ? 'text-red-700' : 'text-stone-500')}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-stone-700 mb-1">
        {label}
        {hint && <span className="text-stone-400 font-normal ml-1.5">— {hint}</span>}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  type = 'text',
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'h-11 w-full rounded-md border border-stone-300 px-3 text-sm focus:outline-none focus:border-(--color-brand-yellow)',
        disabled && 'bg-stone-50 text-stone-500',
      )}
    />
  );
}
