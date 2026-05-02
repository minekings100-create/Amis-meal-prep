'use client';

import { Check, X } from 'lucide-react';
import { useToastStore } from '@/lib/toast/store';

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex items-start gap-3 max-w-sm bg-(--color-ink) text-white pl-4 pr-3 py-3 rounded-2xl shadow-[0_12px_40px_-16px_rgba(19,22,19,0.4)] animate-toast-in"
        >
          <span className="mt-0.5 h-6 w-6 inline-flex items-center justify-center rounded-full bg-(--color-brand-yellow-bright) text-(--color-ink) shrink-0">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          <div className="flex-1 min-w-0 text-sm">
            <p className="font-medium leading-tight">{t.title}</p>
            {t.body && <p className="text-white/70 mt-0.5 text-xs leading-snug">{t.body}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="Sluiten"
            className="ml-1 h-6 w-6 inline-flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
