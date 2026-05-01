'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GoalTag } from '@/types/database';

export const COMPARE_MAX = 3;

export interface CompareItem {
  id: string;
  slug: string;
  nameNl: string;
  nameEn: string;
  imageUrl: string | null;
  priceCents: number;
  kcal: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  fiberG: number | null;
  saltG: number | null;
  goalTag: GoalTag | null;
}

interface CompareState {
  items: CompareItem[];
  isOpen: boolean;
  /** Returns 'added' | 'full' | 'already'. UI uses this to pick the right toast. */
  add: (item: CompareItem) => 'added' | 'full' | 'already';
  remove: (id: string) => void;
  toggle: (item: CompareItem) => 'added' | 'full' | 'already' | 'removed';
  clear: () => void;
  has: (id: string) => boolean;
  open: () => void;
  close: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      has: (id) => get().items.some((i) => i.id === id),
      add: (item) => {
        const items = get().items;
        if (items.some((i) => i.id === item.id)) return 'already';
        if (items.length >= COMPARE_MAX) return 'full';
        set({ items: [...items, item] });
        return 'added';
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      toggle: (item) => {
        const items = get().items;
        if (items.some((i) => i.id === item.id)) {
          set({ items: items.filter((i) => i.id !== item.id) });
          return 'removed';
        }
        if (items.length >= COMPARE_MAX) return 'full';
        set({ items: [...items, item] });
        return 'added';
      },
      clear: () => set({ items: [], isOpen: false }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: 'amis-compare',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
