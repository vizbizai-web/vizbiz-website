const { chromium, devices } = require('playwright');

const baseUrl = process.env.SCREENSHOT_URL || 'http://127.0.0.1:3334';

(async() => {
  const browser = await chromium.launch({ headless: true });

  const iphone = devices['iPhone 13'];
  const mobile = await browser.newContext({ ...iphone });
  const mpage = await mobile.newPage();
  await mpage.goto(baseUrl, { waitUntil: 'load', timeout: 60000 });
  await mpage.waitForTimeout(4000);
  await mpage.screenshot({ path: 'screenshots/vizbiz-mobile-hero.png' });
  await mpage.screenshot({ path: 'screenshots/vizbiz-mobile-full.png', fullPage: true });
  await mobile.close();

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 2200 } });
  const dpage = await desktop.newPage();
  await dpage.goto(baseUrl, { waitUntil: 'load', timeout: 60000 });
  await dpage.waitForTimeout(4000);
  await dpage.screenshot({ path: 'screenshots/vizbiz-desktop-top.png' });
  await desktop.close();

  await browser.close();
})();
