#!/usr/bin/env node
/**
 * Capture a scrolled position. Usage:
 *   node scripts/screenshot-scrolled.mjs <name> [scrollY=0] [path=/nl] [viewport=desktop]
 */
import { chromium } from 'playwright';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

async function main() {
  const stripMsys = (s) => (s ?? '').replace(/^[A-Z]:[\\/].*[\\/]([^\\/]+)$/i, '/$1');
  const name = process.argv[2];
  const scrollY = parseInt(process.argv[3] ?? '0', 10);
  const pathArg = process.argv[4] ?? '/nl';
  const viewport = process.argv[5] ?? 'desktop';
  const path = pathArg.startsWith('http') ? pathArg : stripMsys(pathArg.startsWith('/') ? pathArg : `/${pathArg}`);
  if (!name) {
    console.error('Usage: screenshot-scrolled.mjs <name> [scrollY=0] [path=/nl] [viewport=desktop]');
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: VIEWPORTS[viewport] ?? VIEWPORTS.desktop,
      deviceScaleFactor: 2,
    });
    await ctx.addCookies([
      {
        name: 'amis-consent',
        value: encodeURIComponent(
          JSON.stringify({
            essential: true,
            analytics: false,
            marketing: false,
            version: '1.0',
            timestamp: new Date().toISOString(),
          }),
        ),
        url: 'http://localhost:3000',
      },
    ]);
    const page = await ctx.newPage();
    await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
    await page.waitForTimeout(700);
    const file = `temporary screenshots/ux-${name}-${viewport}.png`;
    await page.screenshot({ path: file });
    console.log(`✓ ${file}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
