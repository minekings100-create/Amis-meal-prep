'use client';

import { useMemo, useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, X, PackagePlus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { batchAddStockAction } from '@/app/admin/_actions/stock';
import type { StockRow } from '@/lib/admin/stock';

export function ProductionUpdateDialog({ rows }: { rows: StockRow[] }) {
  const [open, setOpen] = useState(false);
  const [additions, setAdditions] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q));
  }, [rows, search]);

  const totalAdded = useMemo(
    () =>
      Object.entries(additions).reduce((acc, [, v]) => {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n > 0 ? acc + n : acc;
      }, 0),
    [additions],
  );

  const productCount = useMemo(
    () =>
      Object.values(additions).filter((v) => {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n > 0;
      }).length,
    [additions],
  );

  function setAddition(id: string, value: string) {
    setAdditions((curr) => {
      if (!value || value === '0') {
        const next = { ...curr };
        delete next[id];
        return next;
      }
      return { ...curr, [id]: value };
    });
  }

  function reset() {
    setAdditions({});
    setSearch('');
  }

  function submit() {
    const payload: Array<{ productId: string; addQuantity: number }> = Object.entries(additions)
      .map(([productId, raw]) => ({ productId, addQuantity: parseInt(raw, 10) }))
      .filter((a) => Number.isFinite(a.addQuantity) && a.addQuantity > 0);
    if (payload.length === 0) return;
    start(async () => {
      const res = await batchAddStockAction(payload);
      if (res.ok) {
        reset();
        setOpen(false);
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <Dialog.Trigger asChild>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-(--color-accent) text-white text-sm font-medium hover:bg-(--color-accent)/90">
          <PackagePlus className="h-4 w-4" />
          Bijwerken na productie
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in" />
        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-2xl max-h-[88vh] flex flex-col rounded-2xl bg-white shadow-2xl focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-stone-200">
            <div>
              <Dialog.Title className="text-xl font-bold text-stone-900">
                Voorraad bijwerken na productie
              </Dialog.Title>
              <Dialog.Description className="text-sm text-stone-500 mt-1">
                Vul per product in hoeveel je hebt toegevoegd. Lege velden worden overgeslagen.
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-100">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-stone-100">
            <input
              type="search"
              placeholder="Filter op naam…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-stone-200 bg-stone-50/50 text-sm focus:outline-none focus:border-(--color-accent) focus:bg-white"
            />
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto px-6 py-2">
            <ul className="divide-y divide-stone-100">
              {filtered.length === 0 && (
                <li className="py-8 text-center text-sm text-stone-400">Geen producten.</li>
              )}
              {filtered.map((row) => {
                const value = additions[row.id] ?? '';
                const n = parseInt(value, 10);
                const valid = Number.isFinite(n) && n > 0;
                return (
                  <li key={row.id} className="flex items-center gap-3 py-2.5">
                    {row.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={row.imageUrl}
                        alt=""
                        className="h-8 w-8 rounded-md object-cover bg-stone-100 shrink-0"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-md bg-stone-100 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-900 truncate leading-tight">
                        {row.name}
                      </p>
                      <p className="text-xs text-stone-500 leading-tight font-mono">
                        Huidig: <span className="text-stone-900">{row.stock}</span>
                        {valid && (
                          <>
                            {' '}→{' '}
                            <span className="text-(--color-accent) font-semibold">
                              {row.stock + n}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-stone-400 text-sm">+</span>
                      <input
                        type="number"
                        min={0}
                        value={value}
                        onChange={(e) => setAddition(row.id, e.target.value)}
                        placeholder="0"
                        className={cn(
                          'h-9 w-20 px-2 rounded-md border bg-white text-sm font-mono tabular-nums text-right focus:outline-none focus:ring-2 focus:ring-(--color-accent-bright)/30',
                          valid ? 'border-(--color-accent)' : 'border-stone-200',
                        )}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-t border-stone-200 bg-stone-50/50">
            <div className="text-sm text-stone-600">
              {productCount > 0 ? (
                <>
                  <span className="font-mono font-semibold text-stone-900">{totalAdded}</span> stuks
                  in <span className="font-mono">{productCount}</span> {productCount === 1 ? 'product' : 'producten'}
                </>
              ) : (
                <span className="text-stone-400">Vul één of meer aantallen in</span>
              )}
            </div>
            <div className="flex gap-2">
              <Dialog.Close asChild>
                <button className="h-10 px-4 rounded-md border border-stone-200 text-sm hover:bg-white">
                  Annuleren
                </button>
              </Dialog.Close>
              <button
                onClick={submit}
                disabled={productCount === 0 || pending}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-md bg-(--color-accent) text-white font-semibold text-sm hover:bg-(--color-accent)/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
                {pending ? 'Toevoegen…' : 'Voeg alle toe'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
