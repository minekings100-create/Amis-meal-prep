#!/usr/bin/env node
/**
 * Capture skeleton states and real states for comparison.
 *
 * Skeleton trick: ?slow=3000 forces a 3-second server delay before data arrives.
 * We navigate with waitUntil: 'commit' and screenshot immediately — server has
 * already streamed the Suspense fallback, but the suspended async component
 * hasn't resolved yet, so the skeleton is what's painted.
 *
 * Real state: same URL without ?slow, normal networkidle wait.
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

async function shootSkeleton(browser, { name, path, viewport, fullPage = false }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const url = `${BASE}${path}${path.includes('?') ? '&' : '?'}slow=3000`;
  console.log(`→ skeleton ${name} (${viewport})`);
  // Navigate but don't wait — server streams the Suspense fallback first.
  page.goto(url, { waitUntil: 'commit' }).catch(() => {});
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
  // Give the browser a moment to paint the streamed fallback.
  await page.waitForTimeout(700);
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function shootReal(browser, { name, path, viewport, fullPage = false }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const url = `${BASE}${path}`;
  console.log(`→ real ${name} (${viewport})`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    // SHOP — skeleton + real, all 3 viewports
    for (const v of /** @type {const} */ (['desktop', 'tablet', 'mobile'])) {
      await shootSkeleton(browser, { name: `shop-skeleton-${v}`, path: '/shop', viewport: v });
      await shootReal(browser, { name: `shop-real-${v}`, path: '/shop', viewport: v });
    }

    // PRODUCT DETAIL — skeleton + real, desktop + mobile
    await shootSkeleton(browser, {
      name: 'product-skeleton-desktop',
      path: '/shop/korean-beef-bowl',
      viewport: 'desktop',
    });
    await shootReal(browser, {
      name: 'product-real-desktop',
      path: '/shop/korean-beef-bowl',
      viewport: 'desktop',
    });
    await shootSkeleton(browser, {
      name: 'product-skeleton-mobile',
      path: '/shop/korean-beef-bowl',
      viewport: 'mobile',
    });
    await shootReal(browser, {
      name: 'product-real-mobile',
      path: '/shop/korean-beef-bowl',
      viewport: 'mobile',
    });

  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
