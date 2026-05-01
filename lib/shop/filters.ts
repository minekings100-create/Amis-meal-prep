import type { GoalTag, AttributeTag } from '@/types/database';
import { ALLERGEN_KEYS, type ProductFilters, type SortKey, type AllergenKey } from './types';

const VALID_TYPES = ['meal', 'package', 'tryout'] as const;
const VALID_GOALS: GoalTag[] = ['cut', 'bulk', 'performance', 'maintenance', 'hybrid'];
const VALID_ATTRS: AttributeTag[] = [
  'new',
  'bestseller',
  'limited',
  'spicy',
  'high-protein',
  'vegetarian',
  'gluten-free',
  'lactose-free',
];
const VALID_SORTS: SortKey[] = ['featured', 'new', 'price-asc', 'price-desc', 'protein-per-euro'];

export const PRICE_RANGE_CENTS = { min: 500, max: 9000 } as const;

function csv<T extends string>(value: string | undefined, allowed: readonly T[]): T[] {
  if (!value) return [];
  return value
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
}

function readInt(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : undefined;
}

export function parseFiltersFromSearchParams(
  sp: Record<string, string | string[] | undefined>,
): ProductFilters {
  const get = (k: string): string | undefined => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };

  const typeRaw = get('type');
  const type =
    typeRaw && (VALID_TYPES as readonly string[]).includes(typeRaw)
      ? (typeRaw as (typeof VALID_TYPES)[number])
      : undefined;

  const sortRaw = get('sort');
  const sort: SortKey | undefined =
    sortRaw && (VALID_SORTS as readonly string[]).includes(sortRaw) ? (sortRaw as SortKey) : undefined;

  const minRaw = readInt(get('min'));
  const maxRaw = readInt(get('max'));

  return {
    type,
    goalTags: csv<GoalTag>(get('goal'), VALID_GOALS),
    attributeTags: csv<AttributeTag>(get('attr'), VALID_ATTRS),
    allergensAvoid: csv<AllergenKey>(get('nf'), ALLERGEN_KEYS),
    minPriceCents:
      minRaw !== undefined && minRaw > PRICE_RANGE_CENTS.min ? minRaw : undefined,
    maxPriceCents:
      maxRaw !== undefined && maxRaw < PRICE_RANGE_CENTS.max ? maxRaw : undefined,
    sort: sort ?? 'featured',
  };
}

export function activeFilterCount(f: ProductFilters): number {
  return (
    (f.type ? 1 : 0) +
    (f.goalTags?.length ?? 0) +
    (f.attributeTags?.length ?? 0) +
    (f.allergensAvoid?.length ?? 0) +
    (f.minPriceCents !== undefined ? 1 : 0) +
    (f.maxPriceCents !== undefined ? 1 : 0)
  );
}

export function buildFilterURL(
  pathname: string,
  patch: Partial<{
    type: ProductFilters['type'] | null;
    goal: GoalTag[];
    attr: AttributeTag[];
    nf: AllergenKey[];
    min: number | null;
    max: number | null;
    sort: SortKey | null;
  }>,
  current: URLSearchParams,
): string {
  const next = new URLSearchParams(current.toString());

  function setOrDelete(key: string, value: string | null | undefined) {
    if (value === null || value === undefined || value === '') next.delete(key);
    else next.set(key, value);
  }

  if (patch.type !== undefined) setOrDelete('type', patch.type);
  if (patch.goal !== undefined) setOrDelete('goal', patch.goal.length ? patch.goal.join(',') : null);
  if (patch.attr !== undefined) setOrDelete('attr', patch.attr.length ? patch.attr.join(',') : null);
  if (patch.nf !== undefined) setOrDelete('nf', patch.nf.length ? patch.nf.join(',') : null);
  if (patch.min !== undefined) setOrDelete('min', patch.min === null ? null : String(patch.min));
  if (patch.max !== undefined) setOrDelete('max', patch.max === null ? null : String(patch.max));
  if (patch.sort !== undefined) setOrDelete('sort', patch.sort);

  const qs = next.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

/** Toggle membership of a value in a CSV-encoded query param. */
export function toggleInList<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}
