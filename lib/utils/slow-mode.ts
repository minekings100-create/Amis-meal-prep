/**
 * Dev-only: when a page receives `?slow=N`, server components can `await maybeSlow(searchParams)`
 * before fetching to artificially delay rendering. Used to capture skeleton screenshots.
 *
 * No-op in production builds.
 */
export async function maybeSlow(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): Promise<void> {
  if (process.env.NODE_ENV === 'production') return;
  if (!searchParams) return;
  const raw = searchParams.slow;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return;
  const ms = Number.parseInt(value, 10);
  if (!Number.isFinite(ms) || ms <= 0) return;
  await new Promise((r) => setTimeout(r, Math.min(ms, 10_000)));
}
