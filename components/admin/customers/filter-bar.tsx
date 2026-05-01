'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export function CustomersFilterBar() {
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

  const filter = params.get('filter') ?? 'all';

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op naam of email…"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-[--color-accent]"
        />
      </div>
      <div className="flex gap-1.5">
        {(
          [
            { key: 'all', label: 'Allemaal' },
            { key: 'vip', label: 'VIP (>5)' },
            { key: 'new', label: 'Nieuw 30d' },
            { key: 'risk', label: 'Risico' },
          ] as const
        ).map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() =>
              update((sp) => {
                if (t.key === 'all') sp.delete('filter');
                else sp.set('filter', t.key);
              })
            }
            className={cn(
              'h-10 px-3 rounded-md border text-xs font-medium',
              filter === t.key || (filter === 'all' && t.key === 'all')
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
