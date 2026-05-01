'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMoneyCents } from '@/lib/utils/money';
import { updateStockAction, toggleProductActiveAction } from '@/app/admin/_actions/stock';
import { LOW_STOCK_THRESHOLD } from '@/lib/admin/shared';
import type { StockRow } from '@/lib/admin/stock';

type RealtimeStatus = 'idle' | 'connecting' | 'live' | 'off';

export function StockTable({ initialRows }: { initialRows: StockRow[] }) {
  const [rows, setRows] = useState(initialRows);
  const [realtime, setRealtime] = useState<RealtimeStatus>('idle');

  // Sync server-rendered rows when filters change (incoming new prop list)
  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);

  // Supabase Realtime: listen for product UPDATE events and merge
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setRealtime('off');
      return;
    }
    let active = true;
    setRealtime('connecting');

    (async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const sb = createClient();
      const channel = sb
        .channel('admin-stock-watch')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'products' },
          (payload) => {
            const p = payload.new as { id: string; stock?: number; is_active?: boolean };
            if (!active) return;
            setRows((curr) =>
              curr.map((r) =>
                r.id === p.id
                  ? {
                      ...r,
                      stock: typeof p.stock === 'number' ? p.stock : r.stock,
                      isActive: typeof p.is_active === 'boolean' ? p.is_active : r.isActive,
                    }
                  : r,
              ),
            );
          },
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') setRealtime('live');
          else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') setRealtime('off');
        });

      return () => {
        active = false;
        sb.removeChannel(channel);
      };
    })();
  }, []);

  return (
    <div className="space-y-3">
      <RealtimeIndicator status={realtime} />
      <div className="rounded-xl border border-stone-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Product</th>
                <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Categorie</th>
                <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500 w-[140px]">Voorraad</th>
                <th className="text-right px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Verkocht 7d</th>
                <th className="text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500">Status</th>
                <th className="text-center px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500 w-[80px]">Actief</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-500">
                    Geen producten gevonden.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <ProductRow
                  key={row.id}
                  row={row}
                  onPatch={(patch) =>
                    setRows((curr) =>
                      curr.map((r) => (r.id === row.id ? { ...r, ...patch } : r)),
                    )
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  row,
  onPatch,
}: {
  row: StockRow;
  onPatch: (patch: Partial<StockRow>) => void;
}) {
  return (
    <tr className={cn('hover:bg-stone-50/60 transition-colors', !row.isActive && 'bg-stone-50/40 text-stone-500')}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {row.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.imageUrl}
              alt=""
              className="h-10 w-10 rounded-md object-cover bg-stone-100 shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-stone-100 shrink-0" />
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/products/${row.id}/edit`}
              className="font-medium text-stone-900 hover:text-[--color-accent] truncate block"
            >
              {row.name}
            </Link>
            <p className="text-[11px] text-stone-400 font-mono truncate">
              {row.slug} · {formatMoneyCents(row.priceCents)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium uppercase tracking-wider">
          {row.categoryName}
        </span>
      </td>
      <td className="px-3 py-3">
        <StockEditor
          productId={row.id}
          stock={row.stock}
          onChange={(newStock) => onPatch({ stock: newStock })}
        />
      </td>
      <td className="px-3 py-3 text-right font-mono tabular-nums text-stone-600">
        {row.sales7d}
      </td>
      <td className="px-3 py-3">
        <StockStatusPill stock={row.stock} isActive={row.isActive} />
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center justify-center">
          <ActiveToggle
            productId={row.id}
            initial={row.isActive}
            onChange={(v) => onPatch({ isActive: v })}
          />
        </div>
      </td>
    </tr>
  );
}

function StockEditor({
  productId,
  stock,
  onChange,
}: {
  productId: string;
  stock: number;
  onChange: (n: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(stock));
  const [pending, start] = useTransition();
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  // Re-sync draft when external stock changes (e.g. realtime update)
  useEffect(() => {
    if (!editing) setDraft(String(stock));
  }, [stock, editing]);

  function commit() {
    const n = parseInt(draft, 10);
    if (Number.isNaN(n) || n < 0) {
      setError('Ongeldig getal');
      return;
    }
    if (n === stock) {
      setEditing(false);
      return;
    }
    start(async () => {
      const res = await updateStockAction(productId, n);
      if (!res.ok) {
        setError(res.message ?? 'Fout bij opslaan');
        return;
      }
      onChange(n);
      setError(null);
      setEditing(false);
      setFlash(true);
      setTimeout(() => setFlash(false), 800);
    });
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="number"
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') {
              setEditing(false);
              setDraft(String(stock));
              setError(null);
            }
          }}
          onBlur={() => commit()}
          min={0}
          className={cn(
            'h-8 w-20 px-2 rounded-md border bg-white text-sm font-mono tabular-nums focus:outline-none focus:ring-2 focus:ring-[--color-accent-bright]/40',
            error ? 'border-red-300' : 'border-[--color-accent]',
          )}
        />
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-stone-400" />}
        {error && <span className="text-[11px] text-red-600">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono tabular-nums text-sm transition-all',
        'hover:bg-stone-100 hover:ring-1 hover:ring-stone-200',
        flash && 'bg-[--color-accent-bright]/30 ring-2 ring-[--color-accent]',
      )}
    >
      <span className={cn(stock === 0 && 'text-red-600', stock > 0 && stock < 10 && 'text-amber-700')}>
        {stock}
      </span>
      {flash && <Check className="h-3 w-3 text-[--color-accent]" />}
    </button>
  );
}

function StockStatusPill({ stock, isActive }: { stock: number; isActive: boolean }) {
  if (!isActive) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-stone-200 bg-stone-50 text-stone-500 text-[10px] font-semibold uppercase tracking-wider">
        Inactief
      </span>
    );
  }
  if (stock === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700 text-[10px] font-semibold uppercase tracking-wider">
        Uitverkocht
      </span>
    );
  }
  if (stock < LOW_STOCK_THRESHOLD) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-semibold uppercase tracking-wider">
        Laag
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-[--color-accent-bright]/30 bg-[--color-accent-bright]/15 text-[--color-accent] text-[10px] font-semibold uppercase tracking-wider">
      In voorraad
    </span>
  );
}

function ActiveToggle({
  productId,
  initial,
  onChange,
}: {
  productId: string;
  initial: boolean;
  onChange: (v: boolean) => void;
}) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();

  useEffect(() => setActive(initial), [initial]);

  function toggle() {
    const next = !active;
    setActive(next);
    start(async () => {
      const res = await toggleProductActiveAction(productId, next);
      if (!res.ok) {
        setActive(!next);
      } else {
        onChange(next);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      role="switch"
      aria-checked={active}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50',
        active ? 'bg-[--color-accent]' : 'bg-stone-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5',
          active ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

function RealtimeIndicator({ status }: { status: RealtimeStatus }) {
  const cfg = {
    idle: { label: 'Initialiseren…', dot: 'bg-stone-300' },
    connecting: { label: 'Verbinden…', dot: 'bg-amber-400 animate-pulse' },
    live: { label: 'Live — wijzigingen worden direct gedeeld', dot: 'bg-[--color-accent-bright] animate-pulse' },
    off: { label: 'Offline modus (geen Supabase)', dot: 'bg-stone-300' },
  } as const;
  const c = cfg[status];
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-xs text-stone-600">
      <span className={cn('h-2 w-2 rounded-full', c.dot)} />
      {c.label}
    </div>
  );
}
