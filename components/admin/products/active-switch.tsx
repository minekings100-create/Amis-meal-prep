'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils/cn';
import { toggleProductActiveAction } from '@/app/admin/_actions/stock';

export function ProductActiveSwitch({
  productId,
  initial,
}: {
  productId: string;
  initial: boolean;
}) {
  const [active, setActive] = useState(initial);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !active;
    setActive(next);
    start(async () => {
      const res = await toggleProductActiveAction(productId, next);
      if (!res.ok) setActive(!next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      role="switch"
      aria-checked={active}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors disabled:opacity-50',
        active ? 'bg-(--color-brand-yellow)' : 'bg-stone-300',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5',
          active ? 'translate-x-[18px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
