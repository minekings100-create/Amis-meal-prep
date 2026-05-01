'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload, X, ImageIcon, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { uploadProductImageAction } from '@/app/admin/_actions/upload';

export function MainImageUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  function upload(file: File) {
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    start(async () => {
      const res = await uploadProductImageAction(fd);
      if (!res.ok) {
        setError(res.message ?? 'Upload mislukt');
        return;
      }
      if (res.url) onChange(res.url);
    });
  }

  return (
    <div>
      {value ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-48 h-48 rounded-lg object-cover bg-stone-100 border border-stone-200" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={pending}
              className="h-8 px-3 rounded-md bg-white/90 backdrop-blur text-stone-800 text-xs font-medium hover:bg-white shadow"
            >
              Vervang
            </button>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="h-8 w-8 rounded-md bg-white/90 backdrop-blur text-red-600 inline-flex items-center justify-center hover:bg-white shadow"
              aria-label="Verwijder"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            const file = e.dataTransfer.files?.[0];
            if (file) upload(file);
          }}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'w-full max-w-md border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            drag ? 'border-[--color-accent] bg-[--color-accent-bright]/10' : 'border-stone-300 hover:border-stone-400 bg-stone-50',
          )}
        >
          <Upload className="h-6 w-6 mx-auto text-stone-400 mb-2" />
          <p className="text-sm font-medium text-stone-700">Klik of sleep een afbeelding</p>
          <p className="text-xs text-stone-500 mt-1">JPG, PNG, WebP — max 5 MB</p>
        </div>
      )}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />
      {pending && <p className="text-xs text-stone-500 mt-2">Uploading…</p>}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}

export function GalleryUpload({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  function upload(file: File) {
    setError(null);
    const fd = new FormData();
    fd.append('file', file);
    start(async () => {
      const res = await uploadProductImageAction(fd);
      if (!res.ok) {
        setError(res.message ?? 'Upload mislukt');
        return;
      }
      if (res.url) onChange([...value, res.url]);
    });
  }

  function removeAt(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  function reorder(from: number, to: number) {
    if (from === to) return;
    const next = [...value];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIdx !== null) reorder(dragIdx, i);
              setDragIdx(null);
            }}
            className="relative group"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="w-24 h-24 rounded-md object-cover bg-stone-100 border border-stone-200" />
            <div className="absolute top-1 left-1 h-6 w-6 rounded bg-white/80 backdrop-blur inline-flex items-center justify-center cursor-grab opacity-0 group-hover:opacity-100">
              <GripVertical className="h-3 w-3 text-stone-700" />
            </div>
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute top-1 right-1 h-6 w-6 rounded bg-white/90 inline-flex items-center justify-center text-red-600 hover:bg-white opacity-0 group-hover:opacity-100"
              aria-label="Verwijder"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={pending}
          className="w-24 h-24 rounded-md border-2 border-dashed border-stone-300 inline-flex flex-col items-center justify-center text-stone-400 hover:border-stone-400 hover:text-stone-600 disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-[10px] mt-1">{pending ? 'Uploading…' : 'Toevoegen'}</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = '';
        }}
      />
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-stone-500 mt-2">
        Sleep om te herordenen. Eerste afbeelding na de hoofdafbeelding wordt als eerste in de galerij getoond.
      </p>
    </div>
  );
}
