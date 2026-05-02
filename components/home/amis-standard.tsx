'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { RevealSection } from '@/components/layout/reveal-section';

interface Value {
  titleKey: string;
  bodyKey: string;
}

const VALUES: Value[] = [
  { titleKey: 'value1Title', bodyKey: 'value1Body' },
  { titleKey: 'value2Title', bodyKey: 'value2Body' },
  { titleKey: 'value3Title', bodyKey: 'value3Body' },
  { titleKey: 'value4Title', bodyKey: 'value4Body' },
  { titleKey: 'value5Title', bodyKey: 'value5Body' },
];

export function AmisStandard() {
  const t = useTranslations('amisStandard');

  return (
    <section className="bg-[#f7f7f5] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <RevealSection>
          <header className="mb-10 md:mb-14">
            <h2 className="font-bold uppercase tracking-tight text-stone-300 text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
              {t('lineMuted')}
            </h2>
            <h3 className="font-bold uppercase tracking-tight text-stone-900 text-4xl md:text-5xl lg:text-6xl leading-[0.95] mt-1">
              {t('lineDark')}
            </h3>
          </header>
        </RevealSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10">
          {VALUES.map((v, i) => (
            <RevealSection key={v.titleKey} delay={i * 0.08}>
              <div>
                <div className="h-10 w-10 rounded-full bg-(--color-brand-yellow) text-(--color-brand-black) inline-flex items-center justify-center mb-5">
                  <Check className="h-5 w-5" strokeWidth={3} />
                </div>
                <h4 className="font-bold uppercase tracking-wide text-sm text-stone-900 mb-3 leading-snug">
                  {t(v.titleKey)}
                </h4>
                <p className="text-sm text-stone-600 leading-relaxed">{t(v.bodyKey)}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
