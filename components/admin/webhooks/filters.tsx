'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { WebhookSource, WebhookStatus } from '@/lib/admin/webhooks';

const SOURCES: ReadonlyArray<WebhookSource> = ['mollie', 'sendcloud', 'resend'];
const STATUSES: ReadonlyArray<WebhookStatus> = ['received', 'processed', 'failed'];

export function WebhooksFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, start] = useTransition();
  const [search, setSearch] = useState(params.get('q') ?? '');
  const lastQ = useRef(params.get('q') ?? '');
  const debounce = useRef<NodeJS.Timeout | null>(null);

  function update(updater: (sp: URLSearchParams) => void) {
    const sp = new URLSearchParams(params.toString());
    updater(sp);
    start(() => router.replace(`${pathname}?${sp.toString()}`, { scroll: false }));
  }

  useEffect(() => {
    if (search === lastQ.current) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      lastQ.current = search;
      update((sp) => {
        if (search.trim()) sp.set('q', search.trim());
        else sp.delete('q');
      });
    }, 300);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const source = params.get('source') ?? '';
  const status = params.get('status') ?? '';

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op event_type, error of order…"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-brand-yellow)"
        />
      </div>
      <select
        value={source}
        onChange={(e) => update((sp) => (e.target.value ? sp.set('source', e.target.value) : sp.delete('source')))}
        className="h-10 px-3 rounded-md border border-stone-200 bg-white text-sm min-w-[140px]"
      >
        <option value="">Alle sources</option>
        {SOURCES.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => update((sp) => sp.delete('status'))}
          className={cn('h-10 px-3 rounded-md border text-xs font-medium', status === '' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-700 border-stone-200')}
        >
          Alle
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => update((sp) => sp.set('status', s))}
            className={cn(
              'h-10 px-3 rounded-md border text-xs font-medium capitalize',
              status === s
                ? s === 'failed'
                  ? 'bg-red-600 text-white border-red-600'
                  : s === 'processed'
                    ? 'bg-(--color-brand-black) text-white border-(--color-brand-yellow)'
                    : 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200',
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
