const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString(), '\nSTACK:', err.stack);
  });
  
  await page.goto('http://localhost:5173/login');
  await page.type('input[type="email"]', 'student@iilm.edu');
  await page.type('input[type="password"]', 'student123');
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation()
  ]);
  
  console.log('Logged in. Navigating to interview...');
  await page.goto('http://localhost:5173/live/3', { waitUntil: 'networkidle0' });
  
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
