#!/usr/bin/env node
/**
 * Capture all admin views with mocked data (no Supabase env required).
 *
 * Usage:
 *   1. Start dev server in another terminal: npm run dev
 *   2. node scripts/screenshot-admin-all.mjs
 *
 * Outputs PNGs to ./temporary screenshots/admin-*-{desktop,tablet}.png
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = 'temporary screenshots';
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
};

const SHOTS = [
  { name: 'dashboard', path: '/admin', persona: 'owner', fullPage: true },
  { name: 'orders-list', path: '/admin/orders', persona: 'owner', fullPage: true },
  { name: 'orders-list-filtered', path: '/admin/orders?range=7d&method=local', persona: 'owner', fullPage: true },
  { name: 'order-detail', path: '/admin/orders/mock-0', persona: 'owner', fullPage: true },
  { name: 'kitchen', path: '/admin/kitchen', persona: 'owner', fullPage: true },
  { name: 'kitchen-print', path: '/admin/kitchen/print', persona: 'owner', fullPage: true, sidebarless: true },
  { name: 'stock', path: '/admin/stock', persona: 'owner', fullPage: true },
  { name: 'products-list', path: '/admin/products', persona: 'owner', fullPage: true },
  { name: 'product-edit', path: '/admin/products/p1/edit', persona: 'owner', fullPage: true },
  { name: 'reviews', path: '/admin/reviews', persona: 'owner', fullPage: true },
  { name: 'reviews-published', path: '/admin/reviews?tab=published', persona: 'owner', fullPage: true },
  { name: 'customers', path: '/admin/customers', persona: 'owner', fullPage: true },
  { name: 'customer-detail', path: '/admin/customers/u1', persona: 'owner', fullPage: true },
  { name: 'settings', path: '/admin/settings', persona: 'owner', fullPage: true },
  { name: 'users', path: '/admin/users', persona: 'owner', fullPage: true },
  { name: 'webhooks', path: '/admin/webhooks', persona: 'owner', fullPage: true },
  // Staff persona showing role-restricted sidebar (no Settings/Users/Webhooks)
  { name: 'dashboard-staff', path: '/admin', persona: 'staff', fullPage: false },
];

async function shoot(browser, { name, path, viewport, persona, fullPage = false }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  console.log(`→ admin-${name}-${viewport}`);
  if (persona) {
    await page.goto(`${BASE}/admin?as=${persona}`, { waitUntil: 'networkidle' });
  }
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const file = `${OUT}/admin-${name}-${viewport}.png`;
  await page.screenshot({ path: file, fullPage });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    for (const shot of SHOTS) {
      await shoot(browser, { ...shot, viewport: 'desktop' });
      // Also tablet for the overview pages — desktop-first admin per spec
      if (['dashboard', 'orders-list', 'kitchen', 'product-edit', 'settings'].includes(shot.name)) {
        await shoot(browser, { ...shot, viewport: 'tablet' });
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
