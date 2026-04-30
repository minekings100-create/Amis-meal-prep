'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/lib/i18n/navigation';
import { locales, type Locale } from '@/lib/i18n/config';
import { useTransition } from 'react';

export function LocaleSwitch() {
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
          className={
            'px-2 py-1 transition-colors ' +
            (l === locale
              ? 'text-[--color-ink]'
              : 'text-[--color-gray] hover:text-[--color-ink]') +
            (i > 0 ? ' border-l border-[--color-line]' : '')
          }
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
