'use client';

import { useMemo, useState } from 'react';
import { Plus, X, Search, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export interface PackageItem {
  meal_id: string;
  quantity: number;
  sort_order: number;
}

export interface MealOption {
  id: string;
  name: string;
  imageUrl: string | null;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export function PackageItemsSection({
  items,
  onChange,
  meals,
}: {
  items: PackageItem[];
  onChange: (items: PackageItem[]) => void;
  meals: MealOption[];
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const mealById = useMemo(() => new Map(meals.map((m) => [m.id, m])), [meals]);

  const filtered = useMemo(() => {
    const usedIds = new Set(items.map((i) => i.meal_id));
    let r = meals.filter((m) => !usedIds.has(m.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter((m) => m.name.toLowerCase().includes(q));
    }
    return r;
  }, [meals, items, search]);

  function addMeal(id: string) {
    onChange([
      ...items,
      { meal_id: id, quantity: 1, sort_order: items.length },
    ]);
    setSearch('');
    setSearchOpen(false);
  }

  function updateQty(idx: number, qty: number) {
    onChange(items.map((it, i) => (i === idx ? { ...it, quantity: Math.max(1, qty) } : it)));
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sort_order: i })));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((it, i) => ({ ...it, sort_order: i })));
  }

  // Aggregated macros (weighted by quantity)
  const totals = useMemo(() => {
    let totalMeals = 0;
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let withMacrosCount = 0;
    for (const it of items) {
      const meal = mealById.get(it.meal_id);
      if (!meal) continue;
      totalMeals += it.quantity;
      if (meal.kcal != null) {
        totalKcal += meal.kcal * it.quantity;
        totalProtein += (meal.protein_g ?? 0) * it.quantity;
        totalCarbs += (meal.carbs_g ?? 0) * it.quantity;
        totalFat += (meal.fat_g ?? 0) * it.quantity;
        withMacrosCount += it.quantity;
      }
    }
    const avgKcal = withMacrosCount > 0 ? Math.round(totalKcal / withMacrosCount) : null;
    const avgProtein = withMacrosCount > 0 ? Math.round(totalProtein / withMacrosCount) : null;
    const avgCarbs = withMacrosCount > 0 ? Math.round(totalCarbs / withMacrosCount) : null;
    const avgFat = withMacrosCount > 0 ? Math.round(totalFat / withMacrosCount) : null;
    return { totalMeals, avgKcal, avgProtein, avgCarbs, avgFat };
  }, [items, mealById]);

  return (
    <div className="space-y-4">
      {items.length === 0 && (
        <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
          Geen maaltijden toegevoegd. Klik &ldquo;Maaltijd toevoegen&rdquo;.
        </div>
      )}

      <ul className="space-y-2">
        {items.map((it, idx) => {
          const meal = mealById.get(it.meal_id);
          return (
            <li
              key={`${it.meal_id}-${idx}`}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragIdx !== null) reorder(dragIdx, idx);
                setDragIdx(null);
              }}
              className="flex items-center gap-3 px-3 py-2 rounded-md border border-stone-200 bg-white hover:border-stone-300"
            >
              <GripVertical className="h-4 w-4 text-stone-400 cursor-grab" />
              {meal?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={meal.imageUrl} alt="" className="h-9 w-9 rounded object-cover bg-stone-100" />
              ) : (
                <div className="h-9 w-9 rounded bg-stone-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-stone-900 truncate">
                  {meal?.name ?? '(onbekende maaltijd)'}
                </p>
                {meal?.kcal && (
                  <p className="text-[11px] text-stone-500 font-mono">
                    {meal.kcal} kcal · {meal.protein_g}g eiwit
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-stone-400">×</span>
                <input
                  type="number"
                  min={1}
                  value={it.quantity}
                  onChange={(e) => updateQty(idx, parseInt(e.target.value, 10) || 1)}
                  className="h-8 w-16 px-2 text-center font-mono tabular-nums rounded-md border border-stone-200"
                />
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                  aria-label="Verwijder"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {searchOpen ? (
        <div className="rounded-lg border border-[--color-accent] bg-white p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              autoFocus
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek een maaltijd…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:border-[--color-accent]"
            />
          </div>
          <ul className="max-h-56 overflow-y-auto divide-y divide-stone-100">
            {filtered.length === 0 && (
              <li className="py-3 text-center text-sm text-stone-400">Geen maaltijden gevonden.</li>
            )}
            {filtered.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => addMeal(m.id)}
                  className="w-full flex items-center gap-2 py-2 px-1 text-left hover:bg-stone-50 rounded"
                >
                  {m.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.imageUrl} alt="" className="h-8 w-8 rounded object-cover bg-stone-100" />
                  ) : (
                    <div className="h-8 w-8 rounded bg-stone-100" />
                  )}
                  <span className="text-sm flex-1 truncate">{m.name}</span>
                  <Plus className="h-3.5 w-3.5 text-stone-400" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearch('');
              }}
              className="text-xs text-stone-500 hover:text-stone-900 px-2"
            >
              Sluiten
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-dashed border-stone-300 bg-stone-50 text-sm text-stone-700 hover:bg-white hover:border-stone-400',
          )}
        >
          <Plus className="h-3.5 w-3.5" /> Maaltijd toevoegen
        </button>
      )}

      {/* Footer summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t border-stone-200">
        <SummaryStat label="Maaltijden" value={String(totals.totalMeals)} accent />
        <SummaryStat label="Gem. kcal" value={totals.avgKcal != null ? `${totals.avgKcal}` : '—'} />
        <SummaryStat label="Gem. eiwit" value={totals.avgProtein != null ? `${totals.avgProtein}g` : '—'} />
        <SummaryStat label="Gem. koolh." value={totals.avgCarbs != null ? `${totals.avgCarbs}g` : '—'} />
        <SummaryStat label="Gem. vet" value={totals.avgFat != null ? `${totals.avgFat}g` : '—'} />
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={cn('rounded-md px-3 py-2 border', accent ? 'border-[--color-accent-bright]/30 bg-[--color-accent-bright]/10' : 'border-stone-200 bg-stone-50')}>
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{label}</p>
      <p className="font-mono text-base tabular-nums text-stone-900 mt-0.5">{value}</p>
    </div>
  );
}
