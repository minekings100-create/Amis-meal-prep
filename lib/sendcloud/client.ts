/**
 * Sendcloud — parcel creation + label retrieval.
 *
 * Sendcloud's automatic track & trace email feature is configured in their panel
 * (Settings → Notifications). We only create the parcel; Sendcloud emails the
 * customer with branded tracking info on our behalf.
 *
 * Docs: https://api.sendcloud.dev/docs/sendcloud-public-api/parcels
 */

const SENDCLOUD_BASE = 'https://panel.sendcloud.sc/api/v2';

export interface CreateParcelInput {
  orderNumber: string;
  email: string;
  name: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string; // ISO 3166-1 alpha-2
  telephone?: string;
  weightKg: number;
  shippingMethodId: number; // PostNL standard, retrieve from Sendcloud panel
  senderAddressId?: number;
  requestLabel?: boolean;
}

export interface SendcloudParcel {
  id: number;
  tracking_number: string;
  tracking_url: string;
  status: { id: number; message: string };
  label: { label_printer?: string; normal_printer?: string[] };
}

function authHeader(): string {
  const pub = process.env.SENDCLOUD_PUBLIC_KEY;
  const sec = process.env.SENDCLOUD_SECRET_KEY;
  if (!pub || !sec) throw new Error('SENDCLOUD_PUBLIC_KEY / SENDCLOUD_SECRET_KEY not configured');
  return `Basic ${Buffer.from(`${pub}:${sec}`).toString('base64')}`;
}

async function sendcloudFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${SENDCLOUD_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: authHeader(),
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sendcloud ${path} ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function createParcel(input: CreateParcelInput): Promise<SendcloudParcel> {
  const body = {
    parcel: {
      name: input.name,
      address: input.street,
      house_number: input.houseNumber,
      city: input.city,
      postal_code: input.postalCode,
      country: input.country,
      telephone: input.telephone,
      email: input.email,
      order_number: input.orderNumber,
      weight: input.weightKg.toFixed(3),
      request_label: input.requestLabel ?? true,
      shipment: { id: input.shippingMethodId },
      sender_address: input.senderAddressId,
    },
  };
  const res = await sendcloudFetch<{ parcel: SendcloudParcel }>('/parcels', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.parcel;
}

export async function getParcel(id: number): Promise<SendcloudParcel> {
  const res = await sendcloudFetch<{ parcel: SendcloudParcel }>(`/parcels/${id}`);
  return res.parcel;
}
