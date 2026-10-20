// Renders each <section class="screen"> in screens.html, once per target below: the
// landing page's images into assets/screenshots/, and the store listings' into store/.
//
//   cd tools/screenshots && npm install && npm run render
//
// Uses an installed Chromium: set CHROMIUM_PATH if it is not at the default below.
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = resolve(here, '../..');
const types = { '.html': 'text/html', '.png': 'image/png', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };

/**
 * Where the screens go and at what size. `width` and `height` are the screen's size in
 * points, `scale` the pixels per point, so the file is (width × scale) by (height × scale).
 *
 * The store sizes are the stores' own: App Store Connect takes iPhone screenshots at
 * 1179 × 2556 (the Dynamic Island medium display, the one size it requires) and
 * 1320 × 2868 (the large display); Play takes portrait phone screenshots between
 * 1080 and 3840 px whose long side is no more than twice the short side, so the
 * Android set is the phone screen cut to 2:1. Neither store accepts an alpha channel;
 * the screens are opaque, so Chromium writes them as RGB.
 */
const TARGETS = [
  { dir: 'assets/screenshots', width: 390, height: 844, scale: 2 },
  { dir: 'store/ios-medium', width: 393, height: 852, scale: 3 },
  { dir: 'store/ios-large', width: 440, height: 956, scale: 3 },
  { dir: 'store/android', width: 390, height: 780, scale: 3, platform: 'android' },
];

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

for (const target of TARGETS) {
  const out = join(root, target.dir);
  await mkdir(out, { recursive: true });

  const page = await browser.newPage({
    deviceScaleFactor: target.scale,
    viewport: { width: 1400, height: target.height + 100 },
  });
  await page.goto(`http://localhost:${port}/tools/screenshots/screens.html`);

  const names = await page.evaluate(() => window.__neededIcons());
  const icons = {};
  for (const name of names) {
    icons[name] = await readFile(join(here, 'node_modules/ionicons/dist/svg', `${name}.svg`), 'utf8');
  }
  await page.evaluate((icons) => window.__fillIcons(icons), icons);
  await page.evaluate(
    ({ width, height, platform }) => {
      document.documentElement.style.setProperty('--screen-w', `${width}px`);
      document.documentElement.style.setProperty('--screen-h', `${height}px`);
      if (platform) document.body.classList.add(platform);
    },
    { width: target.width, height: target.height, platform: target.platform ?? null }
  );
  await page.evaluate(() => document.fonts.ready);

  for (const id of await page.$$eval('section.screen', (els) => els.map((el) => el.id))) {
    const file = `${id}.png`;
    await page.locator(`#${id}`).screenshot({ path: join(out, file) });
    console.log(`${target.dir}/${file}`);
  }
  await page.close();
}

await browser.close();
server.close();
