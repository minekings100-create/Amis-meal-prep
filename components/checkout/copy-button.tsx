'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs text-stone-600 hover:bg-stone-100 transition-colors"
      aria-label={label ?? 'Kopieer'}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-700" />
          <span className="text-emerald-700 font-medium">Gekopieerd</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label ?? 'Kopieer'}</span>
        </>
      )}
    </button>
  );
}
