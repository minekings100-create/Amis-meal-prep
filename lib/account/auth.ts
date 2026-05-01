import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface CustomerProfile {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  hasUsedTryout: boolean;
  /** True when running in dev fallback (no Supabase configured) and impersonation cookie is set. */
  impersonated: boolean;
}

const IMPERSONATE_COOKIE = 'amis-customer-impersonate';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Get the current customer profile, or null if not signed in.
 *
 * Real mode: reads Supabase session, fetches profile.
 * Dev mode: reads `amis-customer-impersonate` cookie. If set, returns a stub
 * customer so account pages render. Set via /account/login dev shortcut.
 */
export async function getCurrentCustomer(): Promise<CustomerProfile | null> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const sb = await createClient();
    const { data: auth } = await sb.auth.getUser();
    if (!auth.user) return null;
    const { data } = await sb
      .from('profiles')
      .select('id,email,first_name,last_name,phone,has_used_tryout')
      .eq('id', auth.user.id)
      .maybeSingle();
    type ProfileRow = {
      id: string;
      email: string;
      first_name: string | null;
      last_name: string | null;
      phone: string | null;
      has_used_tryout: boolean;
    };
    const p = data as unknown as ProfileRow | null;
    if (!p) return null;
    return {
      userId: p.id,
      email: p.email,
      firstName: p.first_name,
      lastName: p.last_name,
      phone: p.phone,
      hasUsedTryout: p.has_used_tryout,
      impersonated: false,
    };
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(IMPERSONATE_COOKIE)?.value;
  if (!value) return null;
  return {
    userId: 'dev-customer',
    email: 'sanne@amismeals.nl',
    firstName: 'Sanne',
    lastName: 'van Loon',
    phone: '+31 6 1234 5678',
    hasUsedTryout: false,
    impersonated: true,
  };
}

/**
 * Guard for protected /account/* pages. Redirects to login if not signed in.
 */
export async function requireCustomer(redirectTo: string = '/account'): Promise<CustomerProfile> {
  const customer = await getCurrentCustomer();
  if (!customer) {
    redirect(`/account/login?next=${encodeURIComponent(redirectTo)}`);
  }
  return customer;
}

export async function setCustomerImpersonation(value: '1' | null): Promise<void> {
  const cookieStore = await cookies();
  if (value === null) {
    cookieStore.delete(IMPERSONATE_COOKIE);
  } else {
    cookieStore.set(IMPERSONATE_COOKIE, value, {
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}
