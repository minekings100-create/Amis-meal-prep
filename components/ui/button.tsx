import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium',
    'transition duration-200 ease-out will-change-transform',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-[--color-accent-bright] text-[--color-ink] hover:bg-[--color-accent] hover:text-white shadow-[var(--shadow-glow)]',
        secondary:
          'bg-[--color-ink] text-white hover:bg-[#000]',
        outline:
          'border border-[--color-line] bg-transparent text-[--color-ink] hover:bg-[--color-bg-soft]',
        ghost: 'bg-transparent text-[--color-ink] hover:bg-[--color-bg-soft]',
        link: 'text-[--color-accent] underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-[--radius-sm]',
        md: 'h-11 px-6 text-sm rounded-[--radius-sm]',
        lg: 'h-14 px-8 text-base rounded-[--radius]',
        icon: 'h-10 w-10 rounded-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
    );
  },
);
Button.displayName = 'Button';

export { buttonVariants };
