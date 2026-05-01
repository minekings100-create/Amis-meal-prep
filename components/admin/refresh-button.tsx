'use client';

import { useTransition } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { refreshDashboardAction } from '@/app/admin/_actions/dashboard';

export function RefreshButton() {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      onClick={() => start(() => refreshDashboardAction())}
      disabled={pending}
      className="inline-flex items-center gap-2 px-3 h-9 rounded-md border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-stone-50 disabled:opacity-60 transition-colors"
    >
      <RefreshCw className={cn('h-3.5 w-3.5', pending && 'animate-spin')} />
      {pending ? 'Verversen…' : 'Ververs'}
    </button>
  );
}
