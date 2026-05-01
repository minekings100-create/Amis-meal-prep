'use client';

import { useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Star, Trash2, ShoppingBag } from 'lucide-react';
import { useCompareStore, type CompareItem } from '@/lib/compare/store';
import { useCart } from '@/lib/cart/store';
import { toast } from '@/lib/toast/store';
import { GoalBadge } from './goal-badge';
import { formatMoneyCents } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';

type Direction = 'higher' | 'lower';
interface MacroRow {
  key: keyof Pick<
    CompareItem,
    'kcal' | 'proteinG' | 'carbsG' | 'fatG' | 'fiberG' | 'saltG'
  > | 'proteinPerEuro';
  labelKey:
    | 'calories'
    | 'protein'
    | 'carbs'
    | 'fat'
    | 'fiber'
    | 'salt'
    | 'proteinPerEuro';
  unit: string;
  /** Direction of "winner": higher = larger is better, lower = smaller is better. */
  winner: Direction;
  decimals?: number;
}

const ROWS: MacroRow[] = [
  { key: 'kcal', labelKey: 'calories', unit: ' kcal', winner: 'lower' },
  { key: 'proteinG', labelKey: 'protein', unit: 'g', winner: 'higher' },
  { key: 'carbsG', labelKey: 'carbs', unit: 'g', winner: 'lower' },
  { key: 'fatG', labelKey: 'fat', unit: 'g', winner: 'lower' },
  { key: 'fiberG', labelKey: 'fiber', unit: 'g', winner: 'higher' },
  { key: 'proteinPerEuro', labelKey: 'proteinPerEuro', unit: 'g/€', winner: 'higher', decimals: 1 },
];

function valueFor(item: CompareItem, key: MacroRow['key']): number | null {
  if (key === 'proteinPerEuro') {
    if (!item.proteinG || item.priceCents <= 0) return null;
    return item.proteinG / (item.priceCents / 100);
  }
  return item[key];
}

function findWinner(items: CompareItem[], row: MacroRow): string | null {
  const valued = items
    .map((it) => ({ id: it.id, v: valueFor(it, row.key) }))
    .filter((x): x is { id: string; v: number } => x.v !== null);
  if (valued.length < 2) return null;
  if (row.winner === 'higher') {
    const max = Math.max(...valued.map((x) => x.v));
    const ids = valued.filter((x) => x.v === max).map((x) => x.id);
    return ids.length === 1 ? ids[0] : null; // skip star on ties
  } else {
    const min = Math.min(...valued.map((x) => x.v));
    const ids = valued.filter((x) => x.v === min).map((x) => x.id);
    return ids.length === 1 ? ids[0] : null;
  }
}

function formatValue(v: number | null, row: MacroRow): string {
  if (v === null) return '–';
  const decimals = row.decimals ?? 0;
  const formatter = new Intl.NumberFormat('nl-NL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${formatter.format(v)}${row.unit}`;
}

export function CompareModal() {
  const t = useTranslations('compare');
  const locale = useLocale() as 'nl' | 'en';
  const isOpen = useCompareStore((s) => s.isOpen);
  const close = useCompareStore((s) => s.close);
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const addToCart = useCart((s) => s.add);

  const winners = useMemo(() => {
    return ROWS.reduce<Record<string, string | null>>((acc, row) => {
      acc[row.labelKey] = findWinner(items, row);
      return acc;
    }, {});
  }, [items]);

  function handleAddToCart(item: CompareItem) {
    const name = locale === 'en' ? item.nameEn : item.nameNl;
    addToCart(
      {
        productId: item.id,
        slug: item.slug,
        name,
        imageUrl: item.imageUrl,
        unitPriceCents: item.priceCents,
      },
      1,
      { silent: true },
    );
    toast(t('added', { count: 1 }) /* fallback to a generic add toast */);
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-stone-950/55 data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex md:items-center md:justify-center md:p-6"
        >
          <div className="bg-white w-full md:max-w-5xl md:rounded-2xl flex flex-col max-h-[100vh] md:max-h-[90vh] overflow-hidden border border-stone-200 shadow-2xl">
            <header className="flex items-center justify-between px-5 md:px-6 h-14 border-b border-stone-200 shrink-0">
              <Dialog.Title className="text-base md:text-lg font-semibold tracking-tight">
                {t('title')}
                <span className="ml-2 font-mono text-sm text-stone-500 tabular-nums">
                  {items.length}/3
                </span>
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="h-9 w-9 inline-flex items-center justify-center rounded-full text-stone-600 hover:bg-stone-100"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </header>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="p-12 text-center text-stone-500">{t('hint')}</div>
              ) : (
                <>
                  <DesktopTable
                    items={items}
                    winners={winners}
                    locale={locale}
                    onRemove={remove}
                    onAddToCart={handleAddToCart}
                    t={t}
                  />
                  <MobileStack
                    items={items}
                    winners={winners}
                    locale={locale}
                    onRemove={remove}
                    onAddToCart={handleAddToCart}
                    t={t}
                  />
                  {items.length < 2 && (
                    <p className="px-6 pb-6 text-center text-sm text-stone-500">{t('hint')}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ProductCol({
  item,
  locale,
  onRemove,
  onAddToCart,
  t,
  compact = false,
}: {
  item: CompareItem;
  locale: 'nl' | 'en';
  onRemove: (id: string) => void;
  onAddToCart: (item: CompareItem) => void;
  t: ReturnType<typeof useTranslations<'compare'>>;
  compact?: boolean;
}) {
  const name = locale === 'en' ? item.nameEn : item.nameNl;
  return (
    <div className={cn('flex flex-col items-center text-center', compact ? 'gap-2' : 'gap-3')}>
      <div
        className={cn(
          'rounded-full overflow-hidden ring-1 ring-stone-100 bg-stone-50',
          compact ? 'h-12 w-12' : 'h-20 w-20 md:h-24 md:w-24',
        )}
      >
        {item.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      {!compact && (
        <>
          {item.goalTag && (
            <GoalBadge tag={item.goalTag} locale={locale} variant="solid" size="sm" />
          )}
          <h3 className="font-semibold text-sm tracking-tight line-clamp-2 px-1">{name}</h3>
          <p className="font-mono text-sm font-semibold tabular-nums">
            {formatMoneyCents(item.priceCents)}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onAddToCart(item)}
              className="inline-flex items-center gap-1 h-8 px-3 rounded-full bg-[--color-accent-bright] text-stone-900 text-xs font-semibold hover:bg-[--color-accent] hover:text-white transition-colors"
            >
              <ShoppingBag className="h-3 w-3" />
              {t('addToCart')}
            </button>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={t('remove')}
              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-stone-500 hover:bg-stone-100 hover:text-stone-900 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </>
      )}
      {compact && (
        <span className="font-mono text-[11px] tabular-nums text-stone-500">
          {formatMoneyCents(item.priceCents)}
        </span>
      )}
      {compact && <p className="text-[11px] font-medium tracking-tight line-clamp-1">{name}</p>}
    </div>
  );
}

function DesktopTable({
  items,
  winners,
  locale,
  onRemove,
  onAddToCart,
  t,
}: {
  items: CompareItem[];
  winners: Record<string, string | null>;
  locale: 'nl' | 'en';
  onRemove: (id: string) => void;
  onAddToCart: (item: CompareItem) => void;
  t: ReturnType<typeof useTranslations<'compare'>>;
}) {
  return (
    <div className="hidden md:block px-6 pb-6">
      {/* Header row with product info */}
      <div
        className="grid gap-4 py-6 border-b border-stone-200"
        style={{ gridTemplateColumns: `140px repeat(${items.length}, minmax(0, 1fr))` }}
      >
        <div />
        {items.map((it) => (
          <ProductCol
            key={it.id}
            item={it}
            locale={locale}
            onRemove={onRemove}
            onAddToCart={onAddToCart}
            t={t}
          />
        ))}
      </div>

      {/* Macro rows */}
      <div className="divide-y divide-stone-100">
        {ROWS.map((row) => (
          <div
            key={row.labelKey}
            className="grid gap-4 py-3.5 items-center"
            style={{ gridTemplateColumns: `140px repeat(${items.length}, minmax(0, 1fr))` }}
          >
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              {t(row.labelKey)}
            </div>
            {items.map((it) => {
              const v = valueFor(it, row.key);
              const isWinner = winners[row.labelKey] === it.id;
              return (
                <div
                  key={it.id}
                  className={cn(
                    'flex items-center justify-center gap-1.5 font-mono text-base tabular-nums',
                    isWinner ? 'text-[--color-accent] font-semibold' : 'text-stone-800',
                  )}
                >
                  {isWinner && (
                    <Star
                      className="h-3.5 w-3.5 fill-[--color-accent-bright] text-[--color-accent-bright]"
                      aria-label={row.winner === 'higher' ? t('highest') : t('lowest')}
                    />
                  )}
                  <span>{formatValue(v, row)}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MobileStack({
  items,
  winners,
  locale,
  onRemove,
  onAddToCart,
  t,
}: {
  items: CompareItem[];
  winners: Record<string, string | null>;
  locale: 'nl' | 'en';
  onRemove: (id: string) => void;
  onAddToCart: (item: CompareItem) => void;
  t: ReturnType<typeof useTranslations<'compare'>>;
}) {
  return (
    <div className="md:hidden">
      {/* Sticky header with thumbnails */}
      <div
        className="sticky top-0 z-10 bg-white border-b border-stone-200 px-4 py-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map((it) => (
          <ProductCol
            key={it.id}
            item={it}
            locale={locale}
            onRemove={onRemove}
            onAddToCart={onAddToCart}
            t={t}
            compact
          />
        ))}
      </div>

      {/* Macro blocks */}
      <div className="px-4 py-4 space-y-5">
        {ROWS.map((row) => (
          <div key={row.labelKey}>
            <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500 mb-2">
              {t(row.labelKey)}
            </h4>
            <div
              className="grid border border-stone-200 rounded-lg overflow-hidden"
              style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
              {items.map((it) => {
                const v = valueFor(it, row.key);
                const isWinner = winners[row.labelKey] === it.id;
                return (
                  <div
                    key={it.id}
                    className={cn(
                      'p-3 text-center border-r border-stone-200 last:border-r-0',
                      isWinner ? 'bg-[--color-accent-bright]/10' : 'bg-white',
                    )}
                  >
                    <div
                      className={cn(
                        'inline-flex items-center justify-center gap-1 font-mono text-sm font-semibold tabular-nums',
                        isWinner ? 'text-[--color-accent]' : 'text-stone-800',
                      )}
                    >
                      {isWinner && (
                        <Star className="h-3 w-3 fill-[--color-accent-bright] text-[--color-accent-bright]" />
                      )}
                      <span>{formatValue(v, row)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Add to cart row at bottom */}
        <div
          className="grid gap-2 pt-4"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((it) => (
            <button
              key={it.id}
              type="button"
              onClick={() => onAddToCart(it)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-full bg-[--color-accent-bright] text-stone-900 text-xs font-semibold hover:bg-[--color-accent] hover:text-white transition-colors"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {t('addToCart')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
