import * as React from 'react';
import { cn } from '@/lib/utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-[--radius-sm] border border-[--color-line] bg-white px-4 py-2 text-sm',
        'placeholder:text-[--color-gray]',
        'focus-visible:outline-none focus-visible:border-[--color-accent] focus-visible:ring-2 focus-visible:ring-[--color-accent-bright]/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-colors',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
