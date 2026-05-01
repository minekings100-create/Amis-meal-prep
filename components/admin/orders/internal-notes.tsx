'use client';

import { useState, useTransition } from 'react';
import { Save } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { saveInternalNoteAction } from '@/app/admin/_actions/orders';

export function InternalNotes({
  orderId,
  initialValue,
}: {
  orderId: string;
  initialValue: string | null;
}) {
  const [value, setValue] = useState(initialValue ?? '');
  const [pending, start] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const dirty = (initialValue ?? '') !== value;

  function save() {
    start(async () => {
      const res = await saveInternalNoteAction(orderId, value);
      if (res.ok) setSavedAt(new Date().toLocaleTimeString('nl-NL'));
    });
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">
          Interne notitie
        </h3>
        {savedAt && !dirty && (
          <span className="text-[11px] text-stone-400">opgeslagen om {savedAt}</span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Notities voor je team — niet zichtbaar voor klant…"
        rows={4}
        className="w-full rounded-md border border-stone-200 bg-stone-50/50 px-3 py-2 text-sm focus:outline-none focus:border-(--color-accent) focus:bg-white focus:ring-2 focus:ring-(--color-accent-bright)/30"
      />
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-4 rounded-md text-sm font-medium transition-colors',
            dirty
              ? 'bg-stone-900 text-white hover:bg-black disabled:opacity-60'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed',
          )}
        >
          <Save className="h-3.5 w-3.5" />
          {pending ? 'Opslaan…' : 'Opslaan'}
        </button>
      </div>
    </div>
  );
}
