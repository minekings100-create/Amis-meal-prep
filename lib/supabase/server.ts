import 'server-only';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import {
  createClient as createSbClient,
  type SupabaseClient,
} from '@supabase/supabase-js';
import type { Database } from '@/types/database';

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component context: cookie set is a no-op, refresh handled by middleware.
          }
        },
      },
    },
  );
}

/**
 * Untyped service-role client used by the admin code paths. We deliberately
 * drop the Database generic here: the hand-maintained Database type doesn't
 * line up with supabase-js v2's GenericTable contract for cross-table joins,
 * so Insert/Update/select-with-embeds infer as `never`. Admin lib functions
 * type their own return shapes at the boundary (see lib/admin/*.ts), which is
 * what actually matters for callers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createServiceRoleClient(): SupabaseClient<any, 'public', any> {
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}
