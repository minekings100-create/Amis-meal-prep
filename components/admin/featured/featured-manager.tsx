'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
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
import { GripVertical, X, Plus, Search, Save, Sparkles } from 'lucide-react';
import { setFeaturedProductsAction } from '@/app/admin/_actions/featured';
import { cn } from '@/lib/utils/cn';

type ProductType = 'meal' | 'package' | 'tryout';

interface AvailableProduct {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  imageUrl: string | null;
  categoryName: string | null;
}

interface SelectedProduct {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  imageUrl: string | null;
  featuredOrder: number | null;
}

const TYPE_LABEL: Record<ProductType, string> = {
  meal: 'Maaltijd',
  package: 'Pakket',
  tryout: 'Try-out',
};

const MAX_FEATURED = 3;

export function FeaturedManager({
  available,
  selected: initialSelected,
}: {
  available: AvailableProduct[];
  selected: SelectedProduct[];
}) {
  const [selected, setSelected] = useState<SelectedProduct[]>(initialSelected);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | ProductType>('all');
  const [pending, start] = useTransition();
  const [savedSnapshot, setSavedSnapshot] = useState<string>(
    initialSelected.map((s) => s.id).join(','),
  );
  const [error, setError] = useState<string | null>(null);

  const selectedIds = new Set(selected.map((s) => s.id));
  const dirty = selected.map((s) => s.id).join(',') !== savedSnapshot;

  const filtered = useMemo(() => {
    return available.filter((p) => {
      if (selectedIds.has(p.id)) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available, search, typeFilter, selected]);

  function add(p: AvailableProduct) {
    if (selected.length >= MAX_FEATURED) return;
    setSelected((prev) => [
      ...prev,
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        type: p.type,
        imageUrl: p.imageUrl,
        featuredOrder: prev.length + 1,
      },
    ]);
  }

  function remove(id: string) {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = selected.findIndex((s) => s.id === active.id);
    const newIdx = selected.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    setSelected((prev) => arrayMove(prev, oldIdx, newIdx));
  }

  function save() {
    setError(null);
    const ids = selected.map((s) => s.id);
    start(async () => {
      const res = await setFeaturedProductsAction(ids);
      if (!res.ok) {
        setError(res.message ?? 'Onbekende fout');
        return;
      }
      setSavedSnapshot(ids.join(','));
    });
  }

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
      {/* Left: available products */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500">
          Beschikbare producten
        </h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Zoek een product…"
            className="h-10 w-full pl-9 pr-3 rounded-md border border-stone-200 bg-white text-sm focus:outline-none focus:border-stone-900"
          />
        </div>

        <div className="flex gap-1.5">
          {([
            { v: 'all', label: 'Alle' },
            { v: 'meal', label: 'Maaltijden' },
            { v: 'package', label: 'Pakketten' },
            { v: 'tryout', label: 'Try-out' },
          ] as const).map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setTypeFilter(opt.v)}
              className={cn(
                'inline-flex items-center px-3 h-7 rounded-full text-xs font-medium transition-colors',
                typeFilter === opt.v
                  ? 'bg-(--color-brand-black) text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <ul className="space-y-1.5 max-h-[560px] overflow-y-auto pr-1">
          {filtered.length === 0 && (
            <li className="text-sm text-stone-400 italic px-3 py-6 text-center">
              Geen producten gevonden.
            </li>
          )}
          {filtered.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 px-3 py-2 rounded-md border border-stone-200 bg-white hover:border-stone-300"
            >
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover bg-stone-100"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-stone-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{p.name}</p>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 mt-0.5">
                  {TYPE_LABEL[p.type]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => add(p)}
                disabled={selected.length >= MAX_FEATURED}
                className="shrink-0 inline-flex items-center gap-1 h-8 px-3 rounded-full text-xs font-semibold bg-(--color-brand-black) text-white hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black) transition-colors disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus className="h-3 w-3" />
                Selecteer
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Right: 3 numbered slots */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-stone-500 inline-flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-(--color-brand-yellow-deep)" />
          Geselecteerd voor Hot deze week
          <span className="ml-1 font-mono text-stone-400">
            {selected.length}/{MAX_FEATURED}
          </span>
        </h2>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={selected.map((s) => s.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {Array.from({ length: MAX_FEATURED }).map((_, idx) => {
                const item = selected[idx];
                if (item) {
                  return <SlotRow key={item.id} item={item} index={idx + 1} onRemove={() => remove(item.id)} />;
                }
                return <EmptySlot key={`empty-${idx}`} index={idx + 1} />;
              })}
            </ul>
          </SortableContext>
        </DndContext>

        <div className="flex items-center justify-between gap-3 pt-3">
          {error && <span className="text-sm text-red-600">{error}</span>}
          <span className={cn('text-xs', dirty ? 'text-amber-700' : 'text-stone-400')}>
            {dirty ? 'Onopgeslagen wijzigingen' : 'Alles opgeslagen'}
          </span>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="ml-auto inline-flex items-center gap-1.5 h-10 px-5 rounded-full bg-(--color-brand-black) text-white text-sm font-semibold hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black) transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <Save className="h-3.5 w-3.5" />
            {pending ? 'Opslaan…' : 'Opslaan'}
          </button>
        </div>
      </section>
    </div>
  );
}

function SlotRow({
  item,
  index,
  onRemove,
}: {
  item: SelectedProduct;
  index: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
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
        'flex items-center gap-3 px-4 py-3 rounded-xl border-2 bg-white',
        isDragging
          ? 'border-(--color-brand-yellow) shadow-lg'
          : 'border-stone-200 hover:border-stone-300',
      )}
    >
      <span className="font-mono text-base font-bold tabular-nums text-stone-900 w-6 text-center">
        {index}
      </span>
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="touch-none text-stone-400 hover:text-stone-700 cursor-grab active:cursor-grabbing"
        aria-label="Sleep om te herordenen"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt="" className="h-12 w-12 rounded-full object-cover bg-stone-100" />
      ) : (
        <div className="h-12 w-12 rounded-full bg-stone-100" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-900 truncate">{item.name}</p>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 mt-0.5">
          {TYPE_LABEL[item.type]}
        </span>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="h-8 w-8 inline-flex items-center justify-center rounded-md text-red-600 hover:bg-red-50"
        aria-label="Verwijder uit selectie"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  );
}

function EmptySlot({ index }: { index: number }) {
  return (
    <li className="flex items-center gap-3 px-4 py-6 rounded-xl border-2 border-dashed border-stone-300 bg-stone-50/60">
      <span className="font-mono text-base font-bold tabular-nums text-stone-300 w-6 text-center">
        {index}
      </span>
      <span className="text-sm text-stone-400">
        Klik &ldquo;Selecteer&rdquo; in de linker kolom om dit slot te vullen.
      </span>
    </li>
  );
}
