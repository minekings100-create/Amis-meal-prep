'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Truck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { findOrderByTrackingNumberAction } from '@/app/admin/_actions/tracking-search';

type DateRange = 'today' | '7d' | '30d' | 'custom' | 'all';

export function OrdersFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();

  const initialSearch = params.get('q') ?? '';
  const [searchValue, setSearchValue] = useState(initialSearch);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastQRef = useRef(initialSearch);

  function updateParams(updater: (sp: URLSearchParams) => void) {
    const sp = new URLSearchParams(params.toString());
    updater(sp);
    sp.delete('page');
    start(() => router.replace(`${pathname}?${sp.toString()}`, { scroll: false }));
  }

  useEffect(() => {
    if (searchValue === lastQRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      lastQRef.current = searchValue;
      updateParams((sp) => {
        if (searchValue.trim()) sp.set('q', searchValue.trim());
        else sp.delete('q');
      });
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const dateRange: DateRange = (params.get('range') as DateRange) || 'all';
  const shippingMethod = params.get('method') ?? '';
  const minEur = params.get('min') ?? '';
  const maxEur = params.get('max') ?? '';

  const activeCount = useMemo(() => {
    let n = 0;
    if (params.get('q')) n++;
    if (params.get('range')) n++;
    if (params.get('method')) n++;
    if (params.get('min')) n++;
    if (params.get('max')) n++;
    return n;
  }, [params]);

  function setDateRange(value: DateRange) {
    updateParams((sp) => {
      if (value === 'all') {
        sp.delete('range');
        sp.delete('from');
        sp.delete('to');
      } else if (value === 'custom') {
        sp.set('range', 'custom');
      } else {
        sp.set('range', value);
        sp.delete('from');
        sp.delete('to');
      }
    });
  }

  function clearAll() {
    setSearchValue('');
    lastQRef.current = '';
    start(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Zoek op ordernummer, klant of email…"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-brand-yellow) focus:ring-2 focus:ring-(--color-brand-yellow-bright)/30"
          />
          {pending && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-stone-400">
              …
            </span>
          )}
        </div>

        {/* Date range */}
        <div className="md:col-span-3 flex gap-1 items-stretch">
          {(['today', '7d', '30d', 'all'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setDateRange(r)}
              className={cn(
                'flex-1 h-10 px-2 text-xs font-medium rounded-md border transition-colors',
                dateRange === r || (r === 'all' && !params.get('range'))
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50',
              )}
            >
              {r === 'today' ? 'Vandaag' : r === '7d' ? '7d' : r === '30d' ? '30d' : 'Alle'}
            </button>
          ))}
        </div>

        {/* Shipping method */}
        <div className="md:col-span-2">
          <select
            value={shippingMethod}
            onChange={(e) =>
              updateParams((sp) => {
                if (e.target.value) sp.set('method', e.target.value);
                else sp.delete('method');
              })
            }
            className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-(--color-brand-yellow)"
          >
            <option value="">Alle methodes</option>
            <option value="local">Lokaal</option>
            <option value="postnl">PostNL</option>
          </select>
        </div>

        {/* Amount range */}
        <div className="md:col-span-2 flex gap-1.5">
          <input
            type="number"
            value={minEur}
            onChange={(e) =>
              updateParams((sp) => {
                if (e.target.value) sp.set('min', e.target.value);
                else sp.delete('min');
              })
            }
            placeholder="€ min"
            className="w-full h-10 px-2.5 rounded-md border border-stone-200 bg-white text-sm font-mono tabular-nums focus:outline-none focus:border-(--color-brand-yellow)"
          />
          <input
            type="number"
            value={maxEur}
            onChange={(e) =>
              updateParams((sp) => {
                if (e.target.value) sp.set('max', e.target.value);
                else sp.delete('max');
              })
            }
            placeholder="€ max"
            className="w-full h-10 px-2.5 rounded-md border border-stone-200 bg-white text-sm font-mono tabular-nums focus:outline-none focus:border-(--color-brand-yellow)"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 gap-3">
        <TrackingNumberSearch />
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-stone-500 hover:text-stone-900"
          >
            <X className="h-3 w-3" />
            Wis filters ({activeCount})
          </button>
        )}
      </div>
    </div>
  );
}

function TrackingNumberSearch() {
  const [tn, setTn] = useState('');
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    if (!tn.trim()) return;
    start(async () => {
      const res = await findOrderByTrackingNumberAction(tn.trim());
      if (!res.ok && res.message) setError(res.message);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Truck className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
        <input
          type="text"
          value={tn}
          onChange={(e) => {
            setTn(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Zoek tracking nummer…"
          className="h-8 w-64 pl-8 pr-3 rounded-md border border-stone-200 text-xs font-mono focus:outline-none focus:border-(--color-brand-yellow)"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={pending || !tn.trim()}
        className="h-8 px-3 rounded-md bg-stone-900 text-white text-xs font-medium hover:bg-black disabled:opacity-50"
      >
        {pending ? 'Zoeken…' : 'Zoek'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
