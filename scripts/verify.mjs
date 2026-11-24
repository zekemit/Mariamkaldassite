// Live-browser verification of a running build (default http://localhost:3100).
//   npm run build && npx next start -p 3100 &   then   node scripts/verify.mjs [baseUrl]
// Requires Playwright (NOT a project dependency): `npm i -D playwright && npx playwright install chromium`,
// or run where Playwright is already installed (set NODE_PATH to its node_modules).
// Checks: console/page errors, HTTP >= 400, broken images, one <h1> per page, first-fold booking CTA,
// request count and JS weight, WCAG AA text contrast (computed from real styles), and axe-core.
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  console.error('Playwright is not installed. See the header of scripts/verify.mjs.');
  process.exit(2);
}
const { chromium, devices } = playwright;

const BASE = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');
const ROUTES = ['/', '/about', '/testimonials', '/faq', '/book', '/privacy'];
const axePath = path.resolve('node_modules/axe-core/axe.min.js');
const axeSource = existsSync(axePath) ? readFileSync(axePath, 'utf8') : null;

const failures = [];
const fail = (where, what) => failures.push(`${where}: ${what}`);
const notes = [];

/** Runs inside the page: WCAG AA text-contrast audit from computed styles. Returns failing text runs. */
function contrastAudit() {
  const parse = (value) => {
    if (!value || value === 'transparent') return [0, 0, 0, 0];
    let m = value.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const parts = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
      return [parts[0], parts[1], parts[2], parts[3] ?? 1];
    }
    m = value.match(/^color\(srgb ([^)]+)\)$/);
    if (m) {
      const parts = m[1].split(/[\s/]+/).filter(Boolean).map(Number);
      return [parts[0] * 255, parts[1] * 255, parts[2] * 255, parts[3] ?? 1];
    }
    return null;
  };
  const over = (top, bottom) => {
    const a = top[3] + bottom[3] * (1 - top[3]);
    if (a === 0) return [0, 0, 0, 0];
    return [0, 1, 2].map((i) => (top[i] * top[3] + bottom[i] * bottom[3] * (1 - top[3])) / a).concat(a);
  };
  const lum = ([r, g, b]) => {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ratio = (a, b) => {
    const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };

  const backdrop = (el) => {
    const layers = [];
    for (let node = el; node; node = node.parentElement) {
      const cs = getComputedStyle(node);
      const image = cs.backgroundImage;
      // The paper grain (a data-URI SVG at ~5% opacity) is ignored; any other image means "check by eye".
      if (image && image !== 'none' && !image.startsWith('url("data:image/svg+xml')) return null;
      const color = parse(cs.backgroundColor);
      if (color && color[3] > 0) {
        layers.push(color);
        if (color[3] >= 1) break;
      }
    }
    let base = [255, 255, 255, 1];
    for (let i = layers.length - 1; i >= 0; i--) base = over(layers[i], base);
    return base;
  };

  const opacityOf = (el) => {
    let o = 1;
    for (let node = el; node; node = node.parentElement) o *= Number(getComputedStyle(node).opacity);
    return o;
  };

  const failures = [];
  const unknown = [];
  let checked = 0;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
  for (let el = walker.currentNode; el; el = walker.nextNode()) {
    if (!(el instanceof HTMLElement || el instanceof SVGElement)) continue;
    if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'svg', 'path'].includes(el.tagName)) continue;
    const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!hasText) continue;
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (rect.width < 4 || rect.height < 4 || cs.visibility === 'hidden' || cs.display === 'none') continue;
    if (el.closest('[hidden]')) continue;
    const opacity = opacityOf(el);
    if (opacity === 0) continue;

    const bg = backdrop(el);
    if (!bg) {
      unknown.push((el.textContent || '').trim().slice(0, 40));
      continue;
    }
    let fg = parse(cs.color);
    if (!fg) continue;
    fg = [fg[0], fg[1], fg[2], fg[3] * opacity];
    const flat = over(fg, bg);
    const size = parseFloat(cs.fontSize);
    const weight = Number(cs.fontWeight);
    const large = size >= 24 || (size >= 18.66 && weight >= 700);
    const needed = large ? 3 : 4.5;
    const got = ratio(flat, bg);
    checked++;
    if (got + 0.005 < needed) {
      failures.push({
        text: (el.textContent || '').trim().slice(0, 50),
        tag: el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : ''),
        ratio: Math.round(got * 100) / 100,
        needed,
      });
    }
  }
  return { checked, failures, unknown };
}

async function expandEverything(page, route) {
  await page.evaluate(() => document.querySelectorAll('details').forEach((d) => (d.open = true)));
  if (route === '/') {
    // Tap every Mirror statement so every reply is visible, and press a stories filter via the stories page.
    const labels = await page.$$('.mirror-label');
    for (const label of labels) await label.click();
    await page.waitForTimeout(500);
  }
  if (route === '/testimonials') {
    const chips = await page.$$('.chip');
    if (chips[1]) await chips[1].click();
    await page.waitForTimeout(300);
  }
}

async function auditRoute(browser, route, mobile) {
  const label = `${route} (${mobile ? 'mobile' : 'desktop'})`;
  const context = await browser.newContext(mobile ? { ...devices['iPhone 13'] } : { viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const client = await context.newCDPSession(page);
  await client.send('Network.enable');

  const types = new Map();
  const bytes = new Map();
  let requests = 0;
  client.on('Network.requestWillBeSent', (e) => {
    if (!e.request.url.startsWith('data:')) requests++;
  });
  client.on('Network.responseReceived', (e) => types.set(e.requestId, e.type));
  client.on('Network.loadingFinished', (e) => bytes.set(e.requestId, e.encodedDataLength));

  const problems = [];
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  // Calendly's iframe (and the reCAPTCHA inside it) logs errors we cannot influence; report them as notes only.
  const thirdParty = /(^|\.)(calendly\.com|recaptcha\.net|google\.com|gstatic\.com)$/;
  const isThirdParty = (url) => {
    try {
      return thirdParty.test(new URL(url).hostname);
    } catch {
      return false;
    }
  };
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const where = m.location()?.url ?? '';
    // Our own CSP blocking a third-party URL is OUR problem, so only filter errors raised inside the third party.
    if (isThirdParty(where) && !/Content Security Policy/.test(m.text())) {
      notes.push(`${label}: third-party console error (${new URL(where).hostname}): ${m.text().slice(0, 80)}`);
      return;
    }
    problems.push(`console.error: ${m.text().slice(0, 200)}`);
  });
  page.on('response', (r) => {
    if (r.status() < 400) return;
    if (isThirdParty(r.url())) notes.push(`${label}: third-party HTTP ${r.status()} ${new URL(r.url()).hostname}`);
    else problems.push(`HTTP ${r.status()} ${r.url().slice(0, 100)}`);
  });
  await page.addInitScript(() => {
    window.__cls = 0;
    window.__lcp = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  // The site uses smooth scrolling; make scripted scrolling instant so clicks hit what they aim at.
  await page.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });

  // ---- network weight at first load (before any scrolling or interaction)
  const sum = (type) => {
    let total = 0;
    let count = 0;
    for (const [id, t] of types) if (t === type) { total += bytes.get(id) ?? 0; count++; }
    return { total, count };
  };
  const js = sum('Script');
  const css = sum('Stylesheet');
  const fonts = sum('Font');
  const imgs = sum('Image');
  const all = [...bytes.values()].reduce((a, b) => a + b, 0);

  // ---- structure
  const structure = await page.evaluate(() => ({
    h1: Array.from(document.querySelectorAll('h1')).map((h) => h.textContent.trim()),
    lang: document.documentElement.lang,
    description: document.querySelector('meta[name="description"]')?.content ?? '',
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? '',
    ogImage: document.querySelector('meta[property="og:image"]')?.content ?? '',
    jsonld: Array.from(document.querySelectorAll('script[type="application/ld+json"]')).map((s) => {
      try {
        const data = JSON.parse(s.textContent);
        return (data['@graph'] ?? [data]).map((n) => n['@type']);
      } catch {
        return ['INVALID'];
      }
    }),
    cls: window.__cls,
    lcp: Math.round(window.__lcp),
  }));
  if (structure.h1.length !== 1 || !structure.h1[0]) fail(label, `expected exactly one non-empty <h1>, found ${JSON.stringify(structure.h1)}`);
  if (structure.lang !== 'en') fail(label, `html lang is "${structure.lang}"`);
  if (!structure.description) fail(label, 'missing meta description');
  if (!structure.canonical) fail(label, 'missing canonical link');
  if (!structure.ogImage) fail(label, 'missing og:image');
  if (structure.jsonld.flat().includes('INVALID')) fail(label, 'invalid JSON-LD');

  // ---- first-fold CTA
  const viewport = page.viewportSize();
  const cta = await page.$eval('a[data-cta="hero"]', (el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
  }).catch(() => null);
  const header = await page.$eval('a[data-cta="header"]', (el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
  }).catch(() => null);
  if (!header || header.bottom > viewport.height) fail(label, 'header booking pill is not in the first screen');
  if (route === '/') {
    if (!cta) fail(label, 'hero booking CTA not found');
    else if (cta.bottom > viewport.height) fail(label, `hero CTA is below the fold (bottom ${cta.bottom}px > ${viewport.height}px)`);
  }

  // ---- scroll through (lazy images), then broken-image and interaction audits
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
  const broken = await page.evaluate(() =>
    Array.from(document.images)
      .filter((img) => !(img.complete && img.naturalWidth > 0))
      .map((img) => img.currentSrc || img.src),
  );
  for (const src of broken) fail(label, `broken image: ${src}`);

  await expandEverything(page, route);
  if (mobile) {
    const toggle = await page.$('.menu-toggle');
    if (toggle) {
      await toggle.click();
      await page.waitForTimeout(200);
    }
  }
  const contrast = await page.evaluate(contrastAudit);
  for (const f of contrast.failures) fail(label, `contrast ${f.ratio}:1 < ${f.needed}:1 on <${f.tag}> "${f.text}"`);

  let axe = null;
  if (axeSource && !mobile) {
    await page.evaluate(axeSource);
    axe = await page.evaluate(async () => {
      // preload:false stops axe from XHR-fetching cross-origin stylesheets (Calendly's), which logs a CORS error.
      const result = await window.axe.run(document, { resultTypes: ['violations'], preload: false });
      return result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help }));
    });
    for (const v of axe) {
      if (v.impact === 'critical' || v.impact === 'serious') fail(label, `axe ${v.impact}: ${v.id} (${v.nodes} nodes) ${v.help}`);
      else notes.push(`${label}: axe ${v.impact}: ${v.id} (${v.nodes} nodes)`);
    }
  }

  for (const p of problems) fail(label, p);

  console.log(
    `${label.padEnd(26)} req ${String(requests).padStart(3)} | total ${(all / 1024).toFixed(0).padStart(4)} KB | JS ${(js.total / 1024).toFixed(1).padStart(6)} KB x${js.count} | CSS ${(css.total / 1024).toFixed(1)} KB | fonts ${(fonts.total / 1024).toFixed(0)} KB x${fonts.count} | img ${(imgs.total / 1024).toFixed(0)} KB x${imgs.count} | CLS ${structure.cls.toFixed(3)} | LCP ${structure.lcp}ms | CTA ${cta ? cta.top + 'px' : 'n/a'} | contrast ${contrast.checked} checked, ${contrast.failures.length} fail, ${contrast.unknown.length} manual | ld ${JSON.stringify(structure.jsonld.flat())}`,
  );
  await context.close();
}

(async () => {
  const browser = await chromium.launch();
  console.log(`Verifying ${BASE}\n`);
  for (const route of ROUTES) {
    await auditRoute(browser, route, false);
    await auditRoute(browser, route, true);
  }

  // Hero CTA position across common viewports (home page).
  console.log('\nHero CTA position by viewport:');
  for (const [w, h] of [[360, 640], [390, 664], [390, 844], [768, 1024], [1280, 720], [1440, 900]]) {
    const context = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await context.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const r = await page.$eval('a[data-cta="hero"]', (el) => {
      const b = el.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom) };
    });
    console.log(`  ${w}x${h}: top ${r.top}px, bottom ${r.bottom}px ${r.bottom <= h ? 'visible without scrolling' : 'BELOW THE FOLD'}`);
    if (r.bottom > h) fail(`/ ${w}x${h}`, `hero CTA below the fold (bottom ${r.bottom}px)`);
    await context.close();
  }

  await browser.close();
  if (notes.length) console.log('\nNotes (minor/moderate):\n  ' + notes.join('\n  '));
  if (failures.length) {
    console.log(`\n${failures.length} FAILURE(S):\n  ` + failures.join('\n  '));
    process.exit(1);
  }
  console.log('\nAll checks passed.');
})();
