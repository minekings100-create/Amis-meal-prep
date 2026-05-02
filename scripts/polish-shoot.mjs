#!/usr/bin/env node
/**
 * Polish-pass screenshot batcher.
 *
 *   node scripts/polish-shoot.mjs <slug> <path> [scrollY=0] [fullPage=0]
 *
 * Captures the same path at desktop 1280x720, tablet 768x1024, mobile 375x812.
 * Sets cookie-consent so the banner doesn't intrude.
 * Downscales the resulting PNG via sharp to max-height 1800 (fit: inside)
 * so multi-image API calls stay within Claude's per-image limit.
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1280, height: 720 } },
  { name: 'tablet', size: { width: 768, height: 1024 } },
  { name: 'mobile', size: { width: 375, height: 812 } },
];

const MAX_HEIGHT = 1800;

// Git Bash on Windows mangles a leading `/foo/bar` into `C:/Program Files/Git/foo/bar`.
// Detect that prefix and recover the original POSIX path. If the arg already looks like
// a normal path, return it untouched.
const stripMsys = (s) => {
  if (!s) return s;
  const m = s.match(/^[A-Z]:[\\/](?:Program Files(?: \(x86\))?[\\/])?Git(?:[\\/]usr)?[\\/](.*)$/i);
  if (m) return '/' + m[1].replace(/\\/g, '/');
  return s;
};

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
        deviceScaleFactor: 1,
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
      const raw = await page.screenshot({ fullPage });
      const resized = await sharp(raw)
        .resize({ height: MAX_HEIGHT, fit: 'inside', withoutEnlargement: true })
        .png()
        .toBuffer();
      const { writeFile } = await import('node:fs/promises');
      await writeFile(file, resized);
      const meta = await sharp(resized).metadata();
      console.log(`✓ ${file} (${meta.width}x${meta.height})`);
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
