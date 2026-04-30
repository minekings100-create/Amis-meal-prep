'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useCart, cartItemCount } from '@/lib/cart/store';

export function CartIcon({ label, icon }: { label: string; icon: ReactNode }) {
  const lines = useCart((s) => s.lines);
  const open = useCart((s) => s.open);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const count = mounted ? cartItemCount(lines) : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`${label} (${count})`}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-[--color-ink] hover:bg-[--color-bg-soft] transition-colors"
    >
      {icon}
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[--color-accent] text-[10px] font-semibold text-white px-1 tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
