#!/usr/bin/env node
/**
 * Polish-pass screenshot batcher.
 *
 *   node scripts/polish-shoot.mjs <slug> <path> [scrollY=0] [fullPage=0]
 *
 * Captures the same path at desktop 1440x900, tablet 768x1024, mobile 375x812.
 * Sets cookie-consent so the banner doesn't intrude.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

const stripMsys = (s) => (s ?? '').replace(/^[A-Z]:[\\/].*[\\/]([^\\/]+)$/i, '/$1');

async function main() {
  const slug = process.argv[2];
  const pathArg = process.argv[3] ?? '/';
  const scrollY = parseInt(process.argv[4] ?? '0', 10);
  const fullPage = process.argv[5] === '1';
  if (!slug) {
    console.error('Usage: polish-shoot.mjs <slug> <path> [scrollY=0] [fullPage=0]');
    process.exit(1);
  }
  const path = pathArg.startsWith('http') ? pathArg : stripMsys(pathArg.startsWith('/') ? pathArg : `/${pathArg}`);
  await mkdir('temporary screenshots', { recursive: true });

  const browser = await chromium.launch();
  try {
    for (const v of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: v.size,
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
      if (scrollY > 0) {
        await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), scrollY);
        await page.waitForTimeout(500);
      }
      const file = `temporary screenshots/polish-${slug}-${v.name}.png`;
      await page.screenshot({ path: file, fullPage });
      console.log(`✓ ${file}`);
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
