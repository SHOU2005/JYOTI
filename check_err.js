const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });
  await page.goto('http://localhost:5173/login');
  await page.type('input[type="email"]', 'student@iilm.edu');
  await page.type('input[type="password"]', 'student123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);
  // get a JWT token and start interview
  await page.goto('http://localhost:5173/live/3');
  await new Promise(r => setTimeout(r, 3000));
  await browser.close();
})();
