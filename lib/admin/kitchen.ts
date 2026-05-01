import { createServiceRoleClient } from '@/lib/supabase/server';

/**
 * Production planning view.
 *
 * "Verwachte verzenddatum" is currently approximated as: order created_at + 1 working day.
 * The pipeline doesn't have an explicit ship_date column yet — when it does (Phase 2),
 * swap this for that column. For now: show all paid + preparing orders for the chosen date
 * by date-of-creation, which is close enough for AMIS' batch-cooking rhythm.
 */

export interface KitchenMealRow {
  productId: string;
  name: string;
  imageUrl: string | null;
  totalUnits: number;
  orderCount: number;
  notesCount: number;
  ordersForMeal: Array<{
    orderId: string;
    orderNumber: string;
    customerName: string;
    quantity: number;
    customerNote: string | null;
  }>;
}

export interface KitchenPlanning {
  date: string;
  rows: KitchenMealRow[];
  totalUnits: number;
  totalOrders: number;
  isMocked: boolean;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function getProductionPlanning(date: string): Promise<KitchenPlanning> {
  if (!isSupabaseConfigured()) return mockedPlanning(date);

  const sb = createServiceRoleClient();
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const { data: orders } = await sb
    .from('orders')
    .select(
      'id,order_number,status,customer_note,shipping_first_name,shipping_last_name,' +
        'order_items(product_id,product_name,quantity,products(image_url))',
    )
    .gte('created_at', dayStart.toISOString())
    .lt('created_at', dayEnd.toISOString())
    .in('status', ['paid', 'preparing']);

  type OrderRow = {
    id: string;
    order_number: string;
    customer_note: string | null;
    shipping_first_name: string;
    shipping_last_name: string;
    order_items: Array<{
      product_id: string | null;
      product_name: string;
      quantity: number;
      products: { image_url: string | null } | null;
    }> | null;
  };

  const byProduct = new Map<string, KitchenMealRow>();
  let totalUnits = 0;
  const orderIds = new Set<string>();

  for (const o of (orders ?? []) as OrderRow[]) {
    orderIds.add(o.id);
    const customer = `${o.shipping_first_name ?? ''} ${o.shipping_last_name ?? ''}`.trim() || '—';
    for (const it of o.order_items ?? []) {
      const key = it.product_id ?? `name:${it.product_name}`;
      const existing = byProduct.get(key) ?? {
        productId: it.product_id ?? '',
        name: it.product_name,
        imageUrl: it.products?.image_url ?? null,
        totalUnits: 0,
        orderCount: 0,
        notesCount: 0,
        ordersForMeal: [],
      };
      existing.totalUnits += it.quantity;
      existing.orderCount += 1;
      if (o.customer_note) existing.notesCount += 1;
      existing.ordersForMeal.push({
        orderId: o.id,
        orderNumber: o.order_number,
        customerName: customer,
        quantity: it.quantity,
        customerNote: o.customer_note,
      });
      byProduct.set(key, existing);
      totalUnits += it.quantity;
    }
  }

  return {
    date,
    rows: Array.from(byProduct.values()).sort((a, b) => b.totalUnits - a.totalUnits),
    totalUnits,
    totalOrders: orderIds.size,
    isMocked: false,
  };
}

function mockedPlanning(date: string): KitchenPlanning {
  const baseImg = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop';
  const rows: KitchenMealRow[] = [
    {
      productId: 'p1',
      name: 'Kip Teriyaki Bowl',
      imageUrl: baseImg,
      totalUnits: 18,
      orderCount: 9,
      notesCount: 2,
      ordersForMeal: [
        { orderId: 'o1', orderNumber: 'AM-02410', customerName: 'Sanne van Loon', quantity: 2, customerNote: 'Graag bezorgen vóór 18:00.' },
        { orderId: 'o2', orderNumber: 'AM-02411', customerName: 'Mike Janssen', quantity: 1, customerNote: null },
        { orderId: 'o3', orderNumber: 'AM-02412', customerName: 'Lotte Hendriks', quantity: 3, customerNote: null },
        { orderId: 'o4', orderNumber: 'AM-02413', customerName: 'Daan Smit', quantity: 1, customerNote: 'Geen sesam graag — allergisch!' },
        { orderId: 'o5', orderNumber: 'AM-02414', customerName: 'Eva Bos', quantity: 4, customerNote: null },
        { orderId: 'o6', orderNumber: 'AM-02415', customerName: 'Pieter de Vries', quantity: 2, customerNote: null },
        { orderId: 'o7', orderNumber: 'AM-02416', customerName: 'Famke Bos', quantity: 1, customerNote: null },
        { orderId: 'o8', orderNumber: 'AM-02417', customerName: 'Tijn van Roosmalen', quantity: 2, customerNote: null },
        { orderId: 'o9', orderNumber: 'AM-02418', customerName: 'Jeroen Smit', quantity: 2, customerNote: null },
      ],
    },
    {
      productId: 'p2',
      name: 'Zalm met Quinoa',
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=80&h=80&fit=crop',
      totalUnits: 12,
      orderCount: 6,
      notesCount: 1,
      ordersForMeal: [
        { orderId: 'o1', orderNumber: 'AM-02410', customerName: 'Sanne van Loon', quantity: 1, customerNote: 'Graag bezorgen vóór 18:00.' },
        { orderId: 'o3', orderNumber: 'AM-02412', customerName: 'Lotte Hendriks', quantity: 2, customerNote: null },
        { orderId: 'o5', orderNumber: 'AM-02414', customerName: 'Eva Bos', quantity: 3, customerNote: null },
        { orderId: 'o6', orderNumber: 'AM-02415', customerName: 'Pieter de Vries', quantity: 2, customerNote: null },
        { orderId: 'o7', orderNumber: 'AM-02416', customerName: 'Famke Bos', quantity: 2, customerNote: null },
        { orderId: 'o8', orderNumber: 'AM-02417', customerName: 'Tijn van Roosmalen', quantity: 2, customerNote: null },
      ],
    },
    {
      productId: 'p3',
      name: 'Pulled Beef Bowl',
      imageUrl: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=80&h=80&fit=crop',
      totalUnits: 8,
      orderCount: 4,
      notesCount: 0,
      ordersForMeal: [
        { orderId: 'o2', orderNumber: 'AM-02411', customerName: 'Mike Janssen', quantity: 2, customerNote: null },
        { orderId: 'o4', orderNumber: 'AM-02413', customerName: 'Daan Smit', quantity: 2, customerNote: null },
        { orderId: 'o5', orderNumber: 'AM-02414', customerName: 'Eva Bos', quantity: 2, customerNote: null },
        { orderId: 'o9', orderNumber: 'AM-02418', customerName: 'Jeroen Smit', quantity: 2, customerNote: null },
      ],
    },
    {
      productId: 'p4',
      name: 'Vegan Curry Rijst',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=80&h=80&fit=crop',
      totalUnits: 5,
      orderCount: 3,
      notesCount: 0,
      ordersForMeal: [
        { orderId: 'o2', orderNumber: 'AM-02411', customerName: 'Mike Janssen', quantity: 1, customerNote: null },
        { orderId: 'o4', orderNumber: 'AM-02413', customerName: 'Daan Smit', quantity: 2, customerNote: null },
        { orderId: 'o7', orderNumber: 'AM-02416', customerName: 'Famke Bos', quantity: 2, customerNote: null },
      ],
    },
  ];
  return {
    date,
    rows,
    totalUnits: rows.reduce((acc, r) => acc + r.totalUnits, 0),
    totalOrders: 9,
    isMocked: true,
  };
}
