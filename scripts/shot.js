// Dev tool: screenshot the running game, optionally clicking first.
// Usage: node scripts/shot.js <url> <out.png> [waitMs] [x,y x,y ...]
import puppeteer from 'puppeteer-core';

const [, , url, out, wait = '3000', ...clicks] = process.argv;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: true,
});
const page = await browser.newPage();
await page.setViewport({ width: 450, height: 800 });
await page.goto(url, { waitUntil: 'networkidle0' });
await sleep(+wait);
for (const c of clicks) {
  const [x, y] = c.split(',').map(Number);
  await page.mouse.click(x, y);
  await sleep(800);
}
await sleep(400);
await page.screenshot({ path: out });
await browser.close();
