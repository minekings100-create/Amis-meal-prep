/**
 * Mollie payments — wrapper around the Mollie REST API.
 *
 * We hit the API directly (no @mollie/api-client SDK) because the SDK pulls in
 * a lot of dependencies and the surface we need is small.
 *
 * Docs: https://docs.mollie.com/reference/v2/payments-api/create-payment
 */

const MOLLIE_BASE = 'https://api.mollie.com/v2';

interface MollieAddress {
  streetAndNumber: string;
  postalCode: string;
  city: string;
  country: string; // ISO 3166-1 alpha-2
}

export interface CreatePaymentInput {
  amountEuros: string; // "10.95" — Mollie wants string with 2 decimals
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata: Record<string, string | number>;
  locale?: 'nl_NL' | 'en_GB';
  method?: Array<'ideal' | 'creditcard' | 'klarna' | 'applepay' | 'bancontact'>;
  billingAddress?: MollieAddress;
  shippingAddress?: MollieAddress;
  customerEmail?: string;
}

export interface MolliePayment {
  id: string;
  status: 'open' | 'pending' | 'authorized' | 'paid' | 'canceled' | 'expired' | 'failed';
  _links: {
    checkout?: { href: string; type: string };
  };
  amount: { value: string; currency: string };
  metadata: Record<string, string | number> | null;
}

function getApiKey(): string {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error('MOLLIE_API_KEY is not configured');
  return key;
}

async function mollieFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${MOLLIE_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Mollie ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function createPayment(input: CreatePaymentInput): Promise<MolliePayment> {
  const body = {
    amount: { currency: 'EUR', value: input.amountEuros },
    description: input.description,
    redirectUrl: input.redirectUrl,
    webhookUrl: input.webhookUrl,
    metadata: input.metadata,
    locale: input.locale ?? 'nl_NL',
    method: input.method,
    billingAddress: input.billingAddress,
    shippingAddress: input.shippingAddress,
    billingEmail: input.customerEmail,
  };
  return mollieFetch<MolliePayment>('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function getPayment(id: string): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(`/payments/${encodeURIComponent(id)}`);
}

export async function refundPayment(id: string, amountEuros?: string): Promise<unknown> {
  return mollieFetch(`/payments/${encodeURIComponent(id)}/refunds`, {
    method: 'POST',
    body: JSON.stringify(
      amountEuros ? { amount: { currency: 'EUR', value: amountEuros } } : {},
    ),
  });
}
