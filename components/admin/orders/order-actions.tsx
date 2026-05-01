'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Truck, PackageCheck, RotateCcw, Mail, XCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMoneyCents } from '@/lib/utils/money';
import {
  createSendcloudLabelAction,
  markOrderShippedAction,
  markOrderDeliveredAction,
  refundOrderAction,
  emailCustomerAction,
  cancelOrderAction,
} from '@/app/admin/_actions/orders';
import type { OrderDetail } from '@/lib/admin/order-detail';

export function OrderActions({ order, isOwner }: { order: OrderDetail; isOwner: boolean }) {
  const isShipped = order.status === 'shipped' || order.status === 'delivered';
  const isDelivered = order.status === 'delivered';
  const isClosed = order.status === 'cancelled' || order.status === 'refunded';

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4">Acties</h3>
      <div className="space-y-2">
        {!isShipped && !isClosed && order.shipping.method === 'postnl' && (
          <SendcloudLabelButton orderId={order.id} address={order.shipping} customerName={`${order.customer.firstName} ${order.customer.lastName}`} />
        )}
        {!isShipped && !isClosed && order.shipping.method === 'local' && (
          <SimpleActionButton
            label="Markeer als verzonden"
            icon={Truck}
            action={() => markOrderShippedAction(order.id)}
          />
        )}
        {isShipped && !isDelivered && !isClosed && (
          <SimpleActionButton
            label="Markeer als geleverd"
            icon={PackageCheck}
            tone="primary"
            action={() => markOrderDeliveredAction(order.id)}
          />
        )}
        <EmailCustomerButton orderId={order.id} />
        {isOwner && !isClosed && (
          <RefundButton orderId={order.id} totalCents={order.totals.totalCents} />
        )}
        {isOwner && !isClosed && <CancelButton orderId={order.id} />}
      </div>
    </div>
  );
}

// ============================================================
// Action buttons
// ============================================================
function SimpleActionButton({
  label,
  icon: Icon,
  action,
  tone = 'default',
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => Promise<{ ok: boolean; message?: string }>;
  tone?: 'default' | 'primary' | 'danger';
}) {
  const [pending, start] = useTransition();
  const styles =
    tone === 'primary'
      ? 'bg-[--color-accent] text-white hover:bg-[--color-accent]/90'
      : tone === 'danger'
        ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
        : 'bg-stone-100 text-stone-800 hover:bg-stone-200';

  return (
    <button
      type="button"
      onClick={() => start(() => action().then(() => undefined))}
      disabled={pending}
      className={cn(
        'w-full inline-flex items-center justify-start gap-2.5 h-10 px-3 rounded-md text-sm font-medium transition-colors disabled:opacity-60',
        styles,
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{pending ? 'Bezig…' : label}</span>
    </button>
  );
}

function SendcloudLabelButton({
  orderId,
  address,
  customerName,
}: {
  orderId: string;
  address: OrderDetail['shipping'];
  customerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    setError(null);
    start(async () => {
      const res = await createSendcloudLabelAction(orderId);
      if (!res.ok) setError(res.message ?? 'Onbekende fout');
      else setOpen(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="w-full inline-flex items-center justify-start gap-2.5 h-10 px-3 rounded-md text-sm font-medium bg-stone-900 text-white hover:bg-black"
        >
          <Truck className="h-4 w-4 shrink-0" />
          Sendcloud label aanmaken
        </button>
      </Dialog.Trigger>
      <DialogShell title="Sendcloud verzendlabel">
        <p className="text-sm text-stone-600 mb-4">
          Genereer een PostNL label via Sendcloud. Order wordt automatisch op{' '}
          <span className="font-medium">verzonden</span> gezet.
        </p>
        <div className="rounded-md bg-stone-50 border border-stone-200 p-4 space-y-1 text-sm">
          <div className="font-medium text-stone-900">{customerName}</div>
          <div className="text-stone-600">
            {address.street} {address.houseNumber}
          </div>
          <div className="text-stone-600">
            <span className="font-mono">{address.postalCode}</span> {address.city}
          </div>
          <div className="text-stone-500 text-xs">{address.country}</div>
        </div>
        {error && (
          <div className="mt-3 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <Dialog.Close asChild>
            <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-50">
              Annuleren
            </button>
          </Dialog.Close>
          <button
            onClick={confirm}
            disabled={pending}
            className="h-10 px-4 rounded-md bg-[--color-accent-bright] text-stone-900 font-semibold text-sm hover:bg-[--color-accent] hover:text-white disabled:opacity-60"
          >
            {pending ? 'Bezig…' : 'Label genereren'}
          </button>
        </div>
      </DialogShell>
    </Dialog.Root>
  );
}

function RefundButton({ orderId, totalCents }: { orderId: string; totalCents: number }) {
  const [open, setOpen] = useState(false);
  const [amountEur, setAmountEur] = useState((totalCents / 100).toFixed(2));
  const [reason, setReason] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function confirm() {
    const cents = Math.round(parseFloat(amountEur) * 100);
    if (!Number.isFinite(cents) || cents <= 0) {
      setError('Vul een geldig bedrag in');
      return;
    }
    if (cents > totalCents) {
      setError('Bedrag mag niet hoger zijn dan ordertotaal');
      return;
    }
    setError(null);
    start(async () => {
      const res = await refundOrderAction(orderId, cents, reason);
      if (!res.ok) setError(res.message ?? 'Onbekende fout');
      else setOpen(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="w-full inline-flex items-center justify-start gap-2.5 h-10 px-3 rounded-md text-sm font-medium border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
        >
          <RotateCcw className="h-4 w-4 shrink-0" />
          Refund initiëren
        </button>
      </Dialog.Trigger>
      <DialogShell title="Refund initiëren">
        <p className="text-sm text-stone-600 mb-4">
          Mollie refund. Order-totaal: <span className="font-mono">{formatMoneyCents(totalCents)}</span>
        </p>
        <label className="block mb-3">
          <span className="block text-xs font-medium text-stone-700 mb-1">Bedrag (€)</span>
          <input
            type="number"
            step="0.01"
            value={amountEur}
            onChange={(e) => setAmountEur(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-stone-200 font-mono tabular-nums focus:outline-none focus:border-[--color-accent]"
          />
        </label>
        <label className="block mb-3">
          <span className="block text-xs font-medium text-stone-700 mb-1">Reden (optioneel)</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Bijv. klant niet thuis, product beschadigd…"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-[--color-accent]"
          />
        </label>
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700 mb-3">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-50">
              Annuleren
            </button>
          </Dialog.Close>
          <button
            onClick={confirm}
            disabled={pending}
            className="h-10 px-4 rounded-md bg-amber-600 text-white font-semibold text-sm hover:bg-amber-700 disabled:opacity-60"
          >
            {pending ? 'Refunden…' : 'Bevestig refund'}
          </button>
        </div>
      </DialogShell>
    </Dialog.Root>
  );
}

function EmailCustomerButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [template, setTemplate] = useState<'order-confirmation' | 'delay' | 'question'>(
    'order-confirmation',
  );
  const [pending, start] = useTransition();

  function confirm() {
    start(async () => {
      await emailCustomerAction(orderId, template);
      setOpen(false);
    });
  }

  const templates = [
    { value: 'order-confirmation', label: 'Bevestiging opnieuw versturen' },
    { value: 'delay', label: 'Vertraging melden' },
    { value: 'question', label: 'Vraag aan klant' },
  ] as const;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="w-full inline-flex items-center justify-start gap-2.5 h-10 px-3 rounded-md text-sm font-medium bg-stone-100 text-stone-800 hover:bg-stone-200"
        >
          <Mail className="h-4 w-4 shrink-0" />
          Email klant
        </button>
      </Dialog.Trigger>
      <DialogShell title="Email klant">
        <p className="text-sm text-stone-600 mb-4">Kies een template:</p>
        <div className="space-y-2 mb-5">
          {templates.map((t) => (
            <label
              key={t.value}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-md border cursor-pointer transition-colors',
                template === t.value
                  ? 'border-[--color-accent] bg-[--color-accent-bright]/10'
                  : 'border-stone-200 hover:bg-stone-50',
              )}
            >
              <input
                type="radio"
                name="email-template"
                value={t.value}
                checked={template === t.value}
                onChange={() => setTemplate(t.value)}
                className="text-[--color-accent]"
              />
              <span className="text-sm text-stone-900">{t.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-50">
              Annuleren
            </button>
          </Dialog.Close>
          <button
            onClick={confirm}
            disabled={pending}
            className="h-10 px-4 rounded-md bg-[--color-accent-bright] text-stone-900 font-semibold text-sm hover:bg-[--color-accent] hover:text-white disabled:opacity-60"
          >
            {pending ? 'Versturen…' : 'Verstuur'}
          </button>
        </div>
      </DialogShell>
    </Dialog.Root>
  );
}

function CancelButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, start] = useTransition();

  function confirm() {
    start(async () => {
      await cancelOrderAction(orderId, reason);
      setOpen(false);
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="w-full inline-flex items-center justify-start gap-2.5 h-10 px-3 rounded-md text-sm font-medium border border-red-200 text-red-700 bg-white hover:bg-red-50"
        >
          <XCircle className="h-4 w-4 shrink-0" />
          Annuleer order
        </button>
      </Dialog.Trigger>
      <DialogShell title="Annuleer deze order?">
        <p className="text-sm text-stone-600 mb-4">
          Order wordt op <span className="font-semibold">geannuleerd</span> gezet. Voorraad wordt
          niet automatisch teruggezet — controleer dit handmatig in voorraad-overzicht.
        </p>
        <label className="block mb-3">
          <span className="block text-xs font-medium text-stone-700 mb-1">Reden</span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Bijv. klantverzoek, dubbele bestelling, voorraadprobleem…"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:border-[--color-accent]"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-50">
              Niet annuleren
            </button>
          </Dialog.Close>
          <button
            onClick={confirm}
            disabled={pending}
            className="h-10 px-4 rounded-md bg-red-600 text-white font-semibold text-sm hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Annuleren…' : 'Bevestig annulering'}
          </button>
        </div>
      </DialogShell>
    </Dialog.Root>
  );
}

function DialogShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
      <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md rounded-2xl bg-white shadow-2xl p-6 focus:outline-none">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Dialog.Title className="text-lg font-bold text-stone-900">{title}</Dialog.Title>
          <Dialog.Close asChild>
            <button
              aria-label="Sluit"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

