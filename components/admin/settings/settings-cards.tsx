'use client';

import { useState, useTransition } from 'react';
import { Save, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { centsFromEuros } from '@/lib/utils/money';
import { saveSettingAction } from '@/app/admin/_actions/settings';
import type { AllSettings, IntegrationStatus } from '@/lib/admin/settings';

export function ShippingCard({ initial }: { initial: AllSettings['shipping'] }) {
  const [s, setS] = useState({
    localPostalCodes: initial.localPostalCodes.join(', '),
    localFeeEur: (initial.localFeeCents / 100).toFixed(2),
    localFreeEur: (initial.localFreeThresholdCents / 100).toFixed(2),
    postnlFeeEur: (initial.postnlFeeCents / 100).toFixed(2),
    postnlFreeEur: (initial.postnlFreeThresholdCents / 100).toFixed(2),
  });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    start(async () => {
      const res = await saveSettingAction('shipping', {
        localPostalCodes: s.localPostalCodes.split(',').map((p) => p.trim()).filter(Boolean),
        localFeeCents: centsFromEuros(parseFloat(s.localFeeEur || '0')),
        localFreeThresholdCents: centsFromEuros(parseFloat(s.localFreeEur || '0')),
        postnlFeeCents: centsFromEuros(parseFloat(s.postnlFeeEur || '0')),
        postnlFreeThresholdCents: centsFromEuros(parseFloat(s.postnlFreeEur || '0')),
      });
      if (!res.ok) setError(res.message ?? 'Fout bij opslaan');
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2400);
      }
    });
  }

  return (
    <SectionCard title="Bezorging" onSave={save} pending={pending} saved={saved} error={error}>
      <div className="space-y-4">
        <Field label="Lokale postcodes" hint="Comma-separated. AMIS bezorgt alleen in deze postcode-prefixes lokaal.">
          <textarea
            value={s.localPostalCodes}
            onChange={(e) => setS({ ...s, localPostalCodes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-stone-200 text-sm font-mono"
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Lokaal: verzendkosten (€)">
            <Money value={s.localFeeEur} onChange={(v) => setS({ ...s, localFeeEur: v })} />
          </Field>
          <Field label="Lokaal: gratis vanaf (€)">
            <Money value={s.localFreeEur} onChange={(v) => setS({ ...s, localFreeEur: v })} />
          </Field>
          <Field label="PostNL: verzendkosten (€)">
            <Money value={s.postnlFeeEur} onChange={(v) => setS({ ...s, postnlFeeEur: v })} />
          </Field>
          <Field label="PostNL: gratis vanaf (€)">
            <Money value={s.postnlFreeEur} onChange={(v) => setS({ ...s, postnlFreeEur: v })} />
          </Field>
        </div>
      </div>
    </SectionCard>
  );
}

export function CompanyCard({ initial }: { initial: AllSettings['company'] }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    start(async () => {
      const res = await saveSettingAction('company', s);
      if (!res.ok) setError(res.message ?? 'Fout bij opslaan');
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2400);
      }
    });
  }

  return (
    <SectionCard title="Bedrijfsgegevens (facturen)" onSave={save} pending={pending} saved={saved} error={error}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Bedrijfsnaam"><Text value={s.name} onChange={(v) => setS({ ...s, name: v })} /></Field>
        <Field label="KvK-nummer"><Text value={s.kvk} onChange={(v) => setS({ ...s, kvk: v })} mono /></Field>
        <Field label="BTW-nummer"><Text value={s.btw} onChange={(v) => setS({ ...s, btw: v })} mono /></Field>
        <Field label="Adres"><Text value={s.address} onChange={(v) => setS({ ...s, address: v })} /></Field>
        <Field label="Contact email"><Text value={s.email} onChange={(v) => setS({ ...s, email: v })} type="email" /></Field>
        <Field label="Contact telefoon"><Text value={s.phone} onChange={(v) => setS({ ...s, phone: v })} type="tel" /></Field>
      </div>
    </SectionCard>
  );
}

export function EmailCard({ initial }: { initial: AllSettings['email'] }) {
  const [s, setS] = useState(initial);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    start(async () => {
      const res = await saveSettingAction('email', s);
      if (!res.ok) setError(res.message ?? 'Fout bij opslaan');
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2400);
      }
    });
  }

  return (
    <SectionCard title="Email" onSave={save} pending={pending} saved={saved} error={error}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="From-email"><Text value={s.fromEmail} onChange={(v) => setS({ ...s, fromEmail: v })} type="email" /></Field>
        <Field label="Reply-to email"><Text value={s.replyTo} onChange={(v) => setS({ ...s, replyTo: v })} type="email" /></Field>
      </div>
    </SectionCard>
  );
}

export function GeneralCard({ initial }: { initial: AllSettings['general'] }) {
  const [s, setS] = useState({
    vatRatePct: (initial.vatRate * 100).toFixed(0),
    lowStockThreshold: String(initial.lowStockThreshold),
  });
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function save() {
    start(async () => {
      const res = await saveSettingAction('general', {
        vatRate: parseFloat(s.vatRatePct) / 100,
        lowStockThreshold: parseInt(s.lowStockThreshold, 10) || 10,
      });
      if (!res.ok) setError(res.message ?? 'Fout bij opslaan');
      else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2400);
      }
    });
  }

  return (
    <SectionCard title="Algemeen" onSave={save} pending={pending} saved={saved} error={error}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="BTW-tarief (default %)" hint="Per-product overrides via product-edit.">
          <Text value={s.vatRatePct} onChange={(v) => setS({ ...s, vatRatePct: v })} mono type="number" />
        </Field>
        <Field label="Voorraad-warning drempel">
          <Text value={s.lowStockThreshold} onChange={(v) => setS({ ...s, lowStockThreshold: v })} mono type="number" />
        </Field>
      </div>
    </SectionCard>
  );
}

export function IntegrationsCard({ status }: { status: IntegrationStatus }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">Integraties (read-only)</h2>
      <ul className="space-y-3">
        <IntegrationRow
          name="Mollie"
          configured={status.mollie.configured}
          extra={status.mollie.mode ? `${status.mollie.mode.toUpperCase()} mode` : null}
          envHint="MOLLIE_API_KEY"
        />
        <IntegrationRow
          name="Sendcloud"
          configured={status.sendcloud.configured}
          envHint="SENDCLOUD_API_KEY + SENDCLOUD_API_SECRET"
        />
        <IntegrationRow
          name="Resend"
          configured={status.resend.configured}
          extra={status.resend.verifiedDomain ?? null}
          envHint="RESEND_API_KEY + RESEND_VERIFIED_DOMAIN"
        />
      </ul>
    </div>
  );
}

function IntegrationRow({
  name,
  configured,
  extra,
  envHint,
}: {
  name: string;
  configured: boolean;
  extra?: string | null;
  envHint?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-4 px-3 py-2 rounded-md bg-stone-50/60 border border-stone-100">
      <div className="flex items-center gap-3">
        {configured ? (
          <CheckCircle2 className="h-4 w-4 text-(--color-brand-yellow)" />
        ) : (
          <XCircle className="h-4 w-4 text-stone-400" />
        )}
        <div>
          <p className="font-medium text-sm text-stone-900">{name}</p>
          <p className="text-xs text-stone-500">
            {configured ? 'Verbonden' : 'Niet verbonden'}
            {extra && ` · ${extra}`}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-mono text-stone-400">{envHint}</span>
    </li>
  );
}

// ============================================================
// Field primitives
// ============================================================
function SectionCard({
  title,
  children,
  onSave,
  pending,
  saved,
  error,
}: {
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  pending: boolean;
  saved: boolean;
  error: string | null;
}) {
  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-4">{title}</h2>
      {children}
      <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
        <div className="text-xs text-stone-500">
          {saved && (
            <span className="text-(--color-brand-yellow) font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Opgeslagen
            </span>
          )}
          {error && <span className="text-red-600">{error}</span>}
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={pending}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-stone-900 text-white text-sm font-medium hover:bg-black disabled:opacity-60"
        >
          <Save className="h-3.5 w-3.5" />
          {pending ? 'Opslaan…' : 'Bewaar sectie'}
        </button>
      </div>
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

function Text({
  value,
  onChange,
  type = 'text',
  mono,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  mono?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'h-10 w-full px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-brand-yellow)',
        mono && 'font-mono',
      )}
    />
  );
}

function Money({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="number"
      step="0.01"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full px-3 rounded-md border border-stone-200 bg-white text-sm font-mono tabular-nums"
    />
  );
}
