'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MessageSquare, X, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import type { KitchenMealRow } from '@/lib/admin/kitchen';

export function KitchenTable({ rows }: { rows: KitchenMealRow[] }) {
  const [open, setOpen] = useState<KitchenMealRow | null>(null);

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
        <p className="text-stone-500">Geen orders te produceren voor deze datum.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-stone-50/50 border-b border-stone-200">
            <tr className="text-[11px] uppercase tracking-wider text-stone-500">
              <th className="text-left px-4 py-2.5 font-medium">Maaltijd</th>
              <th className="text-right px-3 py-2.5 font-medium">Te maken</th>
              <th className="text-right px-3 py-2.5 font-medium">Orders</th>
              <th className="text-center px-3 py-2.5 font-medium">Notities</th>
              <th className="px-3 py-2.5 w-[40px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.map((row) => (
              <tr
                key={row.productId || row.name}
                onClick={() => setOpen(row)}
                className="hover:bg-stone-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover bg-stone-100" />
                    ) : (
                      <div className="h-12 w-12 rounded-md bg-stone-100" />
                    )}
                    <p className="font-semibold text-stone-900">{row.name}</p>
                  </div>
                </td>
                <td className="px-3 py-3 text-right">
                  <span className="font-mono text-2xl tabular-nums font-bold text-stone-900">
                    {row.totalUnits}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-mono text-stone-600">{row.orderCount}</td>
                <td className="px-3 py-3 text-center">
                  {row.notesCount > 0 ? (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-semibold uppercase tracking-wider"
                      title={`${row.notesCount} order(s) met klant-opmerking`}
                    >
                      <MessageSquare className="h-3 w-3" /> {row.notesCount}
                    </span>
                  ) : (
                    <span className="text-stone-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <ChevronRight className="h-4 w-4 text-stone-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog.Root open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl focus:outline-none">
            <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-stone-200">
              <div className="flex items-center gap-3">
                {open?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={open.imageUrl} alt="" className="h-12 w-12 rounded-md object-cover" />
                )}
                <div>
                  <Dialog.Title className="text-xl font-bold text-stone-900">{open?.name}</Dialog.Title>
                  <p className="text-sm text-stone-500">
                    {open?.totalUnits} stuks in {open?.orderCount} orders
                  </p>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="divide-y divide-stone-100">
                {open?.ordersForMeal.map((o) => (
                  <li key={o.orderId} className="py-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/admin/orders/${o.orderId}`}
                          className="font-mono text-sm font-medium text-stone-900 hover:text-(--color-accent)"
                        >
                          {o.orderNumber}
                        </Link>
                        <p className="text-xs text-stone-500 mt-0.5">{o.customerName}</p>
                      </div>
                      <span className="font-mono tabular-nums text-stone-900 shrink-0">×{o.quantity}</span>
                    </div>
                    {o.customerNote && (
                      <p className={cn(
                        'mt-2 px-3 py-2 rounded-md text-xs leading-relaxed',
                        'bg-amber-50 border border-amber-200 text-amber-900',
                      )}>
                        <MessageSquare className="h-3 w-3 inline mr-1" />
                        {o.customerNote}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
