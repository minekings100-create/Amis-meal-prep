import { cn } from '@/lib/utils/cn';
import { GOAL_TAGS, goalLabel } from '@/lib/tags';
import type { GoalTag } from '@/types/database';

type Variant = 'soft' | 'solid';
type Size = 'sm' | 'md' | 'lg';

const sizeClasses: Record<Size, string> = {
  sm: 'px-2 py-0.5 text-[10px] tracking-[0.14em]',
  md: 'px-3 py-1 text-[11px] tracking-[0.14em]',
  lg: 'px-4 py-1.5 text-xs tracking-[0.14em]',
};

export function GoalBadge({
  tag,
  locale,
  variant = 'soft',
  size = 'md',
  className,
}: {
  tag: GoalTag;
  locale: 'nl' | 'en';
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const cfg = GOAL_TAGS[tag];
  const palette =
    variant === 'solid'
      ? `${cfg.solidBg} ${cfg.solidText}`
      : `${cfg.bg} ${cfg.text} border ${cfg.border}`;

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold uppercase rounded-full whitespace-nowrap',
        sizeClasses[size],
        palette,
        className,
      )}
    >
      {goalLabel(tag, locale)}
    </span>
  );
}
