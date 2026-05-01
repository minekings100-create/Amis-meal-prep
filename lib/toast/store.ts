'use client';

import { create } from 'zustand';

export interface ToastEntry {
  id: number;
  title: string;
  body?: string;
}

interface ToastState {
  toasts: ToastEntry[];
  push: (entry: Omit<ToastEntry, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (entry) =>
    set((state) => {
      const id = nextId++;
      const next: ToastEntry = { id, ...entry };
      // Cap to 3 visible toasts; dismiss oldest.
      const trimmed = [...state.toasts, next].slice(-3);
      // Auto-dismiss after 3.5s
      setTimeout(() => {
        useToastStore.getState().dismiss(id);
      }, 3500);
      return { toasts: trimmed };
    }),
  dismiss: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(title: string, body?: string) {
  useToastStore.getState().push({ title, body });
}
