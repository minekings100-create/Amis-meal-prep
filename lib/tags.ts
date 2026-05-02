import {
  Flame,
  Leaf,
  Wheat,
  Milk,
  Sparkles,
  TrendingUp,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import type { GoalTag, AttributeTag } from '@/types/database';

export interface GoalTagConfig {
  labelNl: string;
  labelEn: string;
  /** Tailwind classes — combine with `border` utility class for outline. */
  bg: string;
  text: string;
  border: string;
  /** Solid pill variant used on dark hero / over images. */
  solidBg: string;
  solidText: string;
}

export const GOAL_TAGS: Record<GoalTag, GoalTagConfig> = {
  cut: {
    labelNl: 'Cut',
    labelEn: 'Cut',
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    solidBg: 'bg-blue-700',
    solidText: 'text-white',
  },
  bulk: {
    labelNl: 'Bulk',
    labelEn: 'Bulk',
    bg: 'bg-orange-100',
    text: 'text-orange-900',
    border: 'border-orange-300',
    solidBg: 'bg-orange-700',
    solidText: 'text-white',
  },
  performance: {
    labelNl: 'Performance',
    labelEn: 'Performance',
    bg: 'bg-(--color-brand-black)',
    text: 'text-white',
    border: 'border-(--color-brand-black)',
    solidBg: 'bg-(--color-brand-black)',
    solidText: 'text-white',
  },
  maintenance: {
    labelNl: 'Onderhoud',
    labelEn: 'Maintenance',
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    solidBg: 'bg-emerald-700',
    solidText: 'text-white',
  },
  hybrid: {
    labelNl: 'Hybride',
    labelEn: 'Hybrid',
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
    solidBg: 'bg-purple-700',
    solidText: 'text-white',
  },
};

export interface AttributeTagConfig {
  labelNl: string;
  labelEn: string;
  icon: LucideIcon;
  bg: string;
  text: string;
  /** Lower number = shown earlier when truncating. */
  priority: number;
}

export const ATTRIBUTE_TAGS: Record<AttributeTag, AttributeTagConfig> = {
  bestseller: {
    labelNl: 'Bestseller',
    labelEn: 'Bestseller',
    icon: Flame,
    bg: 'bg-(--color-brand-yellow)',
    text: 'text-(--color-brand-black)',
    priority: 1,
  },
  limited: {
    labelNl: 'Limited',
    labelEn: 'Limited',
    icon: Clock,
    bg: 'bg-stone-900',
    text: 'text-white',
    priority: 2,
  },
  new: {
    labelNl: 'Nieuw',
    labelEn: 'New',
    icon: Sparkles,
    bg: 'bg-(--color-brand-yellow-soft)',
    text: 'text-(--color-brand-yellow-deep)',
    priority: 3,
  },
  spicy: {
    labelNl: 'Pittig',
    labelEn: 'Spicy',
    icon: Flame,
    bg: 'bg-red-50',
    text: 'text-red-700',
    priority: 4,
  },
  'high-protein': {
    labelNl: 'High protein',
    labelEn: 'High protein',
    icon: TrendingUp,
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    priority: 5,
  },
  vegetarian: {
    labelNl: 'Vegetarisch',
    labelEn: 'Vegetarian',
    icon: Leaf,
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    priority: 6,
  },
  'gluten-free': {
    labelNl: 'Glutenvrij',
    labelEn: 'Gluten-free',
    icon: Wheat,
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    priority: 7,
  },
  'lactose-free': {
    labelNl: 'Lactosevrij',
    labelEn: 'Lactose-free',
    icon: Milk,
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    priority: 8,
  },
};

export function sortAttributesByPriority(tags: AttributeTag[]): AttributeTag[] {
  return [...tags].sort(
    (a, b) => (ATTRIBUTE_TAGS[a]?.priority ?? 99) - (ATTRIBUTE_TAGS[b]?.priority ?? 99),
  );
}

export function goalLabel(tag: GoalTag, locale: 'nl' | 'en'): string {
  return locale === 'en' ? GOAL_TAGS[tag].labelEn : GOAL_TAGS[tag].labelNl;
}

export function attributeLabel(tag: AttributeTag, locale: 'nl' | 'en'): string {
  return locale === 'en' ? ATTRIBUTE_TAGS[tag].labelEn : ATTRIBUTE_TAGS[tag].labelNl;
}
