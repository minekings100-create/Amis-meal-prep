import { notFound } from 'next/navigation';

/**
 * Catch-all under /admin so unmatched admin URLs trigger
 * `app/admin/not-found.tsx` (admin-themed) instead of the bare global
 * fallback. Same workaround as the [locale] catch-all.
 */
export default function AdminCatchAll() {
  notFound();
}
