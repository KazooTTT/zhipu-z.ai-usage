const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  console.log('Waiting for data to load...');
  await page.waitForTimeout(5000);
  
  console.log('Taking screenshot...');
  await page.screenshot({ path: 'screenshot-data-loaded.png', fullPage: true });
  
  console.log('Screenshot saved to screenshot-data-loaded.png');
  console.log('Console logs:');
  const logs = [];
  page.on('console', msg => {
    logs.push(msg.text());
  });
  
  await browser.close();
  console.log('Done!');
})();
