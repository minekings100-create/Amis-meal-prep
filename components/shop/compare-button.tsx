'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { GitCompareArrows, Check } from 'lucide-react';
import { useCompareStore, type CompareItem } from '@/lib/compare/store';
import { toast } from '@/lib/toast/store';
import { cn } from '@/lib/utils/cn';

export function CompareButton({ item, className }: { item: CompareItem; className?: string }) {
  const t = useTranslations('compare');
  const toggle = useCompareStore((s) => s.toggle);
  const has = useCompareStore((s) => (s.items.some((i) => i.id === item.id)));
  const itemsCount = useCompareStore((s) => s.items.length);

  // Avoid flash-of-unchecked during persist hydration.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const checked = hydrated && has;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const result = toggle(item);
    if (result === 'added') {
      toast(t('added', { count: itemsCount + 1 }));
    } else if (result === 'full') {
      toast(t('full'));
    } else if (result === 'removed') {
      toast(t('removed', { name: item.nameNl }));
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={checked}
      aria-label={checked ? t('removeAria') : t('addAria')}
      title={checked ? t('removeAria') : t('addAria')}
      className={cn(
        'inline-flex h-8 w-8 items-center justify-center rounded-full border bg-white/90 backdrop-blur transition-all',
        checked
          ? 'border-(--color-brand-yellow) bg-(--color-brand-black) text-white shadow-sm'
          : 'border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900',
        className,
      )}
    >
      {checked ? (
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      ) : (
        <GitCompareArrows className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
