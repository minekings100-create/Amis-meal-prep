#!/usr/bin/env node
/**
 * Capture checkout pages with a populated cart + filled-in form state.
 *
 * Usage: node scripts/_helpers/checkout-shoot.mjs <step> [name=step]
 *   step = details | shipping | payment
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

const items = [
  {
    productId: 'prod-korean-beef',
    slug: 'korean-beef-bowl',
    name: 'Korean Beef Bowl',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
    unitPriceCents: 1095,
    quantity: 2,
  },
  {
    productId: 'prod-salmon',
    slug: 'sweet-potato-salmon',
    name: 'Sweet Potato Salmon',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop',
    unitPriceCents: 1250,
    quantity: 1,
  },
];

const checkoutSeed = {
  state: {
    shipping: {
      first_name: 'Sanne',
      last_name: 'van Loon',
      email: 'sanne@amismeals.nl',
      phone: '+31 6 1234 5678',
      street: 'Wycker Brugstraat',
      house_number: '12',
      house_number_addition: 'B',
      postal_code: '6221 ED',
      city: 'Maastricht',
      country: 'NL',
      customer_note: 'Graag bezorgen vóór 18:00.',
    },
    billing: {
      first_name: '',
      last_name: '',
      street: '',
      house_number: '',
      house_number_addition: '',
      postal_code: '',
      city: '',
      country: 'NL',
    },
    giftToOtherAddress: false,
    shippingMethod: 'local',
    discountCode: 'WELKOM10',
    discountValueCents: 344,
    paymentMethod: 'ideal',
    termsAccepted: true,
  },
  version: 0,
};

const consentCookie = encodeURIComponent(
  JSON.stringify({
    essential: true,
    analytics: false,
    marketing: false,
    version: '1.0',
    timestamp: new Date().toISOString(),
  }),
);

async function main() {
  const step = process.argv[2] ?? 'details';
  const name = process.argv[3] ?? `checkout-${step}`;
  await mkdir('temporary screenshots', { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const v of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: v.size,
        deviceScaleFactor: 2,
      });
      await ctx.addCookies([
        { name: 'amis-consent', value: consentCookie, url: 'http://localhost:3000' },
      ]);
      await ctx.addInitScript(
        ({ items, checkoutSeed }) => {
          localStorage.setItem(
            'amis-cart',
            JSON.stringify({ state: { lines: items }, version: 0 }),
          );
          sessionStorage.setItem('amis-checkout', JSON.stringify(checkoutSeed));
        },
        { items, checkoutSeed },
      );
      const page = await ctx.newPage();
      await page.goto(`http://localhost:3000/nl/checkout/${step}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(900);
      const file = `temporary screenshots/polish-${name}-${v.name}.png`;
      await page.screenshot({ path: file });
      console.log(`✓ ${file}`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
