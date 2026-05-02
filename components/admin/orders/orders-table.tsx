'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowDown, ArrowUp, MoreHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatMoneyCents } from '@/lib/utils/money';
import { PaymentPill, ShippingPill } from './status-pills';
import type { OrdersListRow, OrdersSortKey, SortDir } from '@/lib/admin/orders';

const COLUMNS: Array<{
  key: 'select' | 'order_number' | 'created_at' | 'customer' | 'location' | 'items' | 'total_cents' | 'payment' | 'shipping' | 'actions';
  label: string;
  sort?: OrdersSortKey;
  align?: 'left' | 'right';
  className?: string;
}> = [
  { key: 'select', label: '', className: 'w-10' },
  { key: 'order_number', label: 'Order', className: 'min-w-[110px]' },
  { key: 'created_at', label: 'Datum', sort: 'created_at', className: 'min-w-[110px]' },
  { key: 'customer', label: 'Klant', sort: 'shipping_last_name', className: 'min-w-[200px]' },
  { key: 'location', label: 'Locatie', className: 'min-w-[120px]' },
  { key: 'items', label: 'Items', className: 'min-w-[140px]' },
  { key: 'total_cents', label: 'Bedrag', sort: 'total_cents', align: 'right', className: 'min-w-[100px]' },
  { key: 'payment', label: 'Betaling' },
  { key: 'shipping', label: 'Verzending' },
  { key: 'actions', label: '', className: 'w-12' },
];

const relTime = new Intl.RelativeTimeFormat('nl-NL', { numeric: 'auto' });
function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60000);
  if (m < 60) return relTime.format(-m, 'minute');
  const h = Math.round(m / 60);
  if (h < 24) return relTime.format(-h, 'hour');
  const d = Math.round(h / 24);
  return relTime.format(-d, 'day');
}
const fullDate = new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium', timeStyle: 'short' });

interface OrdersTableProps {
  rows: OrdersListRow[];
  total: number;
  sort: OrdersSortKey;
  dir: SortDir;
  page: number;
  pageSize: 25 | 50 | 100;
  isOwner: boolean;
}

export function OrdersTable({
  rows,
  total,
  sort,
  dir,
  page,
  pageSize,
  isOwner,
}: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(rows.map((r) => r.id)));
  }
  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function sortHref(col: OrdersSortKey): string {
    const sp = new URLSearchParams(searchParams.toString());
    const isCurrent = sort === col;
    const nextDir: SortDir = isCurrent && dir === 'desc' ? 'asc' : 'desc';
    sp.set('sort', col);
    sp.set('dir', nextDir);
    sp.delete('page');
    return `${pathname}?${sp.toString()}`;
  }

  function pageSizeChange(size: number) {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('pageSize', String(size));
    sp.delete('page');
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  function pageHref(p: number): string {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set('page', String(p));
    return `${pathname}?${sp.toString()}`;
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="space-y-3">
      <SelectionBar selected={selected} onClear={() => setSelected(new Set())} isOwner={isOwner} />

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-stone-50/50 border-b border-stone-200">
              <tr>
                {COLUMNS.map((col) => {
                  const sortable = !!col.sort;
                  const isActive = col.sort === sort;
                  return (
                    <th
                      key={col.key}
                      className={cn(
                        'text-left px-3 py-2.5 font-medium text-[11px] uppercase tracking-wider text-stone-500',
                        col.align === 'right' && 'text-right',
                        col.className,
                        col.key === 'select' && 'sticky left-0 bg-stone-50/95 backdrop-blur z-10',
                      )}
                    >
                      {col.key === 'select' ? (
                        <input
                          type="checkbox"
                          aria-label="Selecteer alle"
                          checked={allSelected}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-stone-300 text-(--color-brand-yellow) focus:ring-(--color-brand-yellow-bright)/40"
                        />
                      ) : sortable ? (
                        <Link
                          href={sortHref(col.sort!)}
                          className={cn(
                            'inline-flex items-center gap-1 hover:text-stone-900 transition-colors',
                            isActive && 'text-stone-900',
                          )}
                        >
                          {col.label}
                          {isActive ? (
                            dir === 'asc' ? (
                              <ArrowUp className="h-3 w-3" />
                            ) : (
                              <ArrowDown className="h-3 w-3" />
                            )
                          ) : (
                            <ArrowDown className="h-3 w-3 opacity-20" />
                          )}
                        </Link>
                      ) : (
                        col.label
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length} className="px-3 py-12 text-center text-stone-500">
                    Geen bestellingen gevonden.
                  </td>
                </tr>
              )}
              {rows.map((row) => {
                const isChecked = selected.has(row.id);
                return (
                  <tr
                    key={row.id}
                    onClick={() => router.push(`/admin/orders/${row.id}`)}
                    className={cn(
                      'group cursor-pointer hover:bg-stone-50 transition-colors',
                      isChecked && 'bg-(--color-brand-yellow-bright)/5',
                    )}
                  >
                    <td className="px-3 py-3 sticky left-0 bg-white group-hover:bg-stone-50 z-10">
                      <input
                        type="checkbox"
                        aria-label={`Selecteer ${row.orderNumber}`}
                        checked={isChecked}
                        onChange={() => toggleOne(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-stone-300 text-(--color-brand-yellow)"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/admin/orders/${row.id}`}
                        className="font-mono text-sm font-medium text-stone-900 hover:text-(--color-brand-yellow)"
                      >
                        {row.orderNumber}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-stone-600" title={fullDate.format(new Date(row.createdAt))}>
                      {timeAgo(row.createdAt)}
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium text-stone-900 leading-tight">
                        {row.customerName}
                      </div>
                      <div className="text-xs text-stone-500 leading-tight">{row.customerEmail}</div>
                    </td>
                    <td className="px-3 py-3">
                      {row.isLocal ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-(--color-brand-yellow-bright)/15 text-(--color-brand-yellow) text-[10px] font-bold uppercase tracking-wider border border-(--color-brand-yellow-bright)/30">
                          📍 Maastricht
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-stone-600">
                          <span className="inline-block">🇳🇱</span>
                          {row.city}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <ItemThumbs thumbs={row.itemThumbs} count={row.itemCount} />
                    </td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums font-medium text-stone-900">
                      {formatMoneyCents(row.totalCents)}
                    </td>
                    <td className="px-3 py-3">
                      <PaymentPill status={row.paymentStatus} />
                    </td>
                    <td className="px-3 py-3">
                      <ShippingPill status={row.shippingStatus} />
                    </td>
                    <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                      <RowActionsMenu orderId={row.id} isOwner={isOwner} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50/40">
          <div className="flex items-center gap-3 text-xs text-stone-600">
            <span>
              {from}–{to} van <span className="font-mono">{total}</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span>Per pagina:</span>
              {[25, 50, 100].map((s) => (
                <button
                  key={s}
                  onClick={() => pageSizeChange(s)}
                  className={cn(
                    'h-6 px-2 rounded text-[11px] font-mono',
                    pageSize === s
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-200',
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <PageButton href={pageHref(Math.max(1, page - 1))} disabled={page <= 1} label="← Vorige" />
            <span className="text-xs text-stone-500 px-2 font-mono">
              {page} / {totalPages}
            </span>
            <PageButton href={pageHref(Math.min(totalPages, page + 1))} disabled={page >= totalPages} label="Volgende →" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PageButton({ href, disabled, label }: { href: string; disabled: boolean; label: string }) {
  if (disabled) {
    return (
      <span className="h-7 px-2.5 inline-flex items-center text-xs text-stone-300 cursor-not-allowed">
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className="h-7 px-2.5 inline-flex items-center rounded text-xs text-stone-600 hover:bg-stone-200"
    >
      {label}
    </Link>
  );
}

function ItemThumbs({ thumbs, count }: { thumbs: string[]; count: number }) {
  const remaining = Math.max(0, count - thumbs.length);
  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-2">
        {thumbs.slice(0, 4).map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            className="h-7 w-7 rounded-md object-cover ring-2 ring-white bg-stone-100"
          />
        ))}
        {thumbs.length === 0 && (
          <div className="h-7 w-7 rounded-md bg-stone-100 inline-flex items-center justify-center text-[10px] text-stone-400">
            —
          </div>
        )}
      </div>
      {remaining > 0 && (
        <span className="text-xs text-stone-500 font-mono">+{remaining}</span>
      )}
      <span className="text-xs text-stone-400 ml-1">·{count}x</span>
    </div>
  );
}

function RowActionsMenu({ orderId, isOwner }: { orderId: string; isOwner: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-500 hover:bg-stone-200 hover:text-stone-900"
        aria-label="Acties"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-30 w-48 rounded-lg border border-stone-200 bg-white shadow-lg py-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          <Link
            href={`/admin/orders/${orderId}`}
            className="block px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
          >
            Bekijk order
          </Link>
          <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
            Markeer verzonden
          </button>
          <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
            Email klant
          </button>
          {isOwner && (
            <>
              <div className="border-t border-stone-100 my-1" />
              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                Refund initiëren
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function SelectionBar({
  selected,
  onClear,
  isOwner,
}: {
  selected: Set<string>;
  onClear: () => void;
  isOwner: boolean;
}) {
  const [open, setOpen] = useState(false);
  const count = selected.size;

  return (
    <div className="flex items-center justify-between bg-stone-50 border border-stone-200 rounded-lg px-4 py-2.5">
      <div className="text-sm text-stone-600">
        {count > 0 ? (
          <>
            <span className="font-mono font-medium text-stone-900">{count}</span> geselecteerd ·{' '}
            <button onClick={onClear} className="text-stone-500 hover:text-stone-900 underline">
              wis selectie
            </button>
          </>
        ) : (
          <span className="text-stone-400">Selecteer rijen voor bulk-acties</span>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          disabled={count === 0}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-4 rounded-md border text-sm font-medium transition-colors',
            count === 0
              ? 'border-stone-200 bg-white text-stone-400 cursor-not-allowed'
              : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50',
          )}
        >
          Bulk acties
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {open && count > 0 && (
          <div
            className="absolute right-0 top-full mt-1 z-30 w-56 rounded-lg border border-stone-200 bg-white shadow-lg py-1"
            onMouseDown={(e) => e.preventDefault()}
          >
            <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
              Markeer als verzonden
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
              Print labels (PDF)
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
              Export CSV
            </button>
            {isOwner && (
              <>
                <div className="border-t border-stone-100 my-1" />
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  Annuleer selectie
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
