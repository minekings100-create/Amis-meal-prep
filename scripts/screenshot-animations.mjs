#!/usr/bin/env node
/**
 * Capture animation states:
 *   - homepage scroll-flow frames (top / middle / bottom) so reveals are visible
 *   - stats counter mid-state (during the 1.4s count-up)
 *   - hero parallax delta (top vs scrolled, see photo offset)
 *   - page-transition before/after navigating /shop → /shop/[slug]
 *
 * Trick: the page disables animations under prefers-reduced-motion. Playwright
 * defaults to no preference, so animations DO run. We use `page.evaluate` to
 * stop scroll-snapping and force exact scroll positions.
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

async function newPage(browser, viewport) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
    reducedMotion: 'no-preference',
  });
  const page = await ctx.newPage();
  return { ctx, page };
}

async function shootHomeScroll(browser, viewport) {
  const { ctx, page } = await newPage(browser, viewport);
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Frame 1 — top (hero + start of stats)
  await page.screenshot({ path: `${OUT}/anim-home-top-${viewport}.png` });
  console.log(`  ✓ anim-home-top-${viewport}.png`);

  // Frame 2 — counter mid-state. Trigger the stats by scrolling them into view,
  // then catch the screen ~250ms in (well before the 1400ms duration ends).
  await page.evaluate(() => {
    const stats = document.querySelector('dl');
    stats?.scrollIntoView({ block: 'center', behavior: 'instant' });
  });
  await page.waitForTimeout(280);
  await page.screenshot({ path: `${OUT}/anim-home-counter-mid-${viewport}.png` });
  console.log(`  ✓ anim-home-counter-mid-${viewport}.png`);

  // Frame 3 — let counter finish and capture final state
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/anim-home-counter-final-${viewport}.png` });
  console.log(`  ✓ anim-home-counter-final-${viewport}.png`);

  // Frame 4 — middle of page, AMIS Standard reveal area (catch staggered fade)
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('h2')).find((h) =>
      /standaard|standard/i.test(h.textContent ?? ''),
    );
    if (el) el.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/anim-home-standard-${viewport}.png` });
  console.log(`  ✓ anim-home-standard-${viewport}.png`);

  // Frame 5 — bottom (testimonials)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/anim-home-bottom-${viewport}.png` });
  console.log(`  ✓ anim-home-bottom-${viewport}.png`);

  await ctx.close();
}

async function shootHeroParallax(browser) {
  const { ctx, page } = await newPage(browser, 'desktop');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);

  await page.screenshot({ path: `${OUT}/anim-hero-parallax-top.png` });
  console.log(`  ✓ anim-hero-parallax-top.png`);

  // Scroll 400px and re-screenshot (parallax should make the photo translate ~60px)
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${OUT}/anim-hero-parallax-400.png` });
  console.log(`  ✓ anim-hero-parallax-400.png`);

  await ctx.close();
}

async function shootPageTransition(browser) {
  const { ctx, page } = await newPage(browser, 'desktop');
  await page.goto(`${BASE}/shop`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/anim-transition-before-shop.png` });
  console.log(`  ✓ anim-transition-before-shop.png`);

  // Click first product link, capture during transition
  const link = page.locator('a[href*="/shop/"]').first();
  await link.click();
  // Capture mid-transition (transition is 0.3s; aim for ~150ms)
  await page.waitForTimeout(140);
  await page.screenshot({ path: `${OUT}/anim-transition-mid.png` });
  console.log(`  ✓ anim-transition-mid.png`);

  // Wait for it to settle and capture final
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/anim-transition-after-product.png` });
  console.log(`  ✓ anim-transition-after-product.png`);

  await ctx.close();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    console.log('→ Home scroll-flow desktop');
    await shootHomeScroll(browser, 'desktop');
    console.log('→ Home scroll-flow mobile');
    await shootHomeScroll(browser, 'mobile');
    console.log('→ Hero parallax delta');
    await shootHeroParallax(browser);
    console.log('→ Page transition');
    await shootPageTransition(browser);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
