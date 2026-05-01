'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, X, RotateCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { replayWebhookAction } from '@/app/admin/_actions/webhooks';
import type { WebhookLogEntry } from '@/lib/admin/webhooks';

const dateFmt = new Intl.DateTimeFormat('nl-NL', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const sourceStyles = {
  mollie: 'bg-purple-100 text-purple-800 border-purple-200',
  sendcloud: 'bg-blue-100 text-blue-800 border-blue-200',
  resend: 'bg-stone-900 text-white border-stone-900',
};

export function WebhooksList({ rows }: { rows: WebhookLogEntry[] }) {
  const [open, setOpen] = useState<WebhookLogEntry | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="text-stone-500">Geen webhooks die aan de filters voldoen.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50/50 border-b border-stone-200">
            <tr className="text-[11px] uppercase tracking-wider text-stone-500">
              <th className="text-left px-4 py-2.5 font-medium w-[140px]">Tijdstip</th>
              <th className="text-left px-3 py-2.5 font-medium">Source</th>
              <th className="text-left px-3 py-2.5 font-medium">Event</th>
              <th className="text-left px-3 py-2.5 font-medium">Status</th>
              <th className="text-left px-3 py-2.5 font-medium">Order</th>
              <th className="px-3 py-2.5 w-[80px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((w) => (
              <tr key={w.id} className="hover:bg-stone-50/60">
                <td className="px-4 py-3 font-mono text-xs text-stone-600">
                  {dateFmt.format(new Date(w.receivedAt))}
                </td>
                <td className="px-3 py-3">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider', sourceStyles[w.source])}>
                    {w.source}
                  </span>
                </td>
                <td className="px-3 py-3 font-mono text-xs text-stone-700">{w.eventType ?? '—'}</td>
                <td className="px-3 py-3">
                  <StatusPill status={w.status} />
                  {w.errorMessage && (
                    <p className="text-[11px] text-red-600 mt-0.5 truncate max-w-[280px]" title={w.errorMessage}>
                      {w.errorMessage}
                    </p>
                  )}
                </td>
                <td className="px-3 py-3">
                  {w.relatedOrderId && w.relatedOrderNumber ? (
                    <Link
                      href={`/admin/orders/${w.relatedOrderId}`}
                      className="font-mono text-xs text-[--color-accent] hover:underline"
                    >
                      {w.relatedOrderNumber}
                    </Link>
                  ) : (
                    <span className="text-stone-400 text-xs">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setOpen(w)}
                    className="inline-flex items-center gap-1 h-7 px-2 rounded text-xs text-stone-600 hover:bg-stone-100"
                  >
                    <Eye className="h-3 w-3" /> Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DetailsDialog entry={open} onClose={() => setOpen(null)} />
    </>
  );
}

function StatusPill({ status }: { status: WebhookLogEntry['status'] }) {
  if (status === 'processed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[--color-accent-bright]/15 text-[--color-accent] border border-[--color-accent-bright]/30 text-[10px] font-semibold uppercase tracking-wider">
        <CheckCircle2 className="h-3 w-3" /> Processed
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-semibold uppercase tracking-wider">
        <XCircle className="h-3 w-3" /> Failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 text-[10px] font-semibold uppercase tracking-wider">
      <Clock className="h-3 w-3" /> Received
    </span>
  );
}

function DetailsDialog({ entry, onClose }: { entry: WebhookLogEntry | null; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<string | null>(null);

  function replay() {
    if (!entry) return;
    start(async () => {
      const res = await replayWebhookAction(entry.id);
      setResult(res.message ?? (res.ok ? 'Replay gestart' : 'Fout'));
      setTimeout(() => setResult(null), 3000);
    });
  }

  return (
    <Dialog.Root open={!!entry} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-stone-200">
            <div>
              <Dialog.Title className="text-lg font-bold text-stone-900">
                {entry?.source.toUpperCase()} · {entry?.eventType ?? '(no event type)'}
              </Dialog.Title>
              {entry && (
                <p className="text-xs text-stone-500 font-mono mt-1">
                  Received: {dateFmt.format(new Date(entry.receivedAt))}
                  {entry.processedAt && ` → Processed: ${dateFmt.format(new Date(entry.processedAt))}`}
                </p>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {entry?.errorMessage && (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                <p className="font-semibold mb-0.5">Error</p>
                <p className="font-mono text-xs">{entry.errorMessage}</p>
              </div>
            )}
            {entry?.relatedOrderId && entry?.relatedOrderNumber && (
              <p className="text-sm">
                Related order:{' '}
                <Link href={`/admin/orders/${entry.relatedOrderId}`} className="font-mono text-[--color-accent] hover:underline">
                  {entry.relatedOrderNumber}
                </Link>
              </p>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">Payload</p>
              <pre className="rounded-md bg-stone-900 text-stone-100 p-3 text-[11px] font-mono overflow-x-auto max-h-80 overflow-y-auto">
{JSON.stringify(entry?.payload, null, 2)}
              </pre>
            </div>
            {result && <p className="text-sm text-[--color-accent]">{result}</p>}
          </div>
          <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/50">
            {entry?.status === 'failed' ? (
              <button
                onClick={replay}
                disabled={pending}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-amber-600 text-white text-sm font-medium hover:bg-amber-700 disabled:opacity-60"
              >
                <RotateCw className={cn('h-3.5 w-3.5', pending && 'animate-spin')} />
                {pending ? 'Bezig…' : 'Replay webhook'}
              </button>
            ) : (
              <span className="text-xs text-stone-400">Replay alleen beschikbaar voor failed webhooks</span>
            )}
            <Dialog.Close asChild>
              <button className="h-9 px-4 rounded-md border border-stone-200 text-sm hover:bg-stone-100">
                Sluiten
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
