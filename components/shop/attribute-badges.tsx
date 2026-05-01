import { cn } from '@/lib/utils/cn';
import { ATTRIBUTE_TAGS, attributeLabel, sortAttributesByPriority } from '@/lib/tags';
import type { AttributeTag } from '@/types/database';

type Size = 'xs' | 'sm';

const sizeClasses: Record<Size, { base: string; icon: string }> = {
  xs: { base: 'px-1.5 py-0.5 text-[10px] gap-0.5', icon: 'h-2.5 w-2.5' },
  sm: { base: 'px-2 py-0.5 text-[11px] gap-1', icon: 'h-3 w-3' },
};

export function AttributeBadges({
  tags,
  locale,
  max = 3,
  size = 'sm',
  className,
  showOverflow = true,
}: {
  tags: AttributeTag[];
  locale: 'nl' | 'en';
  max?: number;
  size?: Size;
  className?: string;
  showOverflow?: boolean;
}) {
  if (!tags?.length) return null;
  const sorted = sortAttributesByPriority(tags);
  const visible = sorted.slice(0, max);
  const overflow = sorted.length - visible.length;
  const sz = sizeClasses[size];

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
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
    </div>
  );
}
