'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { StockCategory } from '@/lib/admin/stock';

export function StockFilterBar({ categories }: { categories: StockCategory[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

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

  const lowOnly = params.get('filter') === 'low';
  const categoryId = params.get('category') ?? '';

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op productnaam of slug…"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-accent) focus:ring-2 focus:ring-(--color-accent-bright)/30"
        />
      </div>
      <select
        value={categoryId}
        onChange={(e) =>
          update((sp) => {
            if (e.target.value) sp.set('category', e.target.value);
            else sp.delete('category');
          })
        }
        className="h-10 px-3 rounded-md border border-stone-200 bg-white text-sm min-w-[160px] focus:outline-none focus:border-(--color-accent)"
      >
        <option value="">Alle categorieën</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() =>
          update((sp) => {
            if (lowOnly) sp.delete('filter');
            else sp.set('filter', 'low');
          })
        }
        className={cn(
          'inline-flex items-center gap-2 h-10 px-4 rounded-md border text-sm font-medium transition-colors',
          lowOnly
            ? 'border-amber-300 bg-amber-50 text-amber-800'
            : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50',
        )}
      >
        <AlertTriangle className="h-3.5 w-3.5" />
        Alleen lage voorraad
      </button>
      {pending && <span className="text-xs text-stone-400">…</span>}
    </div>
  );
}
