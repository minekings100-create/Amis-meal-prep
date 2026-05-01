#!/usr/bin/env node
/**
 * Hero review screenshots:
 *   - Homepage at-top (transparent header) on desktop / tablet / mobile (viewport only)
 *   - Homepage scrolled 300px (header should be solid white) on desktop
 *   - /shop and /atleten on desktop (header should be solid white from start)
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

async function shoot(browser, { name, path: pagePath, viewport, scrollY = 0, fullPage = false }) {
  const ctx = await browser.newContext({ viewport: VIEWPORTS[viewport], deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const url = `${BASE}${pagePath}`;
  console.log(`→ ${name} (${viewport})${scrollY ? ` scrolled ${scrollY}` : ''}`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(400);
  if (scrollY > 0) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(500);
  }
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    // Hero at-top (transparent header) — viewport only so we see what user sees first
    await shoot(browser, { name: 'home-hero-desktop', path: '/', viewport: 'desktop' });
    await shoot(browser, { name: 'home-hero-tablet', path: '/', viewport: 'tablet' });
    await shoot(browser, { name: 'home-hero-mobile', path: '/', viewport: 'mobile' });

    // Scrolled state — header should be solid white now
    await shoot(browser, {
      name: 'home-scrolled-desktop',
      path: '/',
      viewport: 'desktop',
      scrollY: 300,
    });
    await shoot(browser, {
      name: 'home-scrolled-mobile',
      path: '/',
      viewport: 'mobile',
      scrollY: 300,
    });

    // Other pages — header should be solid white from the start
    await shoot(browser, { name: 'shop-header-desktop', path: '/shop', viewport: 'desktop' });
    await shoot(browser, { name: 'atleten-header-desktop', path: '/atleten', viewport: 'desktop' });
    await shoot(browser, { name: 'contact-header-desktop', path: '/contact', viewport: 'desktop' });
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
