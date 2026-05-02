'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useCart, cartItemCount } from '@/lib/cart/store';
import { cn } from '@/lib/utils/cn';

export function CartIcon({
  label,
  icon,
  transparent = false,
}: {
  label: string;
  icon: ReactNode;
  transparent?: boolean;
}) {
  const lines = useCart((s) => s.lines);
  const open = useCart((s) => s.open);
  const bumpToken = useCart((s) => s.bumpToken);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [bumping, setBumping] = useState(false);
  useEffect(() => {
    if (bumpToken === 0) return;
    setBumping(true);
    const id = setTimeout(() => setBumping(false), 600);
    return () => clearTimeout(id);
  }, [bumpToken]);

  const count = mounted ? cartItemCount(lines) : 0;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={`${label} (${count})`}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        transparent
          ? 'text-white hover:bg-white/10'
          : 'text-stone-700 hover:bg-stone-100',
        bumping && 'animate-cart-bump',
      )}
    >
      {icon}
      {count > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-semibold px-1 tabular-nums',
            transparent
              ? 'bg-(--color-brand-yellow-bright) text-stone-900'
              : 'bg-(--color-brand-black) text-white',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}
