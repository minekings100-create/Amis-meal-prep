'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';
import { createServiceRoleClient } from '@/lib/supabase/server';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export interface ReplayResult {
  ok: boolean;
  message?: string;
}

/**
 * Replay a previously failed webhook by re-running its handler.
 *
 * Currently a stub: marks the entry as 'received' so a real worker would re-pick it up.
 * Once the actual webhook handlers are wired (Phase 1 endpoints exist; processing is
 * idempotent), this should call the same handler function in-process.
 */
export async function replayWebhookAction(webhookId: string): Promise<ReplayResult> {
  await checkAdminAccess('owner');
  if (!isSupabaseConfigured()) return { ok: true, message: 'Mocked replay.' };
  const sb = createServiceRoleClient();
  const { error } = await sb
    .from('webhook_log')
    .update({ status: 'received', error_message: null, processed_at: null })
    .eq('id', webhookId);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/admin/webhooks');
  return { ok: true, message: 'Webhook gemarkeerd voor replay.' };
}
