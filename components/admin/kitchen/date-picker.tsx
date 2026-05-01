'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const dateFmt = new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export function KitchenDatePicker({ date }: { date: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  function navigate(targetDate: string) {
    const sp = new URLSearchParams(params.toString());
    sp.set('date', targetDate);
    router.push(`${pathname}?${sp.toString()}`);
  }

  function shift(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    navigate(d.toISOString().slice(0, 10));
  }

  function goToday() {
    navigate(new Date().toISOString().slice(0, 10));
  }

  const formatted = dateFmt.format(new Date(date));
  const today = new Date().toISOString().slice(0, 10);
  const isToday = date === today;

  return (
    <div className="flex items-center gap-2 bg-white border border-stone-200 rounded-md p-1">
      <button
        type="button"
        onClick={() => shift(-1)}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
        aria-label="Vorige dag"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 px-2">
        <Calendar className="h-3.5 w-3.5 text-stone-400" />
        <input
          type="date"
          value={date}
          onChange={(e) => navigate(e.target.value)}
          className="text-sm font-medium text-stone-900 bg-transparent border-0 focus:outline-none cursor-pointer"
        />
        <span className="text-xs text-stone-500 hidden md:inline">{formatted}</span>
      </div>
      <button
        type="button"
        onClick={() => shift(1)}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-stone-600 hover:bg-stone-100"
        aria-label="Volgende dag"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={goToday}
          className="h-8 px-2 rounded-md text-xs font-medium text-(--color-accent) hover:bg-(--color-accent-bright)/15"
        >
          Vandaag
        </button>
      )}
    </div>
  );
}
