'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { setCustomerImpersonation, getCurrentCustomer } from '@/lib/account/auth';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export interface AuthResult {
  ok: boolean;
  message?: string;
  /** Set when login succeeds and we want the client to navigate. */
  redirectTo?: string;
}

export async function loginWithPasswordAction(
  email: string,
  password: string,
  next: string = '/account',
): Promise<AuthResult> {
  if (!email || !password) return { ok: false, message: 'Vul email en wachtwoord in' };

  if (!isSupabaseConfigured()) {
    // Dev shortcut — accept any input, set impersonation cookie.
    await setCustomerImpersonation('1');
    return { ok: true, redirectTo: next };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, message: error.message };
  return { ok: true, redirectTo: next };
}

export async function loginWithMagicLinkAction(
  email: string,
  next: string = '/account',
): Promise<AuthResult> {
  if (!email) return { ok: false, message: 'Vul je e-mailadres in' };
  if (!isSupabaseConfigured()) {
    await setCustomerImpersonation('1');
    return { ok: true, redirectTo: next, message: 'Dev mode: ingelogd zonder magic link' };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const sb = await createClient();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}${next}` },
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Magic link verstuurd — check je inbox' };
}

export async function registerAction(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  newsletter: boolean;
}): Promise<AuthResult> {
  const { email, password, firstName, lastName } = input;
  if (!email || !password || !firstName || !lastName)
    return { ok: false, message: 'Vul alle verplichte velden in' };
  if (password.length < 8)
    return { ok: false, message: 'Wachtwoord moet minimaal 8 karakters zijn' };

  if (!isSupabaseConfigured()) {
    await setCustomerImpersonation('1');
    return { ok: true, redirectTo: '/account', message: 'Dev mode: account aangemaakt' };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const sb = await createClient();
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/account`,
    },
  });
  if (error) return { ok: false, message: error.message };
  if (data.user) {
    const { createServiceRoleClient } = await import('@/lib/supabase/server');
    const sbAdmin = createServiceRoleClient();
    await sbAdmin
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName })
      .eq('id', data.user.id);
  }
  return { ok: true, redirectTo: '/account' };
}

export async function requestPasswordResetAction(email: string): Promise<AuthResult> {
  if (!email) return { ok: false, message: 'Vul je e-mailadres in' };
  if (!isSupabaseConfigured()) {
    return { ok: true, message: 'Dev mode: reset-link wordt gesimuleerd' };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const sb = await createClient();
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/account/reset-password`,
  });
  if (error) return { ok: false, message: error.message };
  return { ok: true, message: 'Reset-link verstuurd — check je inbox' };
}

export async function resetPasswordAction(newPassword: string): Promise<AuthResult> {
  if (newPassword.length < 8)
    return { ok: false, message: 'Wachtwoord moet minimaal 8 karakters zijn' };
  if (!isSupabaseConfigured()) {
    return { ok: true, redirectTo: '/account/login', message: 'Dev mode: wachtwoord gewijzigd' };
  }
  const { createClient } = await import('@/lib/supabase/server');
  const sb = await createClient();
  const { error } = await sb.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, message: error.message };
  return { ok: true, redirectTo: '/account', message: 'Wachtwoord bijgewerkt' };
}

export async function logoutAction(): Promise<void> {
  if (isSupabaseConfigured()) {
    const { createClient } = await import('@/lib/supabase/server');
    const sb = await createClient();
    await sb.auth.signOut();
  }
  await setCustomerImpersonation(null);
  redirect('/');
}

export async function updateProfileAction(input: {
  firstName: string;
  lastName: string;
  phone: string;
  newsletter: boolean;
}): Promise<AuthResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, message: 'Niet ingelogd' };
  if (!isSupabaseConfigured()) return { ok: true, message: 'Dev mode: opgeslagen (niet persistent)' };

  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  const sb = createServiceRoleClient();
  const { error } = await sb
    .from('profiles')
    .update({
      first_name: input.firstName,
      last_name: input.lastName,
      phone: input.phone,
    })
    .eq('id', customer.userId);
  if (error) return { ok: false, message: error.message };
  revalidatePath('/account/profile');
  return { ok: true, message: 'Profiel opgeslagen' };
}

export async function deleteAccountAction(): Promise<AuthResult> {
  const customer = await getCurrentCustomer();
  if (!customer) return { ok: false, message: 'Niet ingelogd' };
  if (!isSupabaseConfigured()) {
    await setCustomerImpersonation(null);
    return { ok: true, redirectTo: '/' };
  }
  const { createServiceRoleClient } = await import('@/lib/supabase/server');
  const sb = createServiceRoleClient();
  await sb.auth.admin.deleteUser(customer.userId);
  await setCustomerImpersonation(null);
  return { ok: true, redirectTo: '/' };
}
