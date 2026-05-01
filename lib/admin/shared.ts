// Browser-safe types + constants used by admin client components.
// Keep this file free of any server-only imports (no `next/headers`, no service-role client).

import type { AttributeTag, GoalTag } from '@/types/database';

export const LOW_STOCK_THRESHOLD = 10;

export const GOAL_TAGS: GoalTag[] = ['cut', 'bulk', 'performance', 'maintenance', 'hybrid'];

export const ATTRIBUTE_TAGS: AttributeTag[] = [
  'new',
  'bestseller',
  'limited',
  'spicy',
  'high-protein',
  'vegetarian',
  'gluten-free',
  'lactose-free',
];

export const ALLERGEN_FIELDS = [
  { key: 'contains_gluten', label: 'Gluten' },
  { key: 'contains_lactose', label: 'Lactose' },
  { key: 'contains_nuts', label: 'Noten' },
  { key: 'contains_eggs', label: 'Eieren' },
  { key: 'contains_soy', label: 'Soja' },
  { key: 'contains_fish', label: 'Vis' },
  { key: 'contains_shellfish', label: 'Schaaldieren' },
  { key: 'contains_sesame', label: 'Sesam' },
  { key: 'contains_celery', label: 'Selderij' },
  { key: 'contains_mustard', label: 'Mosterd' },
  { key: 'contains_lupine', label: 'Lupine' },
  { key: 'contains_sulfite', label: 'Sulfiet' },
  { key: 'contains_mollusks', label: 'Weekdieren' },
] as const;
