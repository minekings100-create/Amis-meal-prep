'use server';

import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/lib/admin/auth';

export async function refreshDashboardAction(): Promise<void> {
  await checkAdminAccess('staff');
  revalidatePath('/admin');
}
