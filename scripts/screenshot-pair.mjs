#!/usr/bin/env node
/**
 * Quick before/after pair shooter — usage:
 *   node scripts/screenshot-pair.mjs <name> <path> [viewport]
 *   viewport = desktop | tablet | mobile (default desktop)
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
  mobile: { width: 390, height: 844 },
};

async function main() {
  // MSYS/git bash auto-converts leading slashes — strip Windows path prefixes if present.
  const stripMsys = (s) => (s ?? '').replace(/^[A-Z]:[\\/].*[\\/]([^\\/]+)$/i, '/$1');
  const [, , name, pathArg = '/', viewport = 'desktop'] = process.argv;
  const path = pathArg.startsWith('http') ? pathArg : stripMsys(pathArg.startsWith('/') ? pathArg : `/${pathArg}`);
  if (!name) {
    console.error('Usage: screenshot-pair.mjs <name> [path] [viewport]');
    process.exit(1);
  }
  const OUT = 'temporary screenshots';
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: VIEWPORTS[viewport] ?? VIEWPORTS.desktop,
      deviceScaleFactor: 2,
    });
    // Pre-set consent so the cookie banner doesn't cover screenshots.
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
    await page.waitForTimeout(900);
    const file = `${OUT}/ux-${name}-${viewport}.png`;
    await page.screenshot({ path: file, fullPage: false });
    await ctx.close();
    console.log(`✓ ${file}`);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
