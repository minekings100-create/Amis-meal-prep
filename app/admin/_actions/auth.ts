'use server';

import { redirect } from 'next/navigation';
import { clearImpersonation } from '@/lib/admin/auth';

export async function logoutAction() {
  // Real Supabase signOut when configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();
    await supabase.auth.signOut();
  } else {
    await clearImpersonation();
  }
  redirect('/account/login');
}
