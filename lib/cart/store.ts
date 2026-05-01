'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  unitPriceCents: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  isOpen: boolean;
  /** Increments on every add — CartIcon listens to it to trigger the bump animation. */
  bumpToken: number;
  add: (line: Omit<CartLine, 'quantity'>, quantity?: number, options?: { silent?: boolean }) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      isOpen: false,
      bumpToken: 0,
      add: (line, quantity = 1, options) =>
        set((state) => {
          const existing = state.lines.find((l) => l.productId === line.productId);
          const bumpToken = state.bumpToken + 1;
          // From product cards we don't auto-open the drawer; we toast + bump instead.
          // From product detail we still auto-open for clearer feedback.
          const isOpen = options?.silent ? state.isOpen : true;
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.productId === line.productId ? { ...l, quantity: l.quantity + quantity } : l,
              ),
              isOpen,
              bumpToken,
            };
          }
          return { lines: [...state.lines, { ...line, quantity }], isOpen, bumpToken };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((l) => l.productId !== productId)
              : state.lines.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
        })),
      remove: (productId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.productId !== productId) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: 'amis-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ lines: state.lines }),
    },
  ),
);

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}

export function cartSubtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
}
