import { formatMoneyCents } from '@/lib/utils/money';

export interface OrderConfirmationData {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; totalCents: number }>;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  shippingAddress: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
  };
  shippingMethod: 'postnl' | 'local';
  locale: 'nl' | 'en';
}

const t = {
  nl: {
    subject: (n: string) => `Je AMIS bestelling ${n} is bevestigd`,
    heading: 'Bedankt voor je bestelling',
    intro: 'We zijn gestart met de voorbereiding. Je krijgt een aparte mail met track & trace zodra je pakket onderweg is.',
    orderLabel: 'Bestelnummer',
    items: 'Items',
    subtotal: 'Subtotaal',
    discount: 'Korting',
    shipping: 'Verzending',
    total: 'Totaal (incl. 9% BTW)',
    address: 'Bezorgadres',
    method: { postnl: 'PostNL bezorging', local: 'Lokale bezorging Maastricht' },
    footer: 'AMIS Meals · Maastricht · hallo@amismeals.nl',
  },
  en: {
    subject: (n: string) => `Your AMIS order ${n} is confirmed`,
    heading: 'Thanks for your order',
    intro: 'We have started preparing your meals. You will receive a separate email with tracking once your parcel ships.',
    orderLabel: 'Order number',
    items: 'Items',
    subtotal: 'Subtotal',
    discount: 'Discount',
    shipping: 'Shipping',
    total: 'Total (incl. 9% VAT)',
    address: 'Shipping address',
    method: { postnl: 'PostNL delivery', local: 'Local Maastricht delivery' },
    footer: 'AMIS Meals · Maastricht · hallo@amismeals.nl',
  },
} as const;

export function renderOrderConfirmation(data: OrderConfirmationData) {
  const L = t[data.locale];
  const itemRows = data.items
    .map(
      (it) =>
        `<tr><td style="padding:8px 0;color:#131613">${it.quantity}× ${escapeHtml(it.name)}</td><td style="padding:8px 0;color:#131613;text-align:right">${formatMoneyCents(it.totalCents)}</td></tr>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="${data.locale}">
<body style="margin:0;background:#f7f7f5;font-family:'Sora',system-ui,sans-serif;color:#131613">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f5;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e8e8e3;border-top:4px solid #4a8a3c">
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 8px 0;font-size:24px;letter-spacing:-0.02em">AMIS Meals</h1>
          <h2 style="margin:0 0 16px 0;font-size:20px;color:#131613">${L.heading}</h2>
          <p style="margin:0 0 24px 0;color:#4a4d49;line-height:1.6">${L.intro}</p>
          <p style="margin:0 0 24px 0;color:#4a4d49"><strong style="color:#131613">${L.orderLabel}:</strong> ${data.orderNumber}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e8e8e3;margin-top:16px">
            ${itemRows}
            <tr><td colspan="2" style="border-top:1px solid #e8e8e3;padding-top:12px"></td></tr>
            <tr><td style="padding:4px 0;color:#4a4d49">${L.subtotal}</td><td style="text-align:right;color:#131613">${formatMoneyCents(data.subtotalCents)}</td></tr>
            ${data.discountCents > 0 ? `<tr><td style="padding:4px 0;color:#4a4d49">${L.discount}</td><td style="text-align:right;color:#131613">−${formatMoneyCents(data.discountCents)}</td></tr>` : ''}
            <tr><td style="padding:4px 0;color:#4a4d49">${L.shipping}</td><td style="text-align:right;color:#131613">${formatMoneyCents(data.shippingCents)}</td></tr>
            <tr><td style="padding:8px 0;border-top:1px solid #e8e8e3;font-weight:600">${L.total}</td><td style="padding:8px 0;border-top:1px solid #e8e8e3;text-align:right;font-weight:600">${formatMoneyCents(data.totalCents)}</td></tr>
          </table>
          <p style="margin:24px 0 4px 0;color:#131613;font-weight:600">${L.address}</p>
          <p style="margin:0;color:#4a4d49;line-height:1.6">${escapeHtml(data.customerName)}<br>${escapeHtml(data.shippingAddress.street)} ${escapeHtml(data.shippingAddress.houseNumber)}<br>${escapeHtml(data.shippingAddress.postalCode)} ${escapeHtml(data.shippingAddress.city)}<br>${L.method[data.shippingMethod]}</p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#f7f7f5;color:#707370;font-size:12px;text-align:center">${L.footer}</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  return { subject: L.subject(data.orderNumber), html };
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '"': return '&quot;';
      default: return '&#39;';
    }
  });
}
