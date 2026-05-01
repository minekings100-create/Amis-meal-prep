'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { useTransition } from 'react';
import { cn } from '@/lib/utils/cn';

export function LocaleSwitch({ transparent = false }: { transparent?: boolean }) {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center text-xs font-medium" aria-label={t('language')}>
      {locales.map((l, i) => (
        <button
          key={l}
          type="button"
          onClick={() => handleChange(l)}
          disabled={isPending}
          className={cn(
            'px-2 py-1 transition-colors',
            i > 0 && (transparent ? 'border-l border-white/20' : 'border-l border-stone-200'),
            l === locale
              ? transparent
                ? 'text-white'
                : 'text-stone-900'
              : transparent
                ? 'text-white/60 hover:text-white'
                : 'text-stone-500 hover:text-stone-900',
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
