'use server';

/**
 * Public-facing discount-code validator used by the checkout flow.
 *
 * Lives under app/admin/_actions because that's where DB-touching server
 * actions go in this project; semantically this is a customer-facing endpoint
 * and would move to app/_actions/ if we ever split namespaces.
 */

import { createServiceRoleClient } from '@/lib/supabase/server';

export interface DiscountValidationResult {
  ok: boolean;
  code?: string;
  type?: 'percentage' | 'fixed';
  /** Cents off the order subtotal at validation time. */
  valueCents: number;
  message?: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

const HARDCODED_WELCOME_DISCOUNT = {
  code: 'WELKOM10',
  type: 'percentage' as const,
  percent: 10,
  minOrderCents: 0,
};

export async function validateDiscountCodeAction(
  rawCode: string,
  subtotalCents: number,
): Promise<DiscountValidationResult> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return { ok: false, valueCents: 0, message: 'Voer een kortingscode in' };

  if (!isSupabaseConfigured()) {
    if (code === HARDCODED_WELCOME_DISCOUNT.code) {
      const valueCents = Math.round((subtotalCents * HARDCODED_WELCOME_DISCOUNT.percent) / 100);
      return {
        ok: true,
        code,
        type: 'percentage',
        valueCents,
        message: `${HARDCODED_WELCOME_DISCOUNT.percent}% korting toegepast`,
      };
    }
    return { ok: false, valueCents: 0, message: 'Code niet geldig' };
  }

  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('discount_codes')
    .select('id,code,type,value_cents,value_percent,min_order_cents,is_active,valid_from,valid_until,max_uses_total,uses_count')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  type DiscountRow = {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value_cents: number;
    value_percent: number;
    min_order_cents: number;
    valid_from: string | null;
    valid_until: string | null;
    max_uses_total: number | null;
    uses_count: number;
  };
  const row = data as unknown as DiscountRow | null;
  if (!row) return { ok: false, valueCents: 0, message: 'Code niet gevonden' };

  if (subtotalCents < row.min_order_cents) {
    return {
      ok: false,
      valueCents: 0,
      message: `Minimaal orderbedrag ${(row.min_order_cents / 100).toFixed(2).replace('.', ',')} €`,
    };
  }
  const now = Date.now();
  if (row.valid_from && new Date(row.valid_from).getTime() > now)
    return { ok: false, valueCents: 0, message: 'Code is nog niet actief' };
  if (row.valid_until && new Date(row.valid_until).getTime() < now)
    return { ok: false, valueCents: 0, message: 'Code is verlopen' };
  if (row.max_uses_total != null && row.uses_count >= row.max_uses_total)
    return { ok: false, valueCents: 0, message: 'Code is uitgegeven' };

  const valueCents =
    row.type === 'percentage'
      ? Math.round((subtotalCents * row.value_percent) / 100)
      : row.value_cents;

  return { ok: true, code: row.code, type: row.type, valueCents, message: 'Korting toegepast' };
}
