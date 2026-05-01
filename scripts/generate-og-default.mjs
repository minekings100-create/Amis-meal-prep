#!/usr/bin/env node
/**
 * Generate a static fallback OG image at /public/og-default.png.
 * Used when the dynamic /og route is unreachable (e.g. preview tools that
 * don't support edge functions). Mirrors the design of the dynamic OG.
 */
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const HTML = `<!doctype html>
<html><head><meta charset="utf-8"><style>
html, body { margin: 0; padding: 0; }
.card {
  width: 1200px;
  height: 630px;
  background: #0f1410;
  color: white;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  position: relative;
  overflow: hidden;
}
.stripe {
  position: absolute; top: 0; left: 0; right: 0; height: 6px;
  background: linear-gradient(90deg, #7cc24f 0%, #4a8a3c 50%, #7cc24f 100%);
}
.glow {
  position: absolute; right: -120px; bottom: -120px;
  width: 480px; height: 480px; border-radius: 50%;
  background: #7cc24f; opacity: 0.18; filter: blur(4px);
}
.content { position: absolute; inset: 80px; display: flex; flex-direction: column; justify-content: space-between; z-index: 10; }
.logo { display: flex; align-items: baseline; gap: 12px; }
.logo .name { font-size: 44px; font-weight: 800; letter-spacing: -0.04em; }
.logo .tag { font-size: 14px; letter-spacing: 0.3em; text-transform: uppercase; color: rgba(255,255,255,0.5); }
h1 { font-size: 84px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.05; margin: 0; max-width: 1040px; }
p { font-size: 30px; margin-top: 24px; color: rgba(255,255,255,0.85); line-height: 1.4; max-width: 1040px; }
.foot { display: flex; align-items: center; justify-content: space-between; font-size: 18px; color: rgba(255,255,255,0.5); }
.mono { font-family: ui-monospace, "JetBrains Mono", monospace; }
</style></head><body>
<div class="card">
  <div class="stripe"></div>
  <div class="glow"></div>
  <div class="content">
    <div class="logo"><span class="name">AMIS</span><span class="tag">meals</span></div>
    <div>
      <h1>Vers, hoog-eiwit, uit Maastricht</h1>
      <p>Cut, bulk, performance — wij koken, jij traint.</p>
    </div>
    <div class="foot"><span>amismeals.nl</span><span class="mono">Maastricht · NL</span></div>
  </div>
</div>
</body></html>`;

async function main() {
  const browser = await chromium.launch();
  try {
    const ctx = await browser.newContext({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    await page.setContent(HTML);
    const buf = await page.screenshot({
      type: 'png',
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    await writeFile(join('public', 'og-default.png'), buf);
    console.log('✓ public/og-default.png (1200x630)');
    await ctx.close();
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
