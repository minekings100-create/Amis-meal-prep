'use client';

import { useInView, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Count from 0 → end when scrolled into view (once).
 * - `decimals`: keep N decimals (e.g. 1 for "9,2")
 * - `prefix`/`suffix`: literal strings appended outside the number
 * - `locale`: forwarded to Intl.NumberFormat for grouping/decimal separator
 *
 * Renders the final value immediately if user prefers reduced motion.
 */
export function CountUp({
  end,
  duration = 1.4,
  decimals = 0,
  prefix = '',
  suffix = '',
  locale = 'nl-NL',
}: {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [value, setValue] = useState(reduce ? end : 0);

  useEffect(() => {
    if (reduce) return;
    if (!isInView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setValue(end * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, end, duration, reduce]);

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

  return (
    <span ref={ref} aria-label={`${prefix}${end}${suffix}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
