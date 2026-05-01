import { createServiceRoleClient } from '@/lib/supabase/server';

export interface ShippingSettings {
  localPostalCodes: string[];
  localFeeCents: number;
  localFreeThresholdCents: number;
  postnlFeeCents: number;
  postnlFreeThresholdCents: number;
}

export interface CompanySettings {
  name: string;
  kvk: string;
  btw: string;
  address: string;
  email: string;
  phone: string;
}

export interface EmailSettings {
  fromEmail: string;
  replyTo: string;
}

export interface GeneralSettings {
  vatRate: number;
  lowStockThreshold: number;
}

export interface AllSettings {
  shipping: ShippingSettings;
  company: CompanySettings;
  email: EmailSettings;
  general: GeneralSettings;
}

const DEFAULTS: AllSettings = {
  shipping: {
    localPostalCodes: [
      '6200', '6201', '6202', '6203', '6211', '6212', '6213', '6214', '6215', '6216',
      '6217', '6218', '6219', '6221', '6222', '6223', '6224', '6225', '6226', '6227',
      '6228', '6229',
    ],
    localFeeCents: 395,
    localFreeThresholdCents: 4000,
    postnlFeeCents: 695,
    postnlFreeThresholdCents: 6000,
  },
  company: {
    name: 'AMIS Meals',
    kvk: '',
    btw: '',
    address: 'Maastricht, NL',
    email: 'hallo@amismeals.nl',
    phone: '',
  },
  email: {
    fromEmail: 'hallo@amismeals.nl',
    replyTo: 'hallo@amismeals.nl',
  },
  general: {
    vatRate: 0.09,
    lowStockThreshold: 10,
  },
};

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getAllSettings(): Promise<{ settings: AllSettings; isMocked: boolean }> {
  if (!isSupabaseConfigured()) return { settings: DEFAULTS, isMocked: true };
  const sb = createServiceRoleClient();
  const { data } = await sb.from('settings').select('key,value');
  const merged: AllSettings = JSON.parse(JSON.stringify(DEFAULTS));
  for (const row of data ?? []) {
    if (row.key === 'shipping') merged.shipping = { ...merged.shipping, ...(row.value as object) };
    else if (row.key === 'company') merged.company = { ...merged.company, ...(row.value as object) };
    else if (row.key === 'email') merged.email = { ...merged.email, ...(row.value as object) };
    else if (row.key === 'general') merged.general = { ...merged.general, ...(row.value as object) };
  }
  return { settings: merged, isMocked: false };
}

export interface IntegrationStatus {
  mollie: { configured: boolean; mode: 'live' | 'test' | null };
  sendcloud: { configured: boolean };
  resend: { configured: boolean; verifiedDomain: string | null };
}

export function getIntegrationStatus(): IntegrationStatus {
  const mollieKey = process.env.MOLLIE_API_KEY ?? '';
  return {
    mollie: {
      configured: !!mollieKey,
      mode: mollieKey.startsWith('live_') ? 'live' : mollieKey.startsWith('test_') ? 'test' : null,
    },
    sendcloud: {
      configured: Boolean(process.env.SENDCLOUD_API_KEY && process.env.SENDCLOUD_API_SECRET),
    },
    resend: {
      configured: Boolean(process.env.RESEND_API_KEY),
      verifiedDomain: process.env.RESEND_VERIFIED_DOMAIN ?? null,
    },
  };
}
