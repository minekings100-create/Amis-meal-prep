'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils/cn';

interface ThemeToggleProps {
  /** When true, button uses lighter colours suited for the transparent hero header. */
  transparent?: boolean;
  /** Extra wrapper classes for layout (e.g. mobile menu drawer). */
  className?: string;
}

/**
 * Button that flips the public site between light and dark mode. The icon
 * shown represents the theme you'd switch *to*: a moon in light mode, a
 * sun in dark mode. Hidden until mounted to avoid hydration mismatch
 * (next-themes doesn't know the chosen theme until after first render).
 */
export function ThemeToggle({ transparent = false, className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';
  const next = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={isDark ? 'Schakel naar licht thema' : 'Schakel naar donker thema'}
      title={isDark ? 'Licht' : 'Donker'}
      className={cn(
        'inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors',
        transparent
          ? 'text-white/85 hover:text-white hover:bg-white/10'
          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 dark:text-stone-300 dark:hover:text-white dark:hover:bg-white/10',
        className,
      )}
    >
      {/* Render Sun in dark (suggesting switch back), Moon in light. */}
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        // Pre-mount placeholder keeps button width stable
        <span className="h-4 w-4" aria-hidden />
      )}
    </button>
  );
}
