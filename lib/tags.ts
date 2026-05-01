import {
  Flame,
  Leaf,
  Wheat,
  Milk,
  Sparkles,
  TrendingUp,
  Clock,
  Trophy,
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
    bg: 'bg-blue-50',
    text: 'text-blue-900',
    border: 'border-blue-200',
    solidBg: 'bg-blue-600',
    solidText: 'text-white',
  },
  bulk: {
    labelNl: 'Bulk',
    labelEn: 'Bulk',
    bg: 'bg-orange-50',
    text: 'text-orange-900',
    border: 'border-orange-200',
    solidBg: 'bg-orange-600',
    solidText: 'text-white',
  },
  performance: {
    labelNl: 'Performance',
    labelEn: 'Performance',
    bg: 'bg-[#e8f3e1]',
    text: 'text-[#2d5524]',
    border: 'border-[#7cc24f]',
    solidBg: 'bg-[#4a8a3c]',
    solidText: 'text-white',
  },
  maintenance: {
    labelNl: 'Onderhoud',
    labelEn: 'Maintenance',
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    border: 'border-stone-300',
    solidBg: 'bg-stone-700',
    solidText: 'text-white',
  },
  hybrid: {
    labelNl: 'Hybride',
    labelEn: 'Hybrid',
    bg: 'bg-purple-50',
    text: 'text-purple-900',
    border: 'border-purple-200',
    solidBg: 'bg-purple-600',
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
  new: {
    labelNl: 'Nieuw',
    labelEn: 'New',
    icon: Sparkles,
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    priority: 1,
  },
  limited: {
    labelNl: 'Limited',
    labelEn: 'Limited',
    icon: Clock,
    bg: 'bg-red-100',
    text: 'text-red-900',
    priority: 2,
  },
  bestseller: {
    labelNl: 'Bestseller',
    labelEn: 'Bestseller',
    icon: Trophy,
    bg: 'bg-amber-100',
    text: 'text-amber-900',
    priority: 3,
  },
  spicy: {
    labelNl: 'Pittig',
    labelEn: 'Spicy',
    icon: Flame,
    bg: 'bg-red-100',
    text: 'text-red-900',
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
    text: 'text-stone-700',
    priority: 6,
  },
  'gluten-free': {
    labelNl: 'Glutenvrij',
    labelEn: 'Gluten-free',
    icon: Wheat,
    bg: 'bg-stone-100',
    text: 'text-stone-700',
    priority: 7,
  },
  'lactose-free': {
    labelNl: 'Lactosevrij',
    labelEn: 'Lactose-free',
    icon: Milk,
    bg: 'bg-stone-100',
    text: 'text-stone-700',
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
