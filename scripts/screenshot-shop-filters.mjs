#!/usr/bin/env node
/**
 * Screenshot the new shop page with filters across 3 viewports + multiple states:
 *   - empty filters (default)
 *   - with goal=cut filter applied (URL state synced)
 *   - mobile bottom sheet OPEN
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

async function shoot(browser, opts) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[opts.viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const url = `${BASE}${opts.path}`;
  console.log(`→ ${opts.name} (${opts.viewport})`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(500);
  if (opts.action) await opts.action(page);
  const file = `${OUT}/${opts.name}.png`;
  await page.screenshot({ path: file, fullPage: opts.fullPage ?? false });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    // Default state, all 3 viewports — viewport-only so hero/filters fit in chat preview
    await shoot(browser, { name: 'shop-filters-desktop', path: '/shop', viewport: 'desktop', fullPage: true });
    await shoot(browser, { name: 'shop-filters-tablet', path: '/shop', viewport: 'tablet' });
    await shoot(browser, { name: 'shop-filters-mobile', path: '/shop', viewport: 'mobile' });

    // With goal=cut filter applied
    await shoot(browser, {
      name: 'shop-cut-applied-desktop',
      path: '/shop?goal=cut',
      viewport: 'desktop',
      fullPage: true,
    });

    // Combo filter: type=package + goal=cut + attr=high-protein + nf=gluten + sort=protein-per-euro
    await shoot(browser, {
      name: 'shop-combo-desktop',
      path: '/shop?goal=cut,performance&attr=high-protein&nf=gluten&sort=protein-per-euro',
      viewport: 'desktop',
      fullPage: true,
    });

    // Mobile — open the bottom sheet
    await shoot(browser, {
      name: 'shop-bottomsheet-mobile',
      path: '/shop',
      viewport: 'mobile',
      action: async (page) => {
        await page.click('[data-testid="filter-trigger"]');
        await page.waitForTimeout(500);
      },
    });

    // Mobile — bottom sheet WITH filters applied (open it again to see them)
    await shoot(browser, {
      name: 'shop-bottomsheet-applied-mobile',
      path: '/shop?goal=cut&attr=high-protein&nf=gluten',
      viewport: 'mobile',
      action: async (page) => {
        await page.click('[data-testid="filter-trigger"]');
        await page.waitForTimeout(500);
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
