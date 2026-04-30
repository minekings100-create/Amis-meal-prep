import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium tracking-wide uppercase rounded-full',
  {
    variants: {
      variant: {
        default: 'bg-[--color-bg-soft] text-[--color-ink-soft] border border-[--color-line]',
        accent: 'bg-[--color-accent-bright]/15 text-[--color-accent] border border-[--color-accent-bright]/30',
        ink: 'bg-[--color-ink] text-white',
        outline: 'bg-transparent border border-[--color-line] text-[--color-ink-soft]',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
