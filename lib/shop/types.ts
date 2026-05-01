/**
 * Pure types and constants for shop filtering.
 *
 * Lives in lib/shop/* (not lib/data/*) so client components can import these
 * without dragging in Supabase server-only modules (which use `next/headers`).
 */

import type { GoalTag, AttributeTag } from '@/types/database';

export type SortKey = 'featured' | 'new' | 'price-asc' | 'price-desc' | 'protein-per-euro';

export type AllergenKey =
  | 'gluten'
  | 'lactose'
  | 'nuts'
  | 'eggs'
  | 'soy'
  | 'fish'
  | 'shellfish'
  | 'sesame'
  | 'celery'
  | 'mustard'
  | 'lupine'
  | 'sulfite'
  | 'mollusks';

export const ALLERGEN_KEYS: AllergenKey[] = [
  'gluten',
  'lactose',
  'nuts',
  'eggs',
  'soy',
  'fish',
  'shellfish',
  'sesame',
  'celery',
  'mustard',
  'lupine',
  'sulfite',
  'mollusks',
];

export interface ProductFilters {
  type?: 'meal' | 'package' | 'tryout';
  categorySlug?: string;
  /** Multi-select goal tags (any-of). */
  goalTags?: GoalTag[];
  /** Multi-select attribute tags (all-of: product must have ALL selected attrs). */
  attributeTags?: AttributeTag[];
  /** Allergens to avoid — products that contain any of these are excluded. */
  allergensAvoid?: AllergenKey[];
  minPriceCents?: number;
  maxPriceCents?: number;
  featuredOnly?: boolean;
  sort?: SortKey;
}
