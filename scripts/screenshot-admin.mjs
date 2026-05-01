#!/usr/bin/env node
/**
 * Capture admin foundation screenshots:
 *   - Login redirect (anon visiting /admin)
 *   - 403 forbidden page (customer role)
 *   - Owner sidebar (full nav)
 *   - Staff sidebar (no owner-only items)
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = 'temporary screenshots';
const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 820, height: 1180 },
};

async function shoot(browser, { name, path, viewport, fullPage = false, persona }) {
  const ctx = await browser.newContext({
    viewport: VIEWPORTS[viewport],
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  console.log(`→ ${name} (${viewport})`);
  if (persona) {
    // Bootstrap impersonation cookie via /admin?as=...
    await page.goto(`${BASE}/admin?as=${persona}`, { waitUntil: 'networkidle' });
  } else {
    // Clear any leftover cookie before visiting
    await page.context().clearCookies();
  }
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const file = `${OUT}/${name}.png`;
  await page.screenshot({ path: file, fullPage });
  await ctx.close();
  console.log(`  ✓ ${file}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  try {
    // 1. Anonymous → /admin redirects to login
    await shoot(browser, {
      name: 'admin-login-redirect-desktop',
      path: '/admin',
      viewport: 'desktop',
    });

    // 2. Customer → 403 forbidden (impersonate as customer, then visit /admin)
    await shoot(browser, {
      name: 'admin-403-desktop',
      path: '/admin',
      viewport: 'desktop',
      persona: 'customer',
    });

    // 3. Owner — full sidebar with all owner-only items
    await shoot(browser, {
      name: 'admin-owner-desktop',
      path: '/admin',
      viewport: 'desktop',
      persona: 'owner',
    });
    await shoot(browser, {
      name: 'admin-owner-tablet',
      path: '/admin',
      viewport: 'tablet',
      persona: 'owner',
    });

    // 4. Staff — sidebar without owner-only items
    await shoot(browser, {
      name: 'admin-staff-desktop',
      path: '/admin',
      viewport: 'desktop',
      persona: 'staff',
    });
    await shoot(browser, {
      name: 'admin-staff-tablet',
      path: '/admin',
      viewport: 'tablet',
      persona: 'staff',
    });
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
