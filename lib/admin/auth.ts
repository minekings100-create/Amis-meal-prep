import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserRole } from '@/types/database';

const IMPERSONATE_COOKIE = 'amis-admin-impersonate';

export interface AdminContext {
  userId: string;
  email: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  /** True when running in dev fallback (no Supabase configured). */
  impersonated: boolean;
}

function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Guard for admin routes.
 *
 * - Real mode (Supabase configured): reads the session, looks up profile, enforces role.
 *   Unauthed → redirect to /account/login. Customers → redirect to /admin/forbidden.
 *   Insufficient role (staff trying to read owner-only) → /admin/forbidden.
 *
 * - Dev mode (no Supabase): reads `amis-admin-impersonate` cookie. Set it by visiting
 *   `/admin?as=owner|staff|customer|none`. Defaults to "none" → forces redirect like real
 *   anon, so the auth flow is visible during local dev/screenshots.
 */
export async function checkAdminAccess(required: 'staff' | 'owner' = 'staff'): Promise<AdminContext> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) redirect('/account/login?next=/admin');
    const { data: profile } = await supabase
      .from('profiles')
      .select('id,email,role,first_name,last_name')
      .eq('id', auth.user.id)
      .maybeSingle<{
        id: string;
        email: string;
        role: UserRole;
        first_name: string | null;
        last_name: string | null;
      }>();
    if (!profile || profile.role === 'customer') redirect('/admin/forbidden');
    if (required === 'owner' && profile.role !== 'owner') redirect('/admin/forbidden');
    return {
      userId: profile.id,
      email: profile.email,
      role: profile.role,
      firstName: profile.first_name,
      lastName: profile.last_name,
      impersonated: false,
    };
  }
  return checkDevImpersonation(required);
}

async function checkDevImpersonation(required: 'staff' | 'owner'): Promise<AdminContext> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(IMPERSONATE_COOKIE)?.value ?? 'none';
  const role = (['owner', 'staff', 'customer', 'none'] as const).includes(raw as never)
    ? (raw as 'owner' | 'staff' | 'customer' | 'none')
    : 'none';

  if (role === 'none') redirect('/account/login?next=/admin');
  if (role === 'customer') redirect('/admin/forbidden');
  if (required === 'owner' && role !== 'owner') redirect('/admin/forbidden');

  return {
    userId: role === 'owner' ? 'dev-owner' : 'dev-staff',
    email: role === 'owner' ? 'owner@amismeals.local' : 'staff@amismeals.local',
    role,
    firstName: role === 'owner' ? 'Sam' : 'Lynne',
    lastName: role === 'owner' ? 'Bessems' : 'K.',
    impersonated: true,
  };
}

export async function setImpersonationFromQuery(
  searchParams: Record<string, string | string[] | undefined> | undefined,
): Promise<boolean> {
  if (isSupabaseConfigured()) return false;
  const raw = searchParams?.as;
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return false;
  if (!['owner', 'staff', 'customer', 'none'].includes(value)) return false;
  const cookieStore = await cookies();
  if (value === 'none') {
    cookieStore.delete(IMPERSONATE_COOKIE);
  } else {
    cookieStore.set(IMPERSONATE_COOKIE, value, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day
    });
  }
  return true;
}

export async function clearImpersonation(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATE_COOKIE);
}
