'use client';

import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Subtle hero parallax — photo translates 0→120px over 800px scroll on desktop.
 * Disabled on mobile (≤768px) and for prefers-reduced-motion users to keep
 * scroll smooth on lower-end devices.
 */
export function HeroParallaxImage({ src, alt }: { src: string; alt: string }) {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 120]);

  if (reduce || !enabled) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] sm:object-[center]"
      />
    );
  }

  return (
    <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        className="object-cover object-[70%_center] sm:object-[center]"
      />
    </motion.div>
  );
}
