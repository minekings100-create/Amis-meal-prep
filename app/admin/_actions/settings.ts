'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export interface SettingsResult {
  ok: boolean;
  message?: string;
}

export async function saveSettingAction(
  key: 'shipping' | 'company' | 'email' | 'general',
  value: unknown,
): Promise<SettingsResult> {
  const ctx = await checkAdminAccess('owner');
  if (!isSupabaseConfigured()) return { ok: true, message: 'Mocked: zou opslaan in Supabase.' };
  const sb = createServiceRoleClient();
  const { error } = await sb
    .from('settings')
    .upsert({ key, value, updated_by: ctx.userId, updated_at: new Date().toISOString() });
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/settings');
  return { ok: true };
}
