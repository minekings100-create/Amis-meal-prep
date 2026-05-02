// Helper: navigate to /cart with items in localStorage so we can see the populated state
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const VIEWPORTS = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];
const items = [
  { productId: 'prod-korean-beef', slug: 'korean-beef-bowl', name: 'Korean Beef Bowl', imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop', unitPriceCents: 1095, quantity: 2 },
  { productId: 'prod-salmon', slug: 'sweet-potato-salmon', name: 'Sweet Potato Salmon', imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop', unitPriceCents: 1250, quantity: 1 },
];
const slug = process.argv[2];
await mkdir('temporary screenshots', { recursive: true });
const browser = await chromium.launch();
for (const v of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: v.size, deviceScaleFactor: 2 });
  await ctx.addCookies([{ name: 'amis-consent', value: '%7B%22essential%22%3Atrue%7D', url: 'http://localhost:3000' }]);
  await ctx.addInitScript((items) => {
    localStorage.setItem('amis-cart', JSON.stringify({ state: { lines: items }, version: 0 }));
  }, items);
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/nl/cart', { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `temporary screenshots/polish-${slug}-${v.name}.png` });
  console.log(`✓ polish-${slug}-${v.name}.png`);
  await ctx.close();
}
await browser.close();
