import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  label: string;
  value: number;
  href?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'warn' | 'danger';
  hint?: string;
}

const toneStyles = {
  default: {
    accent: 'text-[--color-accent]',
    iconBg: 'bg-[--color-accent-bright]/12 text-[--color-accent]',
    chip: 'bg-[--color-accent-bright]/15 text-[--color-accent]',
  },
  warn: {
    accent: 'text-amber-700',
    iconBg: 'bg-amber-100 text-amber-700',
    chip: 'bg-amber-100 text-amber-800',
  },
  danger: {
    accent: 'text-red-700',
    iconBg: 'bg-red-100 text-red-700',
    chip: 'bg-red-100 text-red-700',
  },
} as const;

export function StatCard({
  label,
  value,
  href,
  icon: Icon,
  tone = 'default',
  hint,
}: StatCardProps) {
  const styles = toneStyles[value > 0 ? tone : 'default'];
  const className = cn(
    'group block rounded-2xl border border-stone-200 bg-white p-5 transition-all',
    href && 'hover:border-stone-300 hover:shadow-[0_8px_24px_-12px_rgba(19,22,19,0.12)]',
  );
  const inner = (
    <>
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={cn('h-9 w-9 rounded-lg inline-flex items-center justify-center', styles.iconBg)}>
            <Icon className="h-[18px] w-[18px]" />
          </div>
        )}
        {value > 0 && tone !== 'default' && (
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider', styles.chip)}>
            <ArrowUpRight className="h-3 w-3" /> Aandacht
          </span>
        )}
      </div>
      <div className="mt-5">
        <div className={cn('font-mono text-4xl tracking-[-0.04em] tabular-nums', value === 0 ? 'text-stone-400' : 'text-stone-900')}>
          {value}
        </div>
        <p className="mt-1 text-sm text-stone-600">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-stone-400">{hint}</p>}
      </div>
    </>
  );

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
