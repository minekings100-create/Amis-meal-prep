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
    <section className="relative bg-(--color-brand-black) text-white py-16 md:py-24 overflow-hidden">
      {/* Subtle ghost-AMIS watermark in the bottom-right, same trick as the footer */}
      <div
        aria-hidden
        className="absolute -bottom-12 -right-12 select-none pointer-events-none text-[28rem] font-bold tracking-[-0.06em] text-white/[0.02] leading-none"
      >
        AMIS
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <RevealSection>
          <header className="mb-10 md:mb-14">
            <h2 className="font-bold uppercase tracking-tight text-white/30 text-4xl md:text-5xl lg:text-6xl leading-[0.95]">
              {t('lineMuted')}
            </h2>
            <h3 className="font-bold uppercase tracking-tight text-white text-4xl md:text-5xl lg:text-6xl leading-[0.95] mt-1">
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
                <h4 className="font-bold uppercase tracking-wide text-sm text-white mb-3 leading-snug">
                  {t(v.titleKey)}
                </h4>
                <p className="text-sm text-white/70 leading-relaxed">{t(v.bodyKey)}</p>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
