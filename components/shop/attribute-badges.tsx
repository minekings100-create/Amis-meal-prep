import { cn } from '@/lib/utils/cn';
import { ATTRIBUTE_TAGS, attributeLabel, sortAttributesByPriority } from '@/lib/tags';
import type { AttributeTag } from '@/types/database';

type Size = 'xs' | 'sm';

const sizeClasses: Record<Size, { base: string; icon: string }> = {
  xs: { base: 'px-1.5 py-0.5 text-[10px] gap-0.5', icon: 'h-2.5 w-2.5' },
  // sm bumped from py-0.5 to py-1 so the pills line up with a GoalBadge
  // size="md" (same py-1) when both render in the same flex row.
  sm: { base: 'px-2.5 py-1 text-[11px] gap-1', icon: 'h-3 w-3' },
};

export function AttributeBadges({
  tags,
  locale,
  max = 3,
  size = 'sm',
  className,
  showOverflow = true,
  inline = false,
}: {
  tags: AttributeTag[];
  locale: 'nl' | 'en';
  max?: number;
  size?: Size;
  className?: string;
  showOverflow?: boolean;
  /** When true, render pills as fragment siblings (no wrapping div). Lets
   *  the parent control the flex layout so attribute pills can sit on the
   *  same baseline as a GoalBadge. */
  inline?: boolean;
}) {
  if (!tags?.length) return null;
  const sorted = sortAttributesByPriority(tags);
  const visible = sorted.slice(0, max);
  const overflow = sorted.length - visible.length;
  const sz = sizeClasses[size];

  const pills = (
    <>
      {visible.map((tag) => {
        const cfg = ATTRIBUTE_TAGS[tag];
        const Icon = cfg.icon;
        return (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center rounded-full font-medium whitespace-nowrap',
              sz.base,
              cfg.bg,
              cfg.text,
            )}
          >
            <Icon className={sz.icon} aria-hidden />
            <span>{attributeLabel(tag, locale)}</span>
          </span>
        );
      })}
      {showOverflow && overflow > 0 && (
        <span
          className={cn(
            'inline-flex items-center rounded-full font-medium bg-stone-100 text-stone-600',
            sz.base,
          )}
          aria-label={`${overflow} more`}
        >
          +{overflow}
        </span>
      )}
    </>
  );

  if (inline) return pills;

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>{pills}</div>
  );
}
