'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';
import type { UserRole } from '@/types/database';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export interface UserActionResult {
  ok: boolean;
  message?: string;
}

export async function inviteAdminAction(
  email: string,
  role: 'staff' | 'owner',
): Promise<UserActionResult> {
  await checkAdminAccess('owner');
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return { ok: false, message: 'Ongeldig email adres' };
  }
  if (!isSupabaseConfigured()) {
    return { ok: true, message: `Mocked: zou ${trimmed} uitnodigen als ${role}.` };
  }

  const sb = createServiceRoleClient();
  // Create / invite via Supabase Auth admin API; sends magic-link email.
  // The on_auth_user_created trigger creates the profile row. We then bump role.
  const { data, error } = await sb.auth.admin.inviteUserByEmail(trimmed, {
    data: { invited_role: role },
  });
  if (error) return { ok: false, message: error.message };
  if (data.user) {
    await sb.from('profiles').update({ role }).eq('id', data.user.id);
  }
  revalidatePath('/admin/users');
  return { ok: true, message: `${trimmed} is uitgenodigd.` };
}

export async function updateUserRoleAction(
  userId: string,
  newRole: UserRole,
): Promise<UserActionResult> {
  const ctx = await checkAdminAccess('owner');
  if (newRole === 'owner' && ctx.role !== 'owner') {
    return { ok: false, message: 'Alleen owners kunnen de owner-rol toekennen' };
  }
  if (!isSupabaseConfigured()) return { ok: true };
  const sb = createServiceRoleClient();
  const { error } = await sb.from('profiles').update({ role: newRole }).eq('id', userId);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/users');
  return { ok: true };
}

export async function removeAdminAction(userId: string): Promise<UserActionResult> {
  const ctx = await checkAdminAccess('owner');
  if (userId === ctx.userId) {
    return { ok: false, message: 'Je kan jezelf niet verwijderen.' };
  }
  if (!isSupabaseConfigured()) return { ok: true };
  const sb = createServiceRoleClient();
  const { error } = await sb.from('profiles').update({ role: 'customer' }).eq('id', userId);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/users');
  return { ok: true };
}
