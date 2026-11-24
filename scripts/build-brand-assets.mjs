// Renders public/og.jpg (Open Graph card), src/app/apple-icon.png and src/app/favicon.ico from the site's own
// fonts and photo, so the share image matches the live design. Usage: node scripts/build-brand-assets.mjs
// Requires Playwright (not a project dependency; see scripts/verify.mjs for how to provide it).
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const sharp = require('sharp');

const root = path.resolve('.');
const fontUrl = (name) => pathToFileURL(path.join(root, 'src/app/fonts', name)).href;
const photoUrl = pathToFileURL(path.join(root, 'public/images/mariam-hero.jpg')).href;

const fonts = `
@font-face { font-family: 'NR'; src: url('${fontUrl('newsreader.woff2')}'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'SS'; src: url('${fontUrl('source-sans-3.woff2')}'); font-weight: 400 700; }
@font-face { font-family: 'DM'; src: url('${fontUrl('dm-mono.woff2')}'); font-weight: 400; }
`;

const ogHtml = `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  html,body{margin:0}
  body{width:1200px;height:630px;background:#f8f5ee;color:#11263c;position:relative;overflow:hidden;font-family:'SS',sans-serif}
  .photo{position:absolute;right:0;top:0;width:440px;height:630px;background:url('${photoUrl}') center 38%/cover}
  .rule{position:absolute;right:440px;top:0;width:2px;height:630px;background:#b8955a}
  .copy{position:absolute;left:72px;top:64px;width:640px}
  .brand{font-family:'NR',serif;font-size:34px;letter-spacing:-.01em}
  h1{font-family:'NR',serif;font-weight:400;font-size:88px;line-height:.98;letter-spacing:-.02em;margin:62px 0 0;font-optical-sizing:auto}
  p{font-size:27px;line-height:1.42;margin:34px 0 0;max-width:560px}
  .mono{position:absolute;left:72px;bottom:56px;font-family:'DM',monospace;font-size:20px;color:#7c5e28}
</style></head><body>
  <div class="copy"><div class="brand">Mariam Kaldas</div>
  <h1>You meet every deadline except your own.</h1>
  <p>Co-Active (CPCC), ICF (PCC) and MBTI coaching for driven leaders at a turning point.</p></div>
  <div class="mono">Charleston, SC and worldwide</div>
  <div class="rule"></div><div class="photo"></div>
</body></html>`;

const iconHtml = (size) => `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  html,body{margin:0}
  body{width:${size}px;height:${size}px;background:#11263c;display:grid;place-items:center;position:relative;overflow:hidden}
  .mk{font-family:'NR',serif;color:#f8f5ee;font-size:${Math.round(size * 0.5)}px;letter-spacing:-.04em;line-height:1;margin-top:-${Math.round(size * 0.04)}px}
  .bar{position:absolute;left:${Math.round(size * 0.16)}px;right:${Math.round(size * 0.16)}px;bottom:${Math.round(size * 0.17)}px;height:${Math.max(2, Math.round(size * 0.03))}px;background:#b8955a;border-radius:2px}
</style></head><body><div class="mk">MK</div><div class="bar"></div></body></html>`;

const browser = await chromium.launch();

// Pages must be real files: a page created with setContent() lives at about:blank and cannot load file:// fonts/photos.
const workDir = mkdtempSync(path.join(os.tmpdir(), 'brand-assets-'));
let counter = 0;

async function render(html, width, height, type, quality) {
  const file = path.join(workDir, `page-${counter++}.html`);
  writeFileSync(file, html);
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const buffer = await page.screenshot(type === 'jpeg' ? { type, quality } : { type });
  await page.close();
  return buffer;
}

writeFileSync('public/og.jpg', await render(ogHtml, 1200, 630, 'jpeg', 88));
writeFileSync('src/app/apple-icon.png', await render(iconHtml(180), 180, 180, 'png'));

// favicon.ico: an ICO container holding one 32x32 PNG.
// Next.js requires the PNG inside an .ico to carry an alpha channel (RGBA); screenshots are plain RGB.
const png32 = await sharp(await render(iconHtml(32), 32, 32, 'png')).ensureAlpha().png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // image count
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // palette colors
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // color planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // image size
header.writeUInt32LE(22, 18); // image offset
writeFileSync('src/app/favicon.ico', Buffer.concat([header, png32]));

await browser.close();
console.log('wrote public/og.jpg, src/app/apple-icon.png, src/app/favicon.ico');
