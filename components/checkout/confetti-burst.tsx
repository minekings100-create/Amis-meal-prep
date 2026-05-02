'use client';

import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';

const FIRED_KEY_PREFIX = 'amis-confetti-fired-';

/**
 * Fires a one-time confetti burst on mount, keyed by orderNumber so refreshing
 * the success page doesn't retrigger. Skipped entirely when prefers-reduced-motion.
 */
export function ConfettiBurst({ orderNumber }: { orderNumber: string }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (typeof window === 'undefined') return;
    const key = FIRED_KEY_PREFIX + orderNumber;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    let cancelled = false;
    (async () => {
      const mod = await import('canvas-confetti');
      if (cancelled) return;
      const confetti = mod.default;
      const colors = ['#e8a91c', '#f5b727', '#0a0a0a', '#ffffff'];
      const end = Date.now() + 2000;

      const tick = () => {
        confetti({
          particleCount: 4,
          startVelocity: 28,
          spread: 70,
          origin: { x: 0.15, y: 0.4 },
          colors,
          ticks: 200,
        });
        confetti({
          particleCount: 4,
          startVelocity: 28,
          spread: 70,
          origin: { x: 0.85, y: 0.4 },
          colors,
          ticks: 200,
        });
        if (!cancelled && Date.now() < end) requestAnimationFrame(tick);
      };
      tick();
    })();

    return () => {
      cancelled = true;
    };
  }, [orderNumber, reduce]);

  return null;
}
