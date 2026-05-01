#!/usr/bin/env node
/**
 * Cart drawer screenshots: empty state, populated state, mobile, add-feedback flow.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = 'temporary screenshots';
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

async function shoot(browser, { name, viewport, prepare }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  console.log(`→ cart-${name}-${viewport}`);
  await prepare(page);
  await page.waitForTimeout(600);
  const file = `${OUT}/cart-${name}-${viewport}.png`;
  await page.screenshot({ path: file });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function openCart(page) {
  // CartIcon button has aria-label like "Winkelmand (3)" — partial match.
  await page.click('button[aria-label*="inkelmand"], button[aria-label*="art ("]', { timeout: 3000 }).catch(async () => {
    const btns = await page.$$('header button');
    if (btns.length) await btns[btns.length - 1].click();
  });
  await page.waitForTimeout(500);
}

async function gotoNL(page, path = '/') {
  await page.goto(`${BASE}/nl${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
}

async function fillCartViaAPI(page, items) {
  // Inject items directly into localStorage that zustand's persist reads on hydrate.
  await page.addInitScript((items) => {
    const payload = { state: { lines: items }, version: 0 };
    localStorage.setItem('amis-cart', JSON.stringify(payload));
  }, items);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    const sampleItems = [
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
      {
        productId: 'prod-mexican-chicken',
        slug: 'mexican-chicken-bowl',
        name: 'Mexican Chicken Bowl',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop',
        unitPriceCents: 1095,
        quantity: 1,
      },
    ];

    // 1. Empty state — desktop (cart open via icon click on a fresh state)
    await shoot(browser, {
      name: 'empty',
      viewport: 'desktop',
      prepare: async (page) => {
        await page.addInitScript(() => localStorage.removeItem('amis-cart'));
        await gotoNL(page);
        await openCart(page);
      },
    });

    // 2. Populated — desktop
    await shoot(browser, {
      name: 'populated',
      viewport: 'desktop',
      prepare: async (page) => {
        await fillCartViaAPI(page, sampleItems);
        await gotoNL(page);
        await openCart(page);
      },
    });

    // 3. Populated — tablet
    await shoot(browser, {
      name: 'populated',
      viewport: 'tablet',
      prepare: async (page) => {
        await fillCartViaAPI(page, sampleItems);
        await gotoNL(page);
        await openCart(page);
      },
    });

    // 4. Populated — mobile (slides from bottom)
    await shoot(browser, {
      name: 'populated',
      viewport: 'mobile',
      prepare: async (page) => {
        await fillCartViaAPI(page, sampleItems);
        await gotoNL(page);
        await openCart(page);
      },
    });

    // 5. Empty — mobile
    await shoot(browser, {
      name: 'empty',
      viewport: 'mobile',
      prepare: async (page) => {
        await page.addInitScript(() => localStorage.removeItem('amis-cart'));
        await gotoNL(page);
        await openCart(page);
      },
    });

    // 6. Add-feedback flow: shop page, click add-to-cart on a product card, capture toast+bump
    await shoot(browser, {
      name: 'add-feedback',
      viewport: 'desktop',
      prepare: async (page) => {
        await page.addInitScript(() => localStorage.removeItem('amis-cart'));
        await gotoNL(page, '/shop');
        // Find the first add-to-cart button on a product card
        const addBtn = await page.$('button:has-text("Toevoegen"), button:has-text("Add")');
        if (addBtn) {
          await addBtn.click();
          await page.waitForTimeout(300);
        }
      },
    });
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
