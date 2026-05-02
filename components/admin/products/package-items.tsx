'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, X, Search, GripVertical } from 'lucide-react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils/cn';
import { formatMoneyCents } from '@/lib/utils/money';

export interface PackageItem {
  meal_id: string;
  quantity: number;
  sort_order: number;
}

export interface MealOption {
  id: string;
  name: string;
  imageUrl: string | null;
  priceCents: number;
  kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
}

export function PackageItemsSection({
  items,
  onChange,
  meals,
  packagePriceCents,
}: {
  items: PackageItem[];
  onChange: (items: PackageItem[]) => void;
  meals: MealOption[];
  /** Live package price from the form, used to compute savings vs the
   *  individual sum of selected meals. */
  packagePriceCents?: number;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  // Debounce the search input so we don't refilter on every keystroke
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(searchInput), 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

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
    onChange([...items, { meal_id: id, quantity: 1, sort_order: items.length }]);
    setSearchInput('');
    setSearch('');
    setSearchOpen(false);
  }

  function updateQty(idx: number, qty: number) {
    onChange(
      items.map((it, i) =>
        i === idx ? { ...it, quantity: Math.max(1, Math.min(10, qty)) } : it,
      ),
    );
  }

  function remove(idx: number) {
    onChange(items.filter((_, i) => i !== idx).map((it, i) => ({ ...it, sort_order: i })));
  }

  // dnd-kit sensors — pointer for mouse/touch, keyboard for accessibility
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((it, i) => `${it.meal_id}-${i}` === active.id);
    const newIdx = items.findIndex((it, i) => `${it.meal_id}-${i}` === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const moved = arrayMove(items, oldIdx, newIdx).map((it, i) => ({ ...it, sort_order: i }));
    onChange(moved);
  }

  // Aggregated stats — meal count, average macros, savings
  const stats = useMemo(() => {
    let totalMeals = 0;
    let totalKcal = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let withMacrosCount = 0;
    let mealsCentsSum = 0;
    for (const it of items) {
      const meal = mealById.get(it.meal_id);
      if (!meal) continue;
      totalMeals += it.quantity;
      mealsCentsSum += meal.priceCents * it.quantity;
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
    const savingsPct =
      packagePriceCents && packagePriceCents > 0 && mealsCentsSum > packagePriceCents
        ? Math.round(((mealsCentsSum - packagePriceCents) / mealsCentsSum) * 100)
        : null;
    return { totalMeals, avgKcal, avgProtein, avgCarbs, avgFat, mealsCentsSum, savingsPct };
  }, [items, mealById, packagePriceCents]);

  const sortableIds = items.map((it, i) => `${it.meal_id}-${i}`);

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-500">
        Selecteer maaltijden voor dit pakket. Sleep om de volgorde te wijzigen.
      </p>

      {items.length === 0 && (
        <div className="rounded-md border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
          Geen maaltijden toegevoegd. Klik &ldquo;Maaltijd toevoegen&rdquo;.
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((it, idx) => {
              const meal = mealById.get(it.meal_id);
              return (
                <SortableRow
                  key={sortableIds[idx]}
                  id={sortableIds[idx]}
                  meal={meal}
                  quantity={it.quantity}
                  onQty={(q) => updateQty(idx, q)}
                  onRemove={() => remove(idx)}
                />
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>

      {searchOpen ? (
        <div className="rounded-lg border border-(--color-brand-yellow) bg-white p-3 space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            <input
              autoFocus
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Zoek een maaltijd…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-stone-200 text-sm focus:outline-none focus:border-(--color-brand-yellow)"
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
                    <img
                      src={m.imageUrl}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover bg-stone-100"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-stone-100" />
                  )}
                  <span className="text-sm flex-1 min-w-0 truncate">{m.name}</span>
                  <span className="font-mono text-[11px] text-stone-500 tabular-nums">
                    {formatMoneyCents(m.priceCents)}
                  </span>
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
                setSearchInput('');
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
      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-stone-200 space-y-3">
          <p className="text-sm text-stone-700">
            Bevat <span className="font-mono font-semibold tabular-nums">{stats.totalMeals}</span>{' '}
            {stats.totalMeals === 1 ? 'maaltijd' : 'maaltijden'} totaal — losse waarde{' '}
            <span className="font-mono tabular-nums">{formatMoneyCents(stats.mealsCentsSum)}</span>
            {stats.savingsPct !== null && (
              <>
                {' · '}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Klanten besparen {stats.savingsPct}%
                </span>
              </>
            )}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryStat label="Gem. kcal" value={stats.avgKcal != null ? `${stats.avgKcal}` : '—'} accent />
            <SummaryStat label="Gem. eiwit" value={stats.avgProtein != null ? `${stats.avgProtein}g` : '—'} />
            <SummaryStat label="Gem. koolh." value={stats.avgCarbs != null ? `${stats.avgCarbs}g` : '—'} />
            <SummaryStat label="Gem. vet" value={stats.avgFat != null ? `${stats.avgFat}g` : '—'} />
          </div>
        </div>
      )}
    </div>
  );
}

function SortableRow({
  id,
  meal,
  quantity,
  onQty,
  onRemove,
}: {
  id: string;
  meal: MealOption | undefined;
  quantity: number;
  onQty: (q: number) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md border border-stone-200 bg-white hover:border-stone-300',
        isDragging && 'shadow-lg border-(--color-brand-yellow)',
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing"
        aria-label="Sleep om te herordenen"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {meal?.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meal.imageUrl} alt="" className="h-10 w-10 rounded-full object-cover bg-stone-100" />
      ) : (
        <div className="h-10 w-10 rounded-full bg-stone-100" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-stone-900 truncate">
          {meal?.name ?? '(onbekende maaltijd)'}
        </p>
        {meal && (
          <p className="text-[11px] text-stone-500 font-mono">
            {formatMoneyCents(meal.priceCents)}
            {meal.kcal != null && ` · ${meal.kcal} kcal · ${meal.protein_g}g eiwit`}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-stone-400">×</span>
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => onQty(parseInt(e.target.value, 10) || 1)}
          className="h-8 w-16 px-2 text-center font-mono tabular-nums rounded-md border border-stone-200 focus:outline-none focus:border-(--color-brand-yellow)"
        />
        <button
          type="button"
          onClick={onRemove}
          className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-600 hover:bg-red-50"
          aria-label="Verwijder"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-md px-3 py-2 border',
        accent
          ? 'border-(--color-brand-yellow-bright)/30 bg-(--color-brand-yellow-bright)/10'
          : 'border-stone-200 bg-stone-50',
      )}
    >
      <p className="text-[10px] uppercase tracking-wider text-stone-500">{label}</p>
      <p className="font-mono text-base tabular-nums text-stone-900 mt-0.5">{value}</p>
    </div>
  );
}
