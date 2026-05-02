import { notFound } from 'next/navigation';

/**
 * Catch-all under [locale] so unmatched URLs trigger the locale-aware
 * `app/[locale]/not-found.tsx` (rendered with shop header + footer)
 * instead of the bare global fallback. Required because Next.js's
 * App Router only resolves not-found.tsx files when notFound() is
 * actually thrown — otherwise it skips dynamic segments.
 */
export default function CatchAll() {
  notFound();
}
