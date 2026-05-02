'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface LegalSection {
  id: string;
  title: string;
}

export function LegalLayout({
  title,
  lastUpdated,
  sections,
  children,
}: {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
  children: React.ReactNode;
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="container-amis py-12 md:py-20 max-w-6xl">
      <header className="mb-8 md:mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.035em]">{title}</h1>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-mono text-stone-600">
          <span className="h-1.5 w-1.5 rounded-full bg-(--color-brand-yellow)" aria-hidden />
          Laatst bijgewerkt: {lastUpdated}
        </div>
      </header>

      {/* Mobile: horizontal pill nav for section jumps */}
      <nav className="lg:hidden -mx-1 px-1 mb-8 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              'shrink-0 inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-colors whitespace-nowrap',
              activeId === s.id
                ? 'bg-(--color-brand-black) text-white border-(--color-brand-black)'
                : 'bg-white text-stone-700 border-stone-200 hover:border-stone-300',
            )}
          >
            {s.title}
          </a>
        ))}
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
              Inhoud
            </p>
            <ul className="space-y-0.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      'block text-sm leading-snug px-3 py-1.5 -mx-3 rounded-md border-l-2 transition-colors',
                      activeId === s.id
                        ? 'border-(--color-brand-yellow) bg-stone-50 text-stone-900 font-medium'
                        : 'border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-50/60',
                    )}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <article className="prose-amis max-w-3xl">{children}</article>
      </div>
    </div>
  );
}
