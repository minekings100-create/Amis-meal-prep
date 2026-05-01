#!/usr/bin/env node
/**
 * Capture compare-feature states by manipulating localStorage directly:
 *   - Card with compare button (off and on state)
 *   - Floating bar with 1, 2, 3 items (desktop + mobile)
 *   - Modal open with 3 items (desktop + mobile)
 *   - Modal edge case with 1 item (desktop)
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

// Items mirror the seed data so we can pre-populate compare without scrolling/clicking.
const SAMPLE_ITEMS = {
  korean: {
    id: 'prod-korean-beef',
    slug: 'korean-beef-bowl',
    nameNl: 'Korean Beef Bowl',
    nameEn: 'Korean Beef Bowl',
    imageUrl:
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=1200&fit=crop&q=80',
    priceCents: 1095,
    kcal: 580,
    proteinG: 42,
    carbsG: 58,
    fatG: 18,
    fiberG: 6,
    saltG: 1.8,
    goalTag: 'maintenance',
  },
  salmon: {
    id: 'prod-salmon',
    slug: 'sweet-potato-salmon',
    nameNl: 'Sweet Potato Salmon',
    nameEn: 'Sweet Potato Salmon',
    imageUrl:
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&h=1200&fit=crop&q=80',
    priceCents: 1250,
    kcal: 620,
    proteinG: 38,
    carbsG: 52,
    fatG: 24,
    fiberG: 8,
    saltG: 1.2,
    goalTag: 'performance',
  },
  mexican: {
    id: 'prod-mexican-chicken',
    slug: 'mexican-chicken-bowl',
    nameNl: 'Mexican Chicken Bowl',
    nameEn: 'Mexican Chicken Bowl',
    imageUrl:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=1200&fit=crop&q=80',
    priceCents: 1095,
    kcal: 540,
    proteinG: 45,
    carbsG: 56,
    fatG: 12,
    fiberG: 9,
    saltG: 1.4,
    goalTag: 'cut',
  },
};

async function newPage(browser, viewport) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function setCompareItems(page, items) {
  await page.goto(`${BASE}/shop`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((data) => {
    localStorage.setItem(
      'amis-compare',
      JSON.stringify({ state: { items: data }, version: 0 }),
    );
  }, items);
  // Reload so the store hydrates from the seeded localStorage
  await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
}

async function shoot(page, name, opts = {}) {
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? false });
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    // 1) Card with compare button — OFF state on /shop (no items selected)
    {
      const { ctx, page } = await newPage(browser, 'desktop');
      await page.evaluate(() => localStorage.removeItem('amis-compare')).catch(() => {});
      await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);
      console.log('→ Card OFF (no items)');
      await shoot(page, 'compare-card-off-desktop');
      await ctx.close();
    }

    // 2) Card ON state — Korean Beef in compare
    {
      const { ctx, page } = await newPage(browser, 'desktop');
      await setCompareItems(page, [SAMPLE_ITEMS.korean]);
      console.log('→ Card ON (1 item compared)');
      await shoot(page, 'compare-card-on-desktop');
      console.log('→ Bar with 1 item');
      // Crop just the bottom of viewport so the bar is the focus
      await ctx.close();
    }

    // 3) Bar with 2 items
    {
      const { ctx, page } = await newPage(browser, 'desktop');
      await setCompareItems(page, [SAMPLE_ITEMS.korean, SAMPLE_ITEMS.salmon]);
      console.log('→ Bar with 2 items (desktop)');
      await shoot(page, 'compare-bar-2-desktop');
      await ctx.close();
    }

    // 4) Bar with 3 items + mobile
    {
      const { ctx, page } = await newPage(browser, 'desktop');
      await setCompareItems(page, Object.values(SAMPLE_ITEMS));
      console.log('→ Bar with 3 items (desktop)');
      await shoot(page, 'compare-bar-3-desktop');
      await ctx.close();
    }
    {
      const { ctx, page } = await newPage(browser, 'mobile');
      await setCompareItems(page, Object.values(SAMPLE_ITEMS));
      console.log('→ Bar with 3 items (mobile)');
      await shoot(page, 'compare-bar-3-mobile');
      await ctx.close();
    }

    // 5) Modal — 3 items desktop
    {
      const { ctx, page } = await newPage(browser, 'desktop');
      await setCompareItems(page, Object.values(SAMPLE_ITEMS));
      console.log('→ Modal 3 items (desktop)');
      await page.click('button:has-text("Vergelijken")');
      await page.waitForTimeout(600);
      await shoot(page, 'compare-modal-3-desktop');
      await ctx.close();
    }

    // 6) Modal — 3 items mobile
    {
      const { ctx, page } = await newPage(browser, 'mobile');
      await setCompareItems(page, Object.values(SAMPLE_ITEMS));
      console.log('→ Modal 3 items (mobile)');
      await page.click('button:has-text("Vergelijken")');
      await page.waitForTimeout(600);
      await shoot(page, 'compare-modal-3-mobile', { fullPage: true });
      await ctx.close();
    }

    // 7) Edge case — modal with 1 item only
    {
      const { ctx, page } = await newPage(browser, 'desktop');
      await setCompareItems(page, [SAMPLE_ITEMS.korean]);
      console.log('→ Modal 1 item (edge case)');
      await page.click('button:has-text("Vergelijken")');
      await page.waitForTimeout(600);
      await shoot(page, 'compare-modal-1-desktop');
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
