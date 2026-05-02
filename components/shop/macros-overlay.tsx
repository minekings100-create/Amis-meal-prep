'use client';

import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

/**
 * In-card overlay (not a modal) that visualises a meal's macro split via
 * three horizontal bars + a prominent kcal total. Sized to absolute-fill
 * the parent card, which must be position:relative + rounded-2xl.
 */
interface MacrosOverlayProps {
  open: boolean;
  onClose: () => void;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  kcal: number | null;
}

// Reference-intake values (Voedingscentrum NL, dagelijkse RI per portie).
const RI = { protein: 50, carbs: 260, fat: 70 };

export function MacrosOverlay({
  open,
  onClose,
  proteinG,
  carbsG,
  fatG,
  kcal,
}: MacrosOverlayProps) {
  const reduce = useReducedMotion();

  // Esc to close while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const transition = reduce ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <motion.div
      role="dialog"
      aria-label="Voedingswaarden"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
      transition={transition}
      onClick={(e) => {
        // Always stop the click from bubbling up to the parent <Link>; only
        // close when the click landed on the overlay surface itself (not a
        // child like the Sluiten button).
        e.preventDefault();
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
      className="absolute inset-0 z-20 rounded-2xl bg-white/95 backdrop-blur-sm flex flex-col p-5 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          Voedingswaarden per portie
        </p>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Sluit voedingswaarden"
          className="h-7 w-7 inline-flex items-center justify-center rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        <MacroBar
          label="Eiwit"
          valueG={proteinG}
          referenceG={RI.protein}
          fillClass="bg-(--color-brand-yellow)"
        />
        <MacroBar
          label="Koolhydraten"
          valueG={carbsG}
          referenceG={RI.carbs}
          fillClass="bg-stone-700"
        />
        <MacroBar label="Vet" valueG={fatG} referenceG={RI.fat} fillClass="bg-stone-500" />
      </div>

      {kcal !== null && (
        <div className="mt-4 pt-4 border-t border-stone-200 text-center">
          <p className="text-3xl font-light tabular-nums tracking-tight text-stone-900">
            {kcal} <span className="text-base text-stone-500">kcal</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}

function MacroBar({
  label,
  valueG,
  referenceG,
  fillClass,
}: {
  label: string;
  valueG: number | null;
  referenceG: number;
  fillClass: string;
}) {
  if (valueG === null) {
    return (
      <div className="text-xs text-stone-400 italic">{label}: niet beschikbaar</div>
    );
  }
  const pct = Math.min(100, Math.round((valueG / referenceG) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-xs font-semibold text-stone-900 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-sm font-semibold tabular-nums text-stone-900">
          {valueG}
          <span className="text-xs text-stone-500 ml-0.5">g</span>
          <span className="ml-1.5 text-[10px] font-normal text-stone-500 tabular-nums">
            {pct}% RI
          </span>
        </span>
      </div>
      <div className="relative h-1.5 rounded-full bg-stone-200 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', fillClass)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
