import { createServiceRoleClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

export interface AdminUserRow {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  lastSignInAt: string | null;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function listAdminUsers(): Promise<{ rows: AdminUserRow[]; isMocked: boolean }> {
  if (!isSupabaseConfigured()) return { rows: mockedUsers(), isMocked: true };
  const sb = createServiceRoleClient();

  const { data: profiles } = await sb
    .from('profiles')
    .select('id,email,first_name,last_name,role,created_at')
    .in('role', ['staff', 'owner'])
    .order('created_at', { ascending: false });

  // last_sign_in_at lives in auth.users (admin API). Fetch in batch.
  const ids = (profiles ?? []).map((p) => p.id);
  const lastSignInById = new Map<string, string | null>();
  for (const id of ids) {
    try {
      const { data } = await sb.auth.admin.getUserById(id);
      lastSignInById.set(id, data.user?.last_sign_in_at ?? null);
    } catch {
      lastSignInById.set(id, null);
    }
  }

  const rows: AdminUserRow[] = (profiles ?? []).map((p) => ({
    userId: p.id,
    email: p.email,
    name: `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() || p.email,
    role: p.role,
    createdAt: p.created_at,
    lastSignInAt: lastSignInById.get(p.id) ?? null,
  }));

  return { rows, isMocked: false };
}

function mockedUsers(): AdminUserRow[] {
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;
  return [
    { userId: 'u-owner', email: 'sam@amismeals.nl', name: 'Sam Bessems', role: 'owner', createdAt: new Date(now - 200 * day).toISOString(), lastSignInAt: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
    { userId: 'u-staff-1', email: 'lynne@amismeals.nl', name: 'Lynne Krijnen', role: 'staff', createdAt: new Date(now - 80 * day).toISOString(), lastSignInAt: new Date(now - 5 * 60 * 60 * 1000).toISOString() },
    { userId: 'u-staff-2', email: 'jeroen@amismeals.nl', name: 'Jeroen Smit', role: 'staff', createdAt: new Date(now - 35 * day).toISOString(), lastSignInAt: new Date(now - 4 * day).toISOString() },
  ];
}
