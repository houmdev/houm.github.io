// Renders each <section class="screen"> in screens.html to assets/screenshots/ as PNG.
//
//   cd tools/screenshots && npm install && npm run render
//
// Uses an installed Chromium: set CHROMIUM_PATH if it is not at the default below.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(here, '../..');
const out = join(root, 'assets/screenshots');
const types = { '.html': 'text/html', '.png': 'image/png', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

// Serve the repo over HTTP so the page's fonts and images load same-origin.
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const { port } = server.address();

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
});
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 900 } });
await page.goto(`http://localhost:${port}/tools/screenshots/screens.html`);

const names = await page.evaluate(() => window.__neededIcons());
const icons = {};
for (const name of names) {
  icons[name] = await readFile(join(here, 'node_modules/ionicons/dist/svg', `${name}.svg`), 'utf8');
}
await page.evaluate((icons) => window.__fillIcons(icons), icons);
await page.evaluate(() => document.fonts.ready);

for (const id of await page.$$eval('section.screen', (els) => els.map((el) => el.id))) {
  const file = `${id}.png`;
  await page.locator(`#${id}`).screenshot({ path: join(out, file) });
  console.log(`assets/screenshots/${file}`);
}

await browser.close();
server.close();
