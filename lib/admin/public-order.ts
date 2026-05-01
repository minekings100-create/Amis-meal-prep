import { createServiceRoleClient } from '@/lib/supabase/server';
import type { OrderStatus, ShippingMethod } from '@/types/database';

/**
 * Public order accessor — used by /checkout/success and /account/orders/[id].
 * Returns a slim subset (no internal_note, mollie_payment_id, etc.).
 */
export interface PublicOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  customerEmail: string;
  customerFirstName: string;
  customerLastName: string;
  shippingMethod: ShippingMethod;
  shippingAddress: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
  };
  trackingNumber: string | null;
  trackingUrl: string | null;
  customerNote: string | null;
  items: Array<{
    productId: string | null;
    name: string;
    quantity: number;
    unitPriceCents: number;
    totalCents: number;
    imageUrl: string | null;
  }>;
  totals: {
    subtotalCents: number;
    discountCents: number;
    shippingCents: number;
    taxCents: number;
    totalCents: number;
  };
  isMocked: boolean;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getPublicOrderByNumber(orderNumber: string): Promise<PublicOrder | null> {
  if (!isSupabaseConfigured()) return mockedOrder(orderNumber);

  const sb = createServiceRoleClient();
  const { data } = await sb
    .from('orders')
    .select(
      '*, order_items(product_id,product_name,quantity,unit_price_cents,total_cents,products(image_url))',
    )
    .eq('order_number', orderNumber)
    .maybeSingle();
  if (!data) return null;

  type ItemRow = {
    product_id: string | null;
    product_name: string;
    quantity: number;
    unit_price_cents: number;
    total_cents: number;
    products: { image_url: string | null } | { image_url: string | null }[] | null;
  };
  type OrderRow = {
    id: string;
    order_number: string;
    status: OrderStatus;
    created_at: string;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    guest_email: string | null;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_method: ShippingMethod;
    shipping_street: string;
    shipping_house_number: string;
    shipping_postal_code: string;
    shipping_city: string;
    shipping_country: string;
    customer_note: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    subtotal_cents: number;
    discount_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
    order_items: ItemRow[] | null;
  };
  const o = data as unknown as OrderRow;

  return {
    id: o.id,
    orderNumber: o.order_number,
    status: o.status,
    createdAt: o.created_at,
    paidAt: o.paid_at,
    shippedAt: o.shipped_at,
    deliveredAt: o.delivered_at,
    customerEmail: o.guest_email ?? '',
    customerFirstName: o.shipping_first_name,
    customerLastName: o.shipping_last_name,
    shippingMethod: o.shipping_method,
    shippingAddress: {
      street: o.shipping_street,
      houseNumber: o.shipping_house_number,
      postalCode: o.shipping_postal_code,
      city: o.shipping_city,
      country: o.shipping_country,
    },
    trackingNumber: o.tracking_number,
    trackingUrl: o.tracking_url,
    customerNote: o.customer_note,
    items: (o.order_items ?? []).map((it) => {
      const prod = Array.isArray(it.products) ? it.products[0] ?? null : it.products;
      return {
        productId: it.product_id,
        name: it.product_name,
        quantity: it.quantity,
        unitPriceCents: it.unit_price_cents,
        totalCents: it.total_cents,
        imageUrl: prod?.image_url ?? null,
      };
    }),
    totals: {
      subtotalCents: o.subtotal_cents,
      discountCents: o.discount_cents,
      shippingCents: o.shipping_cents,
      taxCents: o.tax_cents,
      totalCents: o.total_cents,
    },
    isMocked: false,
  };
}

function mockedOrder(orderNumber: string): PublicOrder {
  const now = new Date();
  return {
    id: 'mock-order',
    orderNumber,
    status: 'paid',
    createdAt: now.toISOString(),
    paidAt: now.toISOString(),
    shippedAt: null,
    deliveredAt: null,
    customerEmail: 'test@amismeals.nl',
    customerFirstName: 'Sanne',
    customerLastName: 'van Loon',
    shippingMethod: 'local',
    shippingAddress: {
      street: 'Wycker Brugstraat',
      houseNumber: '12B',
      postalCode: '6221 ED',
      city: 'Maastricht',
      country: 'NL',
    },
    trackingNumber: null,
    trackingUrl: null,
    customerNote: null,
    items: [
      {
        productId: 'prod-korean-beef',
        name: 'Korean Beef Bowl',
        quantity: 2,
        unitPriceCents: 1095,
        totalCents: 2190,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
      },
      {
        productId: 'prod-salmon',
        name: 'Sweet Potato Salmon',
        quantity: 1,
        unitPriceCents: 1250,
        totalCents: 1250,
        imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop',
      },
    ],
    totals: {
      subtotalCents: 3440,
      discountCents: 0,
      shippingCents: 395,
      taxCents: 316,
      totalCents: 3835,
    },
    isMocked: true,
  };
}
