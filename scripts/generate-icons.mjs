#!/usr/bin/env node
/**
 * One-shot icon generator. Renders a brand-green "A" on white background at
 * 4 sizes via Playwright Chromium and writes PNGs into /public.
 *
 * Run once:  node scripts/generate-icons.mjs
 * Re-run when the brand mark changes.
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const SIZES = [
  { name: 'icon.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 }, // converted to .ico below if pngs2ico tool present; otherwise we keep the 32 as a fallback ico
];

const HTML = (size) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
html, body { margin: 0; padding: 0; background: #fff; }
.wrap {
  width: ${size}px;
  height: ${size}px;
  display: grid;
  place-items: center;
  background: #ffffff;
  border-radius: ${Math.round(size * 0.22)}px;
}
.glyph {
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  font-weight: 800;
  font-size: ${Math.round(size * 0.62)}px;
  color: #4a8a3c;
  letter-spacing: -0.05em;
  line-height: 1;
  position: relative;
  padding-bottom: ${Math.round(size * 0.04)}px;
}
.glyph::after {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 0;
  height: ${Math.max(2, Math.round(size * 0.05))}px;
  background: #7cc24f;
  border-radius: 2px;
}
</style></head><body><div class="wrap"><div class="glyph">A</div></div></body></html>
`;

async function main() {
  const browser = await chromium.launch();
  try {
    for (const { name, size } of SIZES) {
      const ctx = await browser.newContext({
        viewport: { width: size, height: size },
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.setContent(HTML(size));
      const buf = await page.screenshot({
        omitBackground: false,
        type: 'png',
        clip: { x: 0, y: 0, width: size, height: size },
      });
      await writeFile(join('public', name), buf);
      console.log(`✓ public/${name} (${size}x${size})`);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  // Browsers also accept a 32x32 PNG named favicon.ico — Chromium/Firefox/Safari
  // are forgiving with the format and will render this fine even though it's
  // technically a PNG. For a "real" multi-size .ico replace later via a tool
  // like png-to-ico.
  const { readFile } = await import('node:fs/promises');
  const fav32 = await readFile(join('public', 'favicon-32.png'));
  await writeFile(join('public', 'favicon.ico'), fav32);
  console.log('✓ public/favicon.ico (32x32 PNG, browsers accept this)');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
