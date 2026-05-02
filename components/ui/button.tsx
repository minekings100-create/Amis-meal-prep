import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold',
    'transition-colors duration-[250ms] ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-brand-yellow) focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:scale-[0.98]',
  ].join(' '),
  {
    variants: {
      variant: {
        // The AMIS primary button: black at rest, full yellow on hover.
        // Smooth colour transition via transition-colors (covers bg + fg).
        primary:
          'bg-(--color-brand-black) text-white hover:bg-(--color-brand-yellow) hover:text-(--color-brand-black)',
        // Inverse — used over dark photo / dark surface where the primary
        // needs to be the bright yellow up front and goes black on hover.
        'primary-yellow':
          'bg-(--color-brand-yellow) text-(--color-brand-black) hover:bg-(--color-brand-black) hover:text-white',
        // Neutral white outline — secondary CTA on light surfaces.
        secondary:
          'border border-stone-300 bg-white text-stone-900 hover:bg-stone-50 hover:border-stone-400',
        // Outline kept as alias for backwards compat with existing call sites.
        outline:
          'border border-stone-300 bg-white text-stone-900 hover:bg-stone-50 hover:border-stone-400',
        // Ghost — chrome-less, for low-priority text actions.
        ghost: 'bg-transparent text-stone-700 hover:bg-stone-100 hover:text-stone-900',
        // Link — text link with underline on hover.
        link: 'text-(--color-brand-black) underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-4 text-sm rounded-full',
        md: 'h-11 px-5 text-sm rounded-full',
        lg: 'h-12 px-6 text-base rounded-full',
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
