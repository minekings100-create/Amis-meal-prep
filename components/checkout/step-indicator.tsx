'use client';

import { Check } from 'lucide-react';
import { Link } from '@/lib/i18n/navigation';
import { cn } from '@/lib/utils/cn';

export type CheckoutStep = 'details' | 'shipping' | 'payment';

const STEPS: Array<{ key: CheckoutStep; label: string; index: number; href: string }> = [
  { key: 'details', label: 'Bezorggegevens', index: 1, href: '/checkout/details' },
  { key: 'shipping', label: 'Verzending', index: 2, href: '/checkout/shipping' },
  { key: 'payment', label: 'Betaling', index: 3, href: '/checkout/payment' },
];

export function StepIndicator({ active }: { active: CheckoutStep }) {
  const activeIdx = STEPS.findIndex((s) => s.key === active);
  const progressPct = (activeIdx / (STEPS.length - 1)) * 100;

  return (
    <nav aria-label="Checkout voortgang" className="mb-8 md:mb-12">
      <div className="relative max-w-2xl mx-auto">
        {/* Background track */}
        <div className="absolute left-4 right-4 top-5 md:top-6 h-0.5 bg-stone-200 -z-0" aria-hidden />
        {/* Progress line — solid black up to the active step */}
        <div
          aria-hidden
          className="absolute left-4 top-5 md:top-6 h-0.5 bg-(--color-brand-black) transition-all duration-500 ease-out -z-0"
          style={{ width: `calc((100% - 32px) * ${progressPct / 100})` }}
        />
        <ol className="relative flex items-start justify-between">
          {STEPS.map((step) => {
            const isActive = step.key === active;
            const isDone = STEPS.findIndex((s) => s.key === step.key) < activeIdx;
            const clickable = isDone;
            const Wrapper = (clickable ? Link : 'div') as 'div';
            const props = clickable ? { href: step.href } : {};

            return (
              <li key={step.key} className="flex flex-col items-center text-center w-20">
                <Wrapper
                  {...(props as object)}
                  className={cn(
                    'relative z-10 inline-flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full text-sm font-semibold transition-all',
                    isDone
                      ? 'bg-(--color-brand-yellow) text-(--color-brand-black) hover:scale-105'
                      : isActive
                        ? 'bg-(--color-brand-black) text-white scale-110 shadow-[0_8px_20px_-6px_rgba(10,10,10,0.4)]'
                        : 'bg-stone-200 text-stone-500',
                  )}
                >
                  {isDone ? <Check className="h-4 w-4" strokeWidth={3} /> : step.index}
                </Wrapper>
                <span
                  className={cn(
                    'mt-2 text-[10px] md:text-xs font-medium tracking-wide',
                    isActive
                      ? 'text-stone-900'
                      : isDone
                        ? 'text-(--color-brand-yellow-deep)'
                        : 'text-stone-500',
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
