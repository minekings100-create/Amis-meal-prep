#!/usr/bin/env node
/**
 * Compose a side-by-side comparison of two PNGs.
 * Usage: node scripts/compose-comparison.mjs left.png right.png out.png [--label-left=A] [--label-right=B]
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const args = process.argv.slice(2);
if (args.length < 3) {
  console.error('Usage: compose-comparison.mjs <left.png> <right.png> <out.png> [--label-left=A] [--label-right=B]');
  process.exit(1);
}
const [leftPath, rightPath, outPath, ...flags] = args;
const labelLeft = (flags.find((f) => f.startsWith('--label-left=')) || '--label-left=BEFORE').split('=')[1];
const labelRight = (flags.find((f) => f.startsWith('--label-right=')) || '--label-right=AFTER').split('=')[1];

const leftBase64 = (await readFile(leftPath)).toString('base64');
const rightBase64 = (await readFile(rightPath)).toString('base64');

const html = `<!doctype html>
<html><head><style>
  body { margin: 0; background: #f5f5f4; font-family: 'Sora', system-ui, sans-serif; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 16px; }
  .panel { background: white; border-radius: 12px; overflow: hidden; }
  .label { padding: 8px 14px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.18em; color: #44403c; border-bottom: 1px solid #e7e5e4; }
  img { width: 100%; height: auto; display: block; }
</style></head><body>
  <div class="grid">
    <div class="panel">
      <div class="label">${labelLeft}</div>
      <img src="data:image/png;base64,${leftBase64}" />
    </div>
    <div class="panel">
      <div class="label">${labelRight}</div>
      <img src="data:image/png;base64,${rightBase64}" />
    </div>
  </div>
</body></html>`;

const browser = await chromium.launch();
try {
  const ctx = await browser.newContext({ viewport: { width: 2400, height: 1400 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.setContent(html);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(200);
  // Auto-size to content
  const dims = await page.evaluate(() => ({
    w: document.body.scrollWidth,
    h: document.body.scrollHeight,
  }));
  await page.setViewportSize({ width: dims.w, height: dims.h });
  await page.screenshot({ path: outPath, fullPage: true });
} finally {
  await browser.close();
}

console.log(`✓ ${outPath}`);
