#!/usr/bin/env node
/**
 * Screenshot the AMIS site at desktop / tablet / mobile widths.
 *
 * Usage:
 *   node scripts/screenshot.mjs                       # all defined targets, all viewports
 *   node scripts/screenshot.mjs /shop                 # one path, all viewports
 *   node scripts/screenshot.mjs /shop desktop         # one path, one viewport
 *
 * Output: temporary screenshots/<slug>-<viewport>-<n>.png  (auto-incremented)
 */
import { chromium } from 'playwright';
import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

const DEFAULT_TARGETS = [
  { path: '/', name: 'home' },
  { path: '/shop', name: 'shop' },
  { path: '/shop/korean-beef-bowl', name: 'product' },
  { path: '/cart', name: 'cart' },
];

const OUT_DIR = 'temporary screenshots';

async function nextIndex(prefix) {
  try {
    const files = await readdir(OUT_DIR);
    const re = new RegExp(`^${prefix}-(\\d+)\\.png$`);
    const max = files.reduce((m, f) => {
      const match = f.match(re);
      return match ? Math.max(m, Number.parseInt(match[1], 10)) : m;
    }, 0);
    return max + 1;
  } catch {
    return 1;
  }
}

async function shoot(browser, target, viewportName, opts = {}) {
  const viewport = VIEWPORTS[viewportName];
  const context = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await context.newPage();
  const url = `${BASE}${target.path}`;
  console.log(`→ ${viewportName.padEnd(7)} ${url}${opts.scrollY ? ` (scrolled ${opts.scrollY}px)` : ''}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);
  if (opts.scrollY) {
    await page.evaluate((y) => window.scrollTo(0, y), opts.scrollY);
    await page.waitForTimeout(500); // let scroll-driven transitions finish
  }
  const suffix = opts.label ? `-${opts.label}` : '';
  const prefix = `${target.name}-${viewportName}${suffix}`;
  const idx = await nextIndex(prefix);
  const file = path.join(OUT_DIR, `${prefix}-${idx}.png`);
  // Viewport-only screenshots show the hero accurately; full-page for non-hero ones.
  const fullPage = opts.fullPage !== false && !opts.scrollY;
  await page.screenshot({ path: file, fullPage });
  await context.close();
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const args = process.argv.slice(2);
  const targets = args[0]
    ? [{ path: args[0], name: args[0].replace(/^\//, '').replace(/\//g, '-') || 'home' }]
    : DEFAULT_TARGETS;
  const viewportNames = args[1] ? [args[1]] : Object.keys(VIEWPORTS);

  const browser = await chromium.launch();
  try {
    for (const target of targets) {
      for (const v of viewportNames) {
        await shoot(browser, target, v);
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
