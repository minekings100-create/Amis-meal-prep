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
      <header className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold tracking-[-0.035em]">{title}</h1>
        <p className="text-sm text-stone-500 mt-3 font-mono">Laatst bijgewerkt: {lastUpdated}</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-24">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
              Inhoud
            </p>
            <ul className="space-y-1.5">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className={cn(
                      'block text-sm leading-snug transition-colors',
                      activeId === s.id
                        ? 'text-(--color-accent) font-medium'
                        : 'text-stone-600 hover:text-stone-900',
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
