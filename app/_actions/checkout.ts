'use server';

import { createServiceRoleClient } from '@/lib/supabase/server';
import { calculateVatFromGrossCents } from '@/lib/utils/money';
import type { CartLine } from '@/lib/cart/store';
import type { ShippingAddress, BillingAddress, ShippingMethod, PaymentMethod } from '@/lib/checkout/store';

export interface CheckoutSessionInput {
  lines: CartLine[];
  shipping: ShippingAddress;
  billing: BillingAddress | null;
  shippingMethod: ShippingMethod;
  shippingCents: number;
  discountCode: string;
  discountValueCents: number;
  paymentMethod: PaymentMethod;
}

export interface CheckoutSessionResult {
  ok: boolean;
  orderNumber?: string;
  redirectUrl?: string;
  message?: string;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

function generateMockOrderNumber(): string {
  const year = new Date().getFullYear();
  const seq = (Math.floor(Math.random() * 90000) + 10000).toString();
  return `AMIS-${year}-${seq}`;
}

/**
 * Create a checkout session.
 *
 * Real flow (Phase 2):
 *   1. FOR UPDATE lock products by id
 *   2. Re-validate stock vs requested quantities
 *   3. Insert order + order_items in a transaction, status='pending'
 *   4. Decrement stock atomically via RPC decrement_stock
 *   5. Call Mollie /payments with redirectUrl=/checkout/success?order=N
 *   6. Return Mollie checkout URL
 *
 * Stub (Phase 1, what runs now):
 *   - Insert order + items (no stock revalidation/locking yet — the dev DB
 *     doesn't have meaningful stock for the mock cart anyway)
 *   - Return /checkout/success?order=N directly so the success page can show
 *     a real ordernumber. No Mollie call.
 */
export async function createCheckoutSessionAction(
  input: CheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  if (input.lines.length === 0) return { ok: false, message: 'Winkelmand is leeg' };
  if (!input.shipping.email) return { ok: false, message: 'E-mailadres ontbreekt' };

  const subtotal = input.lines.reduce((acc, l) => acc + l.unitPriceCents * l.quantity, 0);
  const totalGrossCents = Math.max(0, subtotal - input.discountValueCents) + input.shippingCents;
  const taxCents = calculateVatFromGrossCents(totalGrossCents);

  if (!isSupabaseConfigured()) {
    const orderNumber = generateMockOrderNumber();
    return {
      ok: true,
      orderNumber,
      redirectUrl: `/checkout/success?order=${encodeURIComponent(orderNumber)}&mocked=1`,
    };
  }

  const sb = createServiceRoleClient();
  const { data: orderRow, error } = await sb
    .from('orders')
    .insert({
      user_id: null,
      guest_email: input.shipping.email,
      status: 'pending',
      subtotal_cents: subtotal,
      discount_cents: input.discountValueCents,
      shipping_cents: input.shippingCents,
      tax_cents: taxCents,
      total_cents: totalGrossCents,
      shipping_method: input.shippingMethod,
      shipping_first_name: input.shipping.first_name,
      shipping_last_name: input.shipping.last_name,
      shipping_street: input.shipping.street,
      shipping_house_number:
        input.shipping.house_number +
        (input.shipping.house_number_addition ? ` ${input.shipping.house_number_addition}` : ''),
      shipping_postal_code: input.shipping.postal_code,
      shipping_city: input.shipping.city,
      shipping_country: input.shipping.country,
      shipping_phone: input.shipping.phone,
      customer_note: input.shipping.customer_note || null,
    })
    .select('id,order_number')
    .single();

  if (error || !orderRow) {
    return { ok: false, message: error?.message ?? 'Kon order niet aanmaken' };
  }

  const row = orderRow as unknown as { id: string; order_number: string };

  const itemsPayload = input.lines.map((l) => ({
    order_id: row.id,
    product_id: l.productId,
    product_name: l.name,
    quantity: l.quantity,
    unit_price_cents: l.unitPriceCents,
    total_cents: l.unitPriceCents * l.quantity,
  }));
  await sb.from('order_items').insert(itemsPayload);

  await sb.from('order_activity_log').insert({
    order_id: row.id,
    user_id: null,
    action: 'order.created',
    details: { source: 'guest_checkout', payment_method: input.paymentMethod },
  });

  // STUB: in real flow we'd hit Mollie here and return the checkout URL.
  // For now, redirect straight to success.
  return {
    ok: true,
    orderNumber: row.order_number,
    redirectUrl: `/checkout/success?order=${encodeURIComponent(row.order_number)}`,
  };
}

