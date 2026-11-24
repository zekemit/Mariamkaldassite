// Real-browser test of the admin portal against a running production build.
//
//   ADMIN_PASSWORD=... CMS_DATA_FILE=/tmp/cms.json npx next start -p 3100 &
//   ADMIN_PASSWORD=... [CMS_DATA_FILE=/tmp/cms.json] node scripts/verify-admin.mjs [baseUrl]
//
// Run it against a THROWAWAY content store (a temp CMS_DATA_FILE, or a throwaway Redis): it edits and resets the
// content. Requires Playwright (not a project dependency; see the header of scripts/verify.mjs).
//
// Covers: sign-in (wrong password, throttling, cookie flags), editing every tab, publish, the public pages
// re-rendering with no redeploy, popup behavior, XSS and javascript: URL rejection (UI and API), CSRF origin check,
// Reset to Defaults, sign-out, and axe-core on every admin screen.
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  console.error('Playwright is not installed. See the header of scripts/verify.mjs.');
  process.exit(2);
}
const { chromium } = playwright;

const BASE = (process.argv[2] ?? 'http://localhost:3100').replace(/\/$/, '');
const PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) {
  console.error('Set ADMIN_PASSWORD to the password the server was started with.');
  process.exit(2);
}
const DATA_FILE = process.env.CMS_DATA_FILE;
const SHOTS = process.env.SHOTS_DIR;
if (SHOTS) mkdirSync(SHOTS, { recursive: true });
const axePath = path.resolve('node_modules/axe-core/axe.min.js');
const axeSource = existsSync(axePath) ? readFileSync(axePath, 'utf8') : null;

const results = [];
const check = (name, ok, detail) => {
  results.push({ name, ok: Boolean(ok) });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail !== undefined && detail !== '' ? `  -> ${detail}` : ''}`);
};
const section = (title) => console.log(`\n== ${title}`);

const consoleProblems = [];
function watch(page, label) {
  page.on('pageerror', (error) => consoleProblems.push(`${label} pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    // Chromium logs every non-2xx fetch; the deliberate wrong-password / throttled / unauthorized calls are expected.
    if (/status of (401|429)/.test(text)) return;
    // Calendly's own embed asks for storage access inside its iframe and is refused in headless Chromium.
    if (/requestStorageAccess/.test(text)) return;
    // The deliberate request for a page that does not exist (the 404 check).
    if (/status of 404/.test(text) && /definitely-not-a-page/.test(message.location().url)) return;
    consoleProblems.push(`${label} console.error: ${text}`);
  });
}

async function axeScan(page, label) {
  if (!axeSource) return;
  await page.evaluate(axeSource);
  const found = await page.evaluate(async () => {
    const run = await window.axe.run(document, { preload: false, resultTypes: ['violations'] });
    return run.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: `${v.nodes[0]?.html.slice(0, 90)} :: ${v.nodes[0]?.any[0]?.message ?? ''}` }));
  });
  const serious = found.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  check(`axe: no serious/critical issues on ${label}`, serious.length === 0, serious.map((v) => `${v.id}(${v.nodes}) ${v.sample}`).join(' | '));
  const minor = found.filter((v) => !serious.includes(v));
  if (minor.length) console.log(`      note: minor axe findings on ${label}: ${minor.map((v) => `${v.id}(${v.impact})`).join(', ')}`);
}

const shot = async (page, name) => {
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
};

const browser = await chromium.launch();
const isHttps = BASE.startsWith('https://');
const SESSION_COOKIE = /mk_admin$/;

async function signIn(context, { expectOk = true } = {}) {
  const page = await context.newPage();
  watch(page, 'signin');
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  if (expectOk) await page.waitForURL(`${BASE}/admin`, { timeout: 15000 });
  return page;
}

// ---------------------------------------------------------------------------------------------------------------
section('1. Signed out: everything is closed');
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  watch(page, 'anon');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check('/admin sends a signed-out visitor to /admin/login', new URL(page.url()).pathname === '/admin/login', page.url());

  const get = await context.request.get(`${BASE}/api/admin/content`);
  check('GET /api/admin/content without a session is 401', get.status() === 401, get.status());
  const put = await context.request.put(`${BASE}/api/admin/content`, { data: {}, headers: { origin: BASE } });
  check('PUT /api/admin/content without a session is 401', put.status() === 401, put.status());
  const del = await context.request.delete(`${BASE}/api/admin/content`, { headers: { origin: BASE } });
  check('DELETE /api/admin/content without a session is 401', del.status() === 401, del.status());

  const robots = await context.request.get(`${BASE}/api/admin/content`);
  check('admin API sends X-Robots-Tag: noindex', /noindex/.test(robots.headers()['x-robots-tag'] ?? ''), robots.headers()['x-robots-tag']);
  const loginPage = await context.request.get(`${BASE}/admin/login`);
  check('admin pages send X-Robots-Tag: noindex and no-store', /noindex/.test(loginPage.headers()['x-robots-tag'] ?? '') && /no-store/.test(loginPage.headers()['cache-control'] ?? ''), `${loginPage.headers()['x-robots-tag']} | ${loginPage.headers()['cache-control']}`);
  const html = await loginPage.text();
  check('admin pages carry a robots noindex meta tag', /<meta name="robots" content="[^"]*noindex/.test(html));
  const robotsTxt = await (await context.request.get(`${BASE}/robots.txt`)).text();
  check('robots.txt disallows /admin and /api/', /Disallow: \/admin/.test(robotsTxt) && /Disallow: \/api\//.test(robotsTxt));

  check('login page has one h1 and a labelled password field', (await page.locator('h1').count()) === 1 && (await page.getByLabel('Password', { exact: true }).count()) === 1);
  await axeScan(page, '/admin/login');
  await shot(page, 'login');
  await context.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('2. Wrong passwords, then throttling (isolated address)');
{
  const context = await browser.newContext({ extraHTTPHeaders: { 'x-forwarded-for': '203.0.113.99' } });
  const page = await context.newPage();
  watch(page, 'throttle');
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  await page.getByLabel('Password', { exact: true }).fill('definitely-not-it');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // Not getByRole('alert'): Next.js keeps its own (empty) route-announcer alert on every page.
  await page.locator('p.a-error[role="alert"]').waitFor();
  const message = await page.locator('p.a-error[role="alert"]').textContent();
  check('a wrong password shows a plain-language error and stays on the login page', /didn’t match/.test(message ?? '') && new URL(page.url()).pathname === '/admin/login', message);
  check('the wrong-password error does not reveal whether a password is configured', !/not configured|no admin password/i.test(message ?? ''));
  check('no session cookie was set by a failed sign-in', !(await context.cookies()).some((c) => SESSION_COOKIE.test(c.name)));

  let status = 0;
  let retryAfter = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const r = await context.request.post(`${BASE}/api/admin/login`, { data: { password: `guess-${attempt}` }, headers: { origin: BASE, 'x-forwarded-for': '203.0.113.99' } });
    status = r.status();
    retryAfter = r.headers()['retry-after'] ?? null;
    if (status === 429) break;
  }
  check('repeated wrong passwords are throttled with 429 and Retry-After', status === 429 && Number(retryAfter) > 0, `status=${status} retry-after=${retryAfter}`);
  const right = await context.request.post(`${BASE}/api/admin/login`, { data: { password: PASSWORD }, headers: { origin: BASE, 'x-forwarded-for': '203.0.113.99' } });
  check('while throttled even the right password is refused', right.status() === 429, right.status());
  await page.getByLabel('Password', { exact: true }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForFunction(() => /Too many attempts/.test(document.querySelector('[role="alert"]')?.textContent ?? ''));
  check('the login page tells a throttled person to wait', true);
  await context.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('3. Sign in (right password) and session cookie');
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const admin = await signIn(context);
{
  const cookies = await context.cookies();
  const session = cookies.find((c) => SESSION_COOKIE.test(c.name));
  check('a signed session cookie is set', Boolean(session), session?.name);
  check('cookie is HttpOnly', session?.httpOnly === true);
  check('cookie is SameSite=Lax', session?.sameSite === 'Lax', session?.sameSite);
  const days = session ? (session.expires - Date.now() / 1000) / 86400 : 0;
  check('cookie lasts 7 days', days > 6.9 && days <= 7.01, `${days.toFixed(2)} days`);
  check('cookie is Secure with the __Host- prefix in production', session?.secure === true && session.name.startsWith('__Host-'), `secure=${session?.secure} name=${session?.name}`);
  check('cookie path is /', session?.path === '/', session?.path);
  check('script cannot read the cookie (HttpOnly)', !(await admin.evaluate(() => document.cookie)).includes('mk_admin'));
  check('a signed-in visitor on /admin/login is sent to the editor', await (async () => {
    await admin.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
    return new URL(admin.url()).pathname === '/admin';
  })(), admin.url());
  check('the editor loads with five tabs and a page heading', (await admin.getByRole('tab').count()) === 5 && (await admin.locator('h1').count()) === 1);
  check('storage status is shown', (await admin.getByText(/^Storage:/).count()) === 1, await admin.getByText(/^Storage:/).textContent());
  check('"View live site" opens in a new tab safely', (await admin.getByRole('link', { name: /View live site/ }).first().getAttribute('rel')) === 'noopener noreferrer');
  await shot(admin, 'editor-banner');
  await axeScan(admin, '/admin (Banner & Popup tab)');
}

// ---------------------------------------------------------------------------------------------------------------
section('4. Edit every tab, then publish');
const tab = (name) => admin.getByRole('tab', { name: new RegExp(name) }).click();
const saveButton = admin.getByRole('button', { name: /Save & Publish Changes/ });
check('Save is disabled until something changes', await saveButton.isDisabled());

// Tab 1: banner (with hostile text) + popup
await tab('Banner & Popup');
await admin.getByRole('switch', { name: /Show the banner/ }).click();
const HOSTILE = '<img src=x onerror="window.__xss=1"> Spring cohort now open';
await admin.getByLabel('Banner text').fill(HOSTILE);
await admin.getByLabel('Link label (optional)').fill('See how it works');
await admin.getByLabel('Link address (optional)').fill('/#how-we-work');
check('banner preview appears as you type', (await admin.getByLabel('Banner preview').count()) === 1);
check('hostile banner text is escaped in the preview too', (await admin.locator('[aria-label="Banner preview"] img').count()) === 0);
check('Save becomes enabled and the bar says there are unpublished changes', (await saveButton.isEnabled()) && (await admin.getByText(/changes that aren’t live yet/).count()) === 1);

await admin.getByRole('switch', { name: /Show the popup/ }).click();
await admin.getByLabel('Headline', { exact: true }).fill('A seat just opened');
await admin.getByLabel('Message (optional)').fill('One complimentary chemistry session is available this week.');
await admin.getByLabel('Button text (optional)').fill('Take the open seat');
check('popup "Open the booking page" is the default button target', await admin.getByRole('radio', { name: 'Open the booking page' }).isChecked());
check('the popup frequency choices are offered', (await admin.getByRole('radio', { name: /Once per session/ }).isChecked()) && (await admin.getByRole('radio', { name: /Every visit/ }).count()) === 1);

// unsafe URLs are refused in the form, with a message, and block publishing
await admin.getByLabel('Link address (optional)').fill('javascript:alert(document.cookie)');
await admin.getByText(/Use a link that starts with https/).first().waitFor();
check('a javascript: link shows an inline error', true);
check('the tab shows an error count', (await admin.locator('.a-tab__errors').count()) >= 1);
await tab('Booking & Contact');
await admin.getByLabel('LinkedIn').fill('javascript:alert(1)');
await admin.getByText('Paste the full address, starting with https://').waitFor();
await saveButton.click();
await admin.getByRole('alert').filter({ hasText: /highlighted/ }).waitFor();
check('Save refuses to publish while fields are invalid, and explains why', true);
check('...and jumps to the first tab that has a problem', (await admin.getByRole('tab', { name: /Banner & Popup/ }).getAttribute('aria-selected')) === 'true');
await admin.getByLabel('Link address (optional)').fill('/#how-we-work');
check('fixing one field leaves the other tab’s error flagged', (await admin.locator('.a-tab__errors').count()) === 1);
await tab('Booking & Contact');
await admin.getByLabel('LinkedIn').fill('https://www.linkedin.com/in/mariam-test');
check('errors clear once the values are fixed', (await admin.locator('.a-tab__errors').count()) === 0);

// Tab 2: hero + Mirror
await tab('Home Page');
await admin.getByLabel('Headline', { exact: true }).fill('Your next chapter starts\nwith one honest conversation.');
await admin.getByLabel('Sub-headline').fill('Straight talk and real follow-through, in Charleston and over Zoom.');
await admin.getByLabel('Main button text').fill('Book your chemistry session');
const statementBox = () => admin.getByLabel(/Statement \(in the visitor/);
check('all seven Mirror statements are editable', (await statementBox().count()) === 7);
await statementBox().first().fill('I’m a driven leader and I want my work to matter.');
await admin.getByRole('button', { name: '+ Add a statement' }).click();
await statementBox().last().fill('I want a sounding board that tells me the truth.');
await admin.getByLabel(/Your reply when it’s tapped/).last().fill('Then you’re in the right place.');
await admin.getByRole('button', { name: 'Move up (statement 8)' }).click();
check('a new statement can be added and moved up', (await statementBox().nth(6).inputValue()) === 'I want a sounding board that tells me the truth.');
await admin.getByRole('button', { name: 'Move down (statement 7)' }).click();
await admin.getByRole('button', { name: 'Delete (statement 3)' }).click();
await admin.getByRole('button', { name: 'Click again to delete (statement 3)' }).click();
check('deleting needs a second click, then removes the statement', (await statementBox().count()) === 7);
await shot(admin, 'editor-home');

// Tab 3: testimonials
await tab('Testimonials');
check('all seven testimonials are listed', (await admin.locator('.a-item').count()) === 7);
check('three are marked as on the homepage', (await admin.locator('.a-badge', { hasText: 'On homepage' }).count()) === 3);
await admin.getByRole('button', { name: '+ Add a client story' }).click();
await admin.getByLabel('Name or initials').fill('<b>Test</b> T.');
await admin.getByLabel('Role or context (optional)').fill('Founder');
await admin.getByLabel('Pull-quote').fill('The hour changed how I plan my year.');
await admin.getByLabel('Full testimonial').fill('The hour changed how I plan my year.\n\nI finally act on the goals I set.');
await admin.getByLabel('Career Pivot').check();
await admin.getByRole('switch', { name: /Featured on homepage/ }).click();
check('eight stories now', (await admin.locator('.a-item').count()) === 8);
await admin.getByRole('button', { name: 'Move up (story 8)' }).click();
await admin.getByRole('button', { name: 'Move down (story 7)' }).click();
await admin.getByRole('button', { name: 'Delete (story 1)' }).click();
await admin.getByRole('button', { name: 'Click again to delete (story 1)' }).click();
check('a story can be deleted (back to seven)', (await admin.locator('.a-item').count()) === 7);
check('the new story is listed', (await admin.getByText('<b>Test</b> T.').count()) >= 1);
await shot(admin, 'editor-testimonials');

// Tab 4: pillars, about, FAQ
await tab('About & FAQ');
await admin.locator('.a-item__toggle', { hasText: 'Co-Active, whole-person coaching' }).click();
await admin.getByLabel('Title', { exact: true }).fill('Whole-person, Co-Active coaching');
check('there are exactly four pillars and no add button for them', (await admin.locator('.a-item__toggle', { hasText: /Co-Active|Know your type|Accountability|Strengths first/ }).count()) >= 4);
await admin.getByRole('button', { name: '+ Add a question' }).click();
await admin.getByLabel('Question', { exact: true }).fill('Do you offer evening sessions?');
await admin.getByLabel('Answer', { exact: true }).fill('Yes.\n\n- Tuesday and Thursday\n- Zoom or phone\n\nEmail ');
await admin.getByRole('button', { name: 'email address' }).click();
check('a link token is inserted at the cursor', (await admin.getByLabel('Answer', { exact: true }).inputValue()).endsWith('{{email}}'));
await admin.getByLabel('Answer', { exact: true }).fill('Yes.\n\n- Tuesday and Thursday\n- Zoom or phone\n\nEmail {{emial}}');
await admin.getByText(/Not a known link: \{\{emial\}\}/).waitFor();
check('a mistyped link token is flagged', true);
await admin.getByLabel('Answer', { exact: true }).fill('Yes.\n\n- Tuesday and Thursday\n- Zoom or phone\n\nEmail {{email}}');
await admin.getByRole('switch', { name: /Show on homepage/ }).click();
await shot(admin, 'editor-about-faq');

// Tab 5: booking and contact
await tab('Booking & Contact');
await admin.getByLabel('Email address').fill('hello@example.org');
await admin.getByLabel('Phone number').fill('(843) 555-0142');
await admin.getByLabel('Location line').fill('Charleston, SC & Worldwide via Zoom (test)');
await admin.getByLabel('Calendly link').fill('https://example.com/not-calendly');
await admin.getByText(/Paste your Calendly link/).waitFor();
check('a non-Calendly address is refused with guidance', true);
await admin.getByLabel('Calendly link').fill('https://calendly.com/kaldas/sample');
check('"Test this link" opens in a new tab', (await admin.getByRole('link', { name: 'Test this link in a new tab' }).getAttribute('target')) === '_blank');
await shot(admin, 'editor-booking');
await axeScan(admin, '/admin (Booking & Contact tab)');

// Publish
await saveButton.click();
await admin.getByText('Changes saved & published live!').waitFor({ timeout: 15000 });
check('publishing shows "Changes saved & published live!"', true);
check('the bar returns to "Everything is live" and Save is disabled again', (await admin.getByText(/Everything is live · last published/).count()) === 1 && (await saveButton.isDisabled()));
if (DATA_FILE) {
  const onDisk = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
  check('the content file on disk holds the edit', onDisk.hero?.headline?.startsWith('Your next chapter starts'));
}
await shot(admin, 'editor-after-save');

// ---------------------------------------------------------------------------------------------------------------
section('5. The live site re-renders with no redeploy');
{
  const visitor = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await visitor.newPage();
  watch(page, 'public');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const h1 = (await page.locator('h1').innerText()).replace(/\s+/g, ' ');
  check('home <h1> shows the new headline (line break honoured)', h1 === 'Your next chapter starts with one honest conversation.', h1);
  check('the animated hero uses two lines', (await page.locator('h1 .hero-line').count()) === 2);
  check('there is still exactly one <h1>', (await page.locator('h1').count()) === 1);
  check('sub-headline and main button text updated', (await page.getByText('Straight talk and real follow-through').count()) === 1 && (await page.getByRole('link', { name: 'Book your chemistry session' }).count()) >= 1);
  check('the announcement banner is on every page, above the header', (await page.locator('.announce').count()) === 1 && (await page.locator('.announce + header.site-header').count()) === 1);
  check('hostile banner text is shown as literal text, not executed', (await page.locator('.announce img').count()) === 0 && (await page.locator('.announce').innerText()).includes('<img src=x') && (await page.evaluate(() => window.__xss)) === undefined);
  check('the banner link works', (await page.locator('.announce a').getAttribute('href')) === '/#how-we-work');
  check('Mirror shows the edited, added and removed statements', (await page.locator('.mirror-text').count()) === 7 && (await page.getByText('I want a sounding board that tells me the truth.').count()) === 1 && (await page.getByText('I’m a driven leader and I want my work to matter.').count()) === 1 && (await page.getByText('I’m a driven leader and I want my work to make an impact.').count()) === 0 && (await page.getByText('I’m playful and I have a great sense of humor.').count()) === 0);
  check('the Calendly/booking surfaces are unchanged on the home page', (await page.locator('a[data-cta="mirror"]').count()) === 1);
  check('featured stories on the home page include the new one', (await page.locator('#stories').getByText('The hour changed how I plan my year.').count()) === 1);
  check('the pillar title edit is live', (await page.getByRole('heading', { name: 'Whole-person, Co-Active coaching' }).count()) === 1);
  check('the FAQ marked "Show on homepage" is on the home page', (await page.locator('#faq').getByText('Do you offer evening sessions?').count()) === 1);
  const footer = await page.locator('footer.site-footer').innerText();
  check('footer shows the new email, phone, location and LinkedIn', footer.includes('hello@example.org') && footer.includes('(843) 555-0142') && footer.includes('(test)') && (await page.locator('footer.site-footer a[href="https://www.linkedin.com/in/mariam-test"]').count()) === 1, footer.replace(/\s+/g, ' ').slice(0, 160));
  check('footer links use the new tel: and mailto: values', (await page.locator('footer.site-footer a[href="tel:+18435550142"]').count()) === 1 && (await page.locator('footer.site-footer a[href="mailto:hello@example.org"]').count()) === 1);
  const ld = await page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.map((n) => n.textContent).join('\n'));
  check('structured data carries the new contact details and sameAs profile', ld.includes('hello@example.org') && ld.includes('+18435550142') && ld.includes('linkedin.com/in/mariam-test'));
  check('structured data cannot be broken out of its script tag', !/<\/script/i.test(ld) && (await page.locator('script[type="application/ld+json"]').count()) >= 2);

  await page.goto(`${BASE}/testimonials`, { waitUntil: 'networkidle' });
  check('/testimonials lists seven stories with the new one', (await page.locator('.story-card').count()) === 7 && (await page.getByText('<b>Test</b> T.').count()) === 1);
  check('the new story’s HTML-looking name is escaped (no <b> element)', (await page.locator('.story-name b').count()) === 0);
  check('the role/context shows under the name', (await page.locator('.story-role', { hasText: 'Founder' }).count()) === 1);
  check('the Career Pivot filter shows 4 stories now', (await page.getByRole('button', { name: /Career Pivot/ }).locator('.chip-count').innerText()) === '4');
  await page.getByRole('button', { name: /Career Pivot/ }).click();
  check('filtering works with CMS tags', (await page.locator('.story-card').count()) === 4);
  await page.getByRole('button', { name: /Accountability & Action/ }).click();
  check('an unused tag would not be offered, a used one filters correctly', (await page.locator('.story-card').count()) >= 1);

  await page.goto(`${BASE}/faq`, { waitUntil: 'networkidle' });
  check('/faq has the new question with bullets and a live email link', (await page.getByText('Do you offer evening sessions?').count()) === 1);
  await page.locator('summary', { hasText: 'Do you offer evening sessions?' }).click();
  const answer = page.locator('.faq-item', { hasText: 'Do you offer evening sessions?' }).locator('.faq-answer');
  check('FAQ answer renders paragraphs, a bulleted list and the email link', (await answer.locator('li').count()) === 2 && (await answer.locator('a[href="mailto:hello@example.org"]').count()) === 1);
  const faqLd = await page.$$eval('script[type="application/ld+json"]', (nodes) => nodes.map((n) => n.textContent).join('\n'));
  check('FAQ structured data includes the new question', faqLd.includes('Do you offer evening sessions?'));
  const oldRates = await page.locator('.faq-item', { hasText: 'What are your rates?' }).locator('a[href="tel:+18435550142"]').count();
  check('existing FAQ answers pick up the new phone number', oldRates >= 1, oldRates);

  await page.goto(`${BASE}/book`, { waitUntil: 'load' });
  check('/book shows the new phone and email', (await page.locator('a[href="tel:+18435550142"]').count()) >= 1 && (await page.locator('a[href="mailto:hello@example.org"]').count()) >= 1);
  await page.waitForSelector('iframe[src*="calendly.com"]', { timeout: 20000 });
  check('/book still embeds the Calendly scheduler', true);
  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
  check('/about still renders credentials from the CMS', (await page.locator('.cred-ledger li').count()) === 3);
  await page.goto(`${BASE}/privacy`, { waitUntil: 'networkidle' });
  check('/privacy uses the new email', (await page.locator('a[href="mailto:hello@example.org"]').count()) >= 1);
  const missing = await page.goto(`${BASE}/definitely-not-a-page`, { waitUntil: 'networkidle' });
  check('404 page keeps the site chrome (banner, header, footer)', missing.status() === 404 && (await page.locator('.announce').count()) === 1 && (await page.locator('footer.site-footer').count()) === 1);
  await visitor.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('6. The popup');
{
  const fresh = async () => {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const p = await ctx.newPage();
    watch(p, 'popup');
    return { ctx, p };
  };
  let { ctx, p } = await fresh();
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  check('the popup is not open immediately (it waits a moment)', (await p.locator('dialog.site-popup[open]').count()) === 0);
  await p.waitForSelector('dialog.site-popup[open]', { timeout: 8000 });
  check('the popup opens as a modal dialog with the headline', (await p.locator('dialog.site-popup h2').innerText()) === 'A seat just opened');
  check('the popup is labelled and has a close button', (await p.locator('dialog.site-popup').getAttribute('aria-labelledby')) !== null && (await p.getByRole('button', { name: 'Close' }).count()) >= 1);
  const box = await p.evaluate(() => {
    const r = document.querySelector('dialog.site-popup[open]').getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, vw: innerWidth, vh: innerHeight };
  });
  check('the popup is centred in the window (not stuck in a corner)', Math.abs(box.cx - box.vw / 2) < 3 && Math.abs(box.cy - box.vh / 2) < 3, JSON.stringify(box));
  check('its button goes to the booking page (booking mode)', (await p.locator('dialog.site-popup a.btn-book').getAttribute('href')) === '/book');
  await shot(p, 'popup-open');
  await p.keyboard.press('Escape');
  check('Escape closes it', (await p.locator('dialog.site-popup[open]').count()) === 0);
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(3600);
  check('"Once per session": it does not return after a reload in the same session', (await p.locator('dialog.site-popup[open]').count()) === 0);
  await p.goto(`${BASE}/book`, { waitUntil: 'load' });
  await ctx.close();

  ({ ctx, p } = await fresh());
  await p.goto(`${BASE}/book`, { waitUntil: 'load' });
  await p.waitForTimeout(3600);
  check('the popup never shows on the booking page', (await p.locator('dialog.site-popup[open]').count()) === 0);
  await ctx.close();
}

// switch to "Every visit" and a custom link button, then check in a second browser
await tab('Banner & Popup');
await admin.getByRole('radio', { name: 'Go to a link I choose' }).check();
await admin.getByLabel('Button link address').fill('https://example.org/hello?x=1&y=2');
await admin.getByRole('radio', { name: /Every visit/ }).check();
await saveButton.click();
await admin.getByText('Changes saved & published live!').nth(0).waitFor();
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  watch(p, 'popup2');
  await p.goto(`${BASE}/about`, { waitUntil: 'networkidle' });
  await p.waitForSelector('dialog.site-popup[open]', { timeout: 8000 });
  const cta = p.locator('dialog.site-popup a.btn-book');
  check('"Go to a link" popup button uses the chosen address, opens safely in a new tab', (await cta.getAttribute('href')) === 'https://example.org/hello?x=1&y=2' && (await cta.getAttribute('rel')) === 'noopener noreferrer' && (await cta.getAttribute('target')) === '_blank');
  await p.keyboard.press('Escape');
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForSelector('dialog.site-popup[open]', { timeout: 8000 });
  check('"Every visit": it shows again on a reload', true);
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('6b. The booking dialog opens centred');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  watch(p, 'dialog');
  await p.goto(`${BASE}/faq`, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.querySelector('dialog.site-popup[open]')?.close());
  await p.click('text=Or see open times right here');
  await p.waitForSelector('dialog.book-dialog[open] iframe[src*="calendly.com"]', { timeout: 20000 });
  await p.waitForTimeout(500);
  const box = await p.evaluate(() => {
    const r = document.querySelector('dialog.book-dialog[open]').getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, vw: innerWidth, vh: innerHeight };
  });
  check('the booking dialog is centred in the window', Math.abs(box.cx - box.vw / 2) < 3 && Math.abs(box.cy - box.vh / 2) < 3, JSON.stringify(box));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('7. Mirror selections are by id (safe across reordering)');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript(() => {
    let calendly;
    const wrap = (value) => {
      if (value && typeof value.initInlineWidget === 'function' && !value.__wrapped) {
        const original = value.initInlineWidget.bind(value);
        value.initInlineWidget = (options) => {
          window.__initCalls = window.__initCalls || [];
          window.__initCalls.push(JSON.parse(JSON.stringify({ url: options.url, prefill: options.prefill, utm: options.utm })));
          return original(options);
        };
        value.__wrapped = true;
      }
      return value;
    };
    Object.defineProperty(window, 'Calendly', { configurable: true, get: () => wrap(calendly), set: (v) => (calendly = v) });
  });
  const p = await ctx.newPage();
  watch(p, 'mirror');
  await p.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await p.evaluate(() => document.querySelector('dialog.site-popup[open]')?.close());
  await p.locator('.mirror-label', { hasText: 'I want a sounding board that tells me the truth.' }).click();
  const href = await p.locator('a[data-cta="mirror"]').getAttribute('href');
  check('the Mirror CTA carries statement ids, not text or positions', /^\/book\?m=prompt-[a-z0-9]+$/.test(href ?? ''), href);
  await p.evaluate(() => document.querySelector('dialog.site-popup[open]')?.close());
  await p.click('a[data-cta="mirror"]');
  await p.waitForURL('**/book**');
  await p.waitForSelector('iframe[src*="calendly.com"]', { timeout: 20000 });
  await p.waitForFunction(() => window.__initCalls && window.__initCalls.length > 0, null, { timeout: 15000 });
  const call = await p.evaluate(() => window.__initCalls.at(-1));
  check('the scheduler is pre-filled with the edited statement text', /What sounded like me:/.test(call.prefill?.customAnswers?.a1 ?? '') && call.prefill.customAnswers.a1.includes('I want a sounding board that tells me the truth.'), call.prefill?.customAnswers?.a1);
  check('the scheduler uses the Calendly link from the CMS', call.url.startsWith('https://calendly.com/kaldas/sample'), call.url);
  await p.goto(`${BASE}/book?m=prompt-doesnotexist,<script>,deadlines`, { waitUntil: 'load' });
  await p.waitForSelector('iframe[src*="calendly.com"]', { timeout: 20000 });
  const listed = await p.locator('aside[aria-label="Shared with your booking"] li').allInnerTexts();
  check('a deep link keeps only ids that exist, ignoring unknown ids and markup', listed.length === 1 && /deadline/.test(listed[0]), JSON.stringify(listed));
  await ctx.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('8. Direct API abuse');
{
  const cookies = await context.cookies();
  const session = cookies.find((c) => SESSION_COOKIE.test(c.name));
  const cookieHeader = `${session.name}=${session.value}`;
  // A client with its own (empty) cookie jar, so the only credentials sent are the ones each call spells out.
  const api = await playwright.request.newContext();
  const current = await (await api.get(`${BASE}/api/admin/content`, { headers: { cookie: cookieHeader } })).json();
  const base = current.content;
  const put = (content, headers = {}) =>
    api.put(`${BASE}/api/admin/content`, { data: content, headers: { origin: BASE, cookie: cookieHeader, ...headers } });

  const evil = structuredClone(base);
  evil.popup.ctaMode = 'url';
  evil.popup.ctaLabel = 'x';
  evil.popup.ctaUrl = 'javascript:alert(1)';
  const rejected = await put(evil);
  check('the API rejects a javascript: link with 422 and a field error', rejected.status() === 422 && 'popup.ctaUrl' in ((await rejected.json()).fieldErrors ?? {}), rejected.status());
  for (const [field, mutate] of [
    ['popup.imageUrl', (c) => (c.popup.imageUrl = 'data:image/svg+xml,<svg onload=alert(1)>')],
    ['hero.portraitSrc', (c) => (c.hero.portraitSrc = '//evil.example/p.jpg')],
    ['settings.facebook', (c) => (c.settings.facebook = 'vbscript:msgbox(1)')],
    ['about.credentials.0.href', (c) => (c.about.credentials[0].href = 'JaVaScRiPt:alert(1)')],
  ]) {
    const c = structuredClone(base);
    mutate(c);
    const r = await put(c);
    check(`the API rejects an unsafe value in ${field}`, r.status() === 422, r.status());
  }
  const extra = await put({ ...base, __admin: true });
  check('the API rejects unknown fields', extra.status() === 422, extra.status());
  const cross = await put(base, { origin: 'https://evil.example' });
  check('a cross-site request (wrong Origin) is refused with 403', cross.status() === 403, cross.status());
  const noOrigin = await api.put(`${BASE}/api/admin/content`, { data: base, headers: { cookie: cookieHeader } });
  check('a request with no Origin header is refused', noOrigin.status() === 403, noOrigin.status());
  const textType = await api.put(`${BASE}/api/admin/content`, { data: 'x', headers: { origin: BASE, cookie: cookieHeader, 'content-type': 'text/plain' } });
  check('a non-JSON body is refused with 415', textType.status() === 415, textType.status());
  const forged = await api.get(`${BASE}/api/admin/content`, { headers: { cookie: `${session.name}=${session.value.split('.')[0]}.AAAA` } });
  check('a forged session signature is refused', forged.status() === 401, forged.status());
  const stillGood = await (await api.get(`${BASE}/api/admin/content`, { headers: { cookie: cookieHeader } })).json();
  check('none of the rejected requests changed anything', stillGood.content.popup.ctaUrl === 'https://example.org/hello?x=1&y=2' && stillGood.content.hero.portraitSrc === base.hero.portraitSrc);
  await api.dispose();
}

// ---------------------------------------------------------------------------------------------------------------
section('9. Reset to Defaults');
{
  await admin.getByRole('button', { name: 'Reset to Defaults' }).click();
  await admin.getByRole('heading', { name: /Reset everything to the original text/ }).waitFor();
  check('Reset asks for confirmation first', true);
  const dlg = await admin.evaluate(() => {
    const r = document.querySelector('dialog.a-dialog[open]').getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, vw: innerWidth, vh: innerHeight };
  });
  check('the confirmation dialog is centred', Math.abs(dlg.cx - dlg.vw / 2) < 3 && Math.abs(dlg.cy - dlg.vh / 2) < 3, JSON.stringify(dlg));
  await admin.getByRole('button', { name: /Cancel, keep my edits/ }).click();
  check('cancelling keeps the edits live', (await (await context.request.get(`${BASE}/api/admin/content`)).json()).content.settings.email === 'hello@example.org');
  await admin.getByRole('button', { name: 'Reset to Defaults' }).click();
  await admin.getByRole('button', { name: 'Yes, reset everything' }).click();
  await admin.getByText('Everything is back to the original text, and it is live.').waitFor({ timeout: 15000 });
  check('resetting shows a confirmation toast', true);
  const visitor = await browser.newContext();
  const page = await visitor.newPage();
  watch(page, 'after-reset');
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const h1 = (await page.locator('h1').innerText()).replace(/\s+/g, ' ');
  check('the public home page is back to the original headline', h1 === 'You meet every deadline except your own.', h1);
  check('the announcement banner is gone and the original footer is back', (await page.locator('.announce').count()) === 0 && (await page.locator('footer.site-footer').innerText()).includes('me@mariamkaldas.com'));
  await page.goto(`${BASE}/testimonials`, { waitUntil: 'networkidle' });
  check('the original seven stories are back (counts 5/3/3/1)', (await page.locator('.story-card').count()) === 7 && (await page.getByRole('button', { name: /Mindset Shift/ }).locator('.chip-count').innerText()) === '5');
  await visitor.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('10. Mobile layout of the editor');
{
  const phone = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
  await phone.addCookies(await context.cookies());
  const page = await phone.newPage();
  watch(page, 'mobile');
  await page.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no horizontal page scroll at phone width', overflow <= 1, `overflow=${overflow}px`);
  check('the save bar stays visible', await page.getByRole('button', { name: /Save & Publish Changes/ }).isVisible());
  await page.getByRole('tab', { name: /Testimonials/ }).click();
  const overflow2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check('no horizontal page scroll on the Testimonials tab', overflow2 <= 1, `overflow=${overflow2}px`);
  await shot(page, 'mobile-testimonials');
  await axeScan(page, '/admin on a phone');
  await phone.close();
}

// ---------------------------------------------------------------------------------------------------------------
section('11. Sign out');
{
  await admin.getByRole('button', { name: 'Log out' }).click();
  await admin.waitForURL(`${BASE}/admin/login`, { timeout: 15000 });
  check('Log out returns to the login page', true);
  check('the session cookie is cleared', !(await context.cookies()).some((c) => SESSION_COOKIE.test(c.name)));
  await admin.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
  check('/admin is closed again after logging out', new URL(admin.url()).pathname === '/admin/login', admin.url());
  const r = await context.request.get(`${BASE}/api/admin/content`);
  check('the API is closed again after logging out', r.status() === 401, r.status());
}

await browser.close();

section('Console and page errors across the whole run');
check('no unexpected console errors or page errors', consoleProblems.length === 0, consoleProblems.slice(0, 5).join(' | '));

const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} admin checks passed${isHttps ? '' : ' (http: cookie Secure flag verified on localhost)'}`);
if (failed.length) {
  console.log('Failed:\n - ' + failed.map((f) => f.name).join('\n - '));
  process.exit(1);
}
