import { createServiceRoleClient } from '@/lib/supabase/server';
import type { OrderStatus, ShippingMethod } from '@/types/database';

export interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  paidAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;

  customer: {
    userId: string | null;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    totalOrders: number;
  };

  shipping: {
    method: ShippingMethod;
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    country: string;
    isLocal: boolean;
    sendcloudParcelId: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
  };

  customerNote: string | null;
  internalNote: string | null;

  items: Array<{
    id: string;
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

  molliePaymentId: string | null;
  molliePaymentStatus: string | null;

  activity: ActivityEntry[];

  isMocked: boolean;
}

export interface ActivityEntry {
  id: string;
  action: string;
  details: Record<string, unknown> | null;
  actorName: string;
  createdAt: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function isMaastrichtPostalCode(p: string): boolean {
  const digits = p.replace(/\s+/g, '').slice(0, 4);
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n >= 6200 && n <= 6229;
}

export async function getOrderDetail(id: string): Promise<OrderDetail | null> {
  if (!isSupabaseConfigured()) return mockedDetail(id);

  const sb = createServiceRoleClient();
  const { data: orderRaw } = await sb
    .from('orders')
    .select('*, order_items(id,product_id,product_name,quantity,unit_price_cents,total_cents,products(image_url))')
    .eq('id', id)
    .maybeSingle();

  if (!orderRaw) return null;
  type OrderRow = {
    id: string;
    order_number: string;
    status: OrderStatus;
    created_at: string;
    paid_at: string | null;
    shipped_at: string | null;
    delivered_at: string | null;
    subtotal_cents: number;
    discount_cents: number;
    shipping_cents: number;
    tax_cents: number;
    total_cents: number;
    shipping_method: ShippingMethod;
    shipping_first_name: string;
    shipping_last_name: string;
    shipping_street: string;
    shipping_house_number: string;
    shipping_postal_code: string;
    shipping_city: string;
    shipping_country: string;
    shipping_phone: string | null;
    sendcloud_parcel_id: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
    customer_note: string | null;
    internal_note: string | null;
    mollie_payment_id: string | null;
    mollie_payment_status: string | null;
    user_id: string | null;
    guest_email: string | null;
    order_items: Array<{
      id: string;
      product_id: string | null;
      product_name: string;
      quantity: number;
      unit_price_cents: number;
      total_cents: number;
      products: { image_url: string | null } | { image_url: string | null }[] | null;
    }> | null;
  };
  const order = orderRaw as unknown as OrderRow;

  let customerEmail = order.guest_email ?? '';
  let customerPhone: string | null = order.shipping_phone ?? null;
  let totalOrders = 0;
  if (order.user_id) {
    const { data: profile } = await sb
      .from('profiles')
      .select('email,phone')
      .eq('id', order.user_id)
      .maybeSingle();
    const p = profile as unknown as { email: string; phone: string | null } | null;
    if (p) {
      customerEmail = p.email;
      customerPhone = p.phone ?? customerPhone;
    }
    const { count } = await sb
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', order.user_id);
    totalOrders = count ?? 0;
  }

  const { data: activityRows } = await sb
    .from('order_activity_log')
    .select('id,action,details,created_at,user_id,profiles(first_name,last_name,email)')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  type ActivityRow = {
    id: string;
    action: string;
    details: Record<string, unknown> | null;
    created_at: string;
    user_id: string | null;
    profiles:
      | { first_name: string | null; last_name: string | null; email: string }
      | { first_name: string | null; last_name: string | null; email: string }[]
      | null;
  };
  const activity: ActivityEntry[] = ((activityRows as unknown as ActivityRow[]) ?? []).map((a) => {
    const profile = Array.isArray(a.profiles) ? a.profiles[0] ?? null : a.profiles;
    const actorName = profile
      ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.email
      : 'Systeem';
    return {
      id: a.id,
      action: a.action,
      details: a.details ?? null,
      actorName,
      createdAt: a.created_at,
    };
  });

  const items = (order.order_items ?? []).map((it) => {
    const products = Array.isArray(it.products) ? it.products[0] ?? null : it.products;
    return {
      id: it.id,
      productId: it.product_id,
      name: it.product_name,
      quantity: it.quantity,
      unitPriceCents: it.unit_price_cents,
      totalCents: it.total_cents,
      imageUrl: products?.image_url ?? null,
    };
  });

  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    shippedAt: order.shipped_at,
    deliveredAt: order.delivered_at,
    customer: {
      userId: order.user_id,
      firstName: order.shipping_first_name,
      lastName: order.shipping_last_name,
      email: customerEmail,
      phone: customerPhone,
      totalOrders,
    },
    shipping: {
      method: order.shipping_method,
      street: order.shipping_street,
      houseNumber: order.shipping_house_number,
      postalCode: order.shipping_postal_code,
      city: order.shipping_city,
      country: order.shipping_country,
      isLocal: order.shipping_method === 'local' || isMaastrichtPostalCode(order.shipping_postal_code),
      sendcloudParcelId: order.sendcloud_parcel_id,
      trackingNumber: order.tracking_number,
      trackingUrl: order.tracking_url,
    },
    customerNote: order.customer_note,
    internalNote: order.internal_note,
    items,
    totals: {
      subtotalCents: order.subtotal_cents,
      discountCents: order.discount_cents,
      shippingCents: order.shipping_cents,
      taxCents: order.tax_cents,
      totalCents: order.total_cents,
    },
    molliePaymentId: order.mollie_payment_id,
    molliePaymentStatus: order.mollie_payment_status,
    activity,
    isMocked: false,
  };
}

// ============================================================
// Mocked dev dataset
// ============================================================
function mockedDetail(id: string): OrderDetail {
  const now = new Date();
  const created = new Date(now.getTime() - 1000 * 60 * 60 * 26);
  const paid = new Date(created.getTime() + 1000 * 60 * 8);

  return {
    id,
    orderNumber: id.startsWith('mock-') ? `AM-0244${id.slice(-1)}` : id.slice(0, 8).toUpperCase(),
    status: 'paid',
    createdAt: created.toISOString(),
    paidAt: paid.toISOString(),
    shippedAt: null,
    deliveredAt: null,
    customer: {
      userId: 'mock-user',
      firstName: 'Sanne',
      lastName: 'van Loon',
      email: 'sanne.vanloon@example.com',
      phone: '+31 6 1234 5678',
      totalOrders: 7,
    },
    shipping: {
      method: 'local',
      street: 'Wycker Brugstraat',
      houseNumber: '12B',
      postalCode: '6221 ED',
      city: 'Maastricht',
      country: 'NL',
      isLocal: true,
      sendcloudParcelId: null,
      trackingNumber: null,
      trackingUrl: null,
    },
    customerNote:
      'Graag bezorgen vóór 18:00 — ik werk vanaf 19:00. Bel kort vooraf via intercom 12B!',
    internalNote: null,
    items: [
      {
        id: 'i1',
        productId: 'p1',
        name: 'Cut Pakket — 7 maaltijden',
        quantity: 1,
        unitPriceCents: 5495,
        totalCents: 5495,
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop',
      },
      {
        id: 'i2',
        productId: 'p2',
        name: 'Kip Teriyaki Bowl',
        quantity: 2,
        unitPriceCents: 1095,
        totalCents: 2190,
        imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&h=120&fit=crop',
      },
      {
        id: 'i3',
        productId: 'p3',
        name: 'Zalm met Quinoa',
        quantity: 1,
        unitPriceCents: 1395,
        totalCents: 1395,
        imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=120&h=120&fit=crop',
      },
    ],
    totals: {
      subtotalCents: 9080,
      discountCents: 500,
      shippingCents: 395,
      taxCents: 805,
      totalCents: 8975,
    },
    molliePaymentId: 'tr_mockMollie123',
    molliePaymentStatus: 'paid',
    activity: [
      {
        id: 'a1',
        action: 'order.created',
        details: null,
        actorName: 'Klant',
        createdAt: created.toISOString(),
      },
      {
        id: 'a2',
        action: 'payment.received',
        details: { provider: 'Mollie', amount_cents: 8975 },
        actorName: 'Systeem',
        createdAt: paid.toISOString(),
      },
      {
        id: 'a3',
        action: 'note.added',
        details: { note: 'Klant gebeld om bezorgmoment te bevestigen — akkoord 17:30.' },
        actorName: 'Sam Bessems',
        createdAt: new Date(paid.getTime() + 1000 * 60 * 90).toISOString(),
      },
    ],
    isMocked: true,
  };
}
