'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import type { Category } from '@/types/database';

export function ProductsFilterBar({ categories }: { categories: Category[] }) {
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

  const category = params.get('category') ?? '';
  const type = params.get('type') ?? '';

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[260px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Zoek op productnaam of slug…"
          className="w-full h-10 pl-9 pr-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-brand-yellow)"
        />
      </div>
      <select
        value={category}
        onChange={(e) => update((sp) => (e.target.value ? sp.set('category', e.target.value) : sp.delete('category')))}
        className="h-10 px-3 rounded-md border border-stone-200 bg-white text-sm min-w-[160px]"
      >
        <option value="">Alle categorieën</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name_nl}
          </option>
        ))}
      </select>
      <select
        value={type}
        onChange={(e) => update((sp) => (e.target.value ? sp.set('type', e.target.value) : sp.delete('type')))}
        className="h-10 px-3 rounded-md border border-stone-200 bg-white text-sm min-w-[140px]"
      >
        <option value="">Alle types</option>
        <option value="meal">Maaltijd</option>
        <option value="package">Pakket</option>
        <option value="tryout">Tryout</option>
      </select>
    </div>
  );
}
