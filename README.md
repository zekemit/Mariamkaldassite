# mariamkaldas.com

Marketing site for **Mariam Kaldas**, leadership coach (Charleston, SC and worldwide). Rebuild of the old Wix site.
Design rationale and positioning live in [`MILLION_DOLLAR_BLUEPRINT.md`](MILLION_DOLLAR_BLUEPRINT.md); evidence and
verbatim copy from the old site live in [`MARIAM_SITE_AUDIT.md`](MARIAM_SITE_AUDIT.md).

- **Stack:** Next.js 16 (App Router, Cache Components, TypeScript), Tailwind CSS 4, self-hosted fonts, no UI library.
- **Pages:** `/` (8-part flow), `/about`, `/testimonials` (client stories), `/faq`, `/book`, `/privacy`, `/api/contact`.
- **Design system:** Alabaster, Oyster, Harbor Navy, Haint Blue, Brass, Brick. Brick red is used for booking actions only.
  Type: Newsreader (display), Source Sans 3 (text), DM Mono (credential codes, years, coordinates only).

## Live preview

**https://mariamkaldas.vercel.app** is the Vercel project `mariamkaldas`, Git-integrated with this repo: every push to
`main` deploys to production automatically, and other branches get preview URLs. The URL is public but sends
`X-Robots-Tag: noindex`, so search engines ignore it until the real domain is cut over (see "DNS cutover"). Node is
pinned to 22.x in the project settings (the version this was built and tested on).

Until `RESEND_API_KEY` is added in Vercel, the contact form answers 503 and tells the visitor to email Mariam directly.
The booking flow (Calendly) works as soon as it is deployed.

## Quick start

```bash
npm install
cp .env.example .env.local     # optional for local work; see "Environment variables"
npm run dev                    # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` · `npm run typecheck` · `npm test` | ESLint · `tsc` · Vitest (content integrity, validation, rate limits, redirects, booking prefill) |
| `npm run build:map` | Regenerates the Voyage world map (`src/content/world-map.generated.ts`) from Natural Earth data |
| `node scripts/optimize-images.mjs <dir>` | Re-creates the optimized portraits and badges from Mariam's original files |
| `node scripts/build-brand-assets.mjs` | Re-renders `public/og.jpg`, `apple-icon.png`, `favicon.ico` (needs Playwright) |
| `npm run verify` | Live-browser audit of a running build (needs Playwright): errors, 4xx, images, CTA position, request counts, WCAG contrast, axe |

## Environment variables

Everything is optional; the site builds and runs with none set. Copy [`.env.example`](.env.example).

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.mariamkaldas.com` | Canonical host for metadata, sitemap and structured data |
| `NEXT_PUBLIC_CALENDLY_URL` | `https://calendly.com/kaldas/sample` | Event shown in the embedded scheduler |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | unset | Loads Plausible (cookieless) when set; the CSP is adjusted automatically |
| `RESEND_API_KEY` | unset | **Provider 1 for `/api/contact`.** Needs a verified sending domain in Resend |
| `CONTACT_FROM_EMAIL` | `Mariam Kaldas Website <onboarding@resend.dev>` | Set to an address on the verified domain, e.g. `hello@send.mariamkaldas.com`. The default Resend sender only delivers to the Resend account owner |
| `CONTACT_TO_EMAIL` | `me@mariamkaldas.com` | Where inquiries go |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASS` (`SMTP_FROM`) | unset | **Provider 2 (Nodemailer)**, used only when `RESEND_API_KEY` is empty |
| `CONTACT_DRY_RUN` | unset | `1` accepts submissions and logs instead of sending (also automatic in development) |

With neither provider configured, production answers **503** and the form tells the visitor to email Mariam directly;
nothing is silently dropped.

### The contact endpoint (`POST /api/contact`)

Same-origin only (403 otherwise) · JSON only (415) · 20 KB cap (413) · server-side validation with field-level messages
(400) · control characters stripped and line breaks removed from single-line fields (no header injection) · honeypot
field, minimum fill time and a form-age ceiling (bots get a normal 200 and nothing is sent) · rate limits: 30 attempts
and **5 messages per IP per 10 minutes**, 40 per 10 minutes across all visitors, with `Retry-After` (429). The limiter
is in memory, so on serverless each instance keeps its own counters; add a Vercel Firewall rate-limit rule or a shared
store (Upstash) if hard global limits are ever needed.

## Booking: Calendly (Mirror prefill)

- Scheduler: inline embed on `/book`, and in a native dialog ("Or see open times right here"). The Calendly script loads
  only when a scheduler is shown, never on a normal page load.
- **The verified account URL is `calendly.com/kaldas`** (`/kaldas/sample` returns 200). `calendly.com/mariamkaldas`
  returns **404**, so it is not used.
- The Mirror stores tapped statements in the tab (session storage) and links to `/book?m=1,3` (indices only, removed from
  the address bar after reading). `/book` shows exactly what will be sent and lets the visitor remove it. Selected
  statements go to Calendly as custom answer **a1** (the widget delivers it to the embed by `postMessage`).
- **To receive the prefill, add one multi-line question as the *first* question on the `sample` event** ("What brought you
  here?"). Without it Calendly ignores the value.
- UTM tags (`utm_source=mariamkaldas.com`, `utm_medium=website`, `utm_campaign=mirror|direct`, `utm_content=page|dialog`)
  ride along for attribution. Brand colors are passed to the embed; some Calendly plans may ignore them.
- The old Wix Bookings calendar is retired; its URLs redirect to `/book`.

## Deploying to Vercel

The repo is Git-integrated. Pushing to `main` deploys production. Any `*.vercel.app` URL is served with
`X-Robots-Tag: noindex, nofollow` automatically (see `next.config.ts`), so the preview can never compete with the live
Wix site in search. The live domain gets no such header, so there is **no switch to remember at cutover**.

Set these in Vercel → Project → Settings → Environment Variables when ready: `RESEND_API_KEY`, `CONTACT_FROM_EMAIL`.

## DNS cutover: Wix → Vercel (preserve email)

> **Goal: `me@mariamkaldas.com` has zero downtime.** Email runs on Google Workspace, and the MX and TXT records below
> are what keep it working. The cutover changes only the web records (`@` A and `www` CNAME).

### Current records (read from live DNS on 2026-11-24, DNS-over-HTTPS)

| Host | Type | Current value | TTL | At cutover |
|---|---|---|---|---|
| `@` | NS | `ns10.wixdns.net`, `ns11.wixdns.net` | 86400 | **Keep** (Option 1) |
| `@` | A | `185.230.63.107`, `185.230.63.171`, `185.230.63.186` (Wix) | 3600 | **Replace** with `76.76.21.21` |
| `www` | CNAME | `cdn3.wixdns.net` (Wix) | 3600 | **Replace** with `cname.vercel-dns.com` |
| `@` | MX | `10 aspmx.l.google.com` | 3600 | **PRESERVE, do not touch** |
| `@` | MX | `20 alt1.aspmx.l.google.com` | 3600 | **PRESERVE** |
| `@` | MX | `30 alt2.aspmx.l.google.com` | 3600 | **PRESERVE** |
| `@` | MX | `40 alt3.aspmx.l.google.com` | 3600 | **PRESERVE** |
| `@` | MX | `50 alt4.aspmx.l.google.com` | 3600 | **PRESERVE** |
| `@` | TXT (SPF) | `v=spf1 include:_spf.google.com ~all` | 3600 | **PRESERVE** |
| `@` | TXT | `google-site-verification=o-j0H0YuYxV-kiiuWF2jH4-yIba2kJTpMMS2ux3ot18` | 3600 | **PRESERVE** (Google Workspace ownership) |
| `@` | AAAA, CAA | none | | none needed |
| `_dmarc`, `google._domainkey` | TXT | **none today** | | see "Recommended additions" |

The Vercel values were read from Vercel's own domain-config API for this domain (`recommendedIPv4` `76.76.21.21`,
`recommendedCNAME` `cname.vercel-dns.com.`). Re-check them in Vercel → Project → Settings → Domains before changing
anything, because Vercel may show project-specific values. The registrar is not confirmed (the SOA points at Wix
support): confirm who owns the domain, its renewal date and its lock status first.

### Steps

1. **Pre-flight (before any change).** Screenshot or export every record in the Wix DNS manager and compare it with the table above. Anything extra (a subdomain, a verification TXT) must be preserved too. Lower TTLs to 300 s 24 to 48 hours ahead if Wix allows it.
2. **Add the domains in Vercel** (Project → Settings → Domains): `www.mariamkaldas.com` (primary) and `mariamkaldas.com` (redirect to `www`, matching today's behaviour). It will show "Invalid configuration" until DNS changes; that is expected and harmless.
3. **Option 1 (recommended): edit the web records in Wix DNS.** Set the `@` A record to `76.76.21.21` and the `www` CNAME to `cname.vercel-dns.com`. **Do not edit, delete or re-create any MX or TXT record.** If Wix will not let you edit the default A/CNAME while the domain is connected to the Wix site, use Option 2 instead; do not disconnect the domain first.
4. **Option 2 (only if Option 1 is blocked): move DNS to Vercel.** First create *every* record from the table in Vercel DNS: the five MX records with the same priorities, both TXT records, the A and the `www` CNAME. Confirm in the Vercel dashboard that all five MX records exist, *then* change the nameservers at the registrar to `ns1.vercel-dns.com` and `ns2.vercel-dns.com`. Missing MX records at this moment is the one way this migration can lose mail.
5. **Verify immediately** (commands below), then send a test email **to** and **from** `me@mariamkaldas.com`, and open `https://www.mariamkaldas.com`, `https://mariamkaldas.com` (should redirect to `www`) and `/more-about-me` (should redirect to `/about`).
6. **Keep the Wix site and plan for 30+ days** (do not cancel while it holds the domain or DNS). Google Search Console stays verified because the site re-emits the existing `google-site-verification` tag.

```bash
# The MX set must be unchanged (five Google records, priorities 10 to 50)
curl -s -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=mariamkaldas.com&type=MX'
# SPF and Google verification TXT must still be present
curl -s -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=mariamkaldas.com&type=TXT'
# Web records should now point at Vercel (A 76.76.21.21 / www CNAME cname.vercel-dns.com)
curl -s -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=mariamkaldas.com&type=A'
curl -s -H 'accept: application/dns-json' 'https://cloudflare-dns.com/dns-query?name=www.mariamkaldas.com&type=CNAME'
```

**Rollback:** put the original `@` A records (`185.230.63.107`, `.171`, `.186`) and the `www` CNAME (`cdn3.wixdns.net`) back
(or, for Option 2, the original nameservers `ns10.wixdns.net` and `ns11.wixdns.net`). Mail is unaffected either way
because the MX records never changed.

### Recommended additions (not required for the cutover)

| Host | Type | Value | Why |
|---|---|---|---|
| `send` (and the records Resend shows for it) | MX, TXT | Exactly as displayed in Resend after you add the domain `send.mariamkaldas.com` | Lets the contact form send from your domain with DKIM. The root SPF stays unchanged |
| `google._domainkey` | TXT | Generate in Google Admin → Apps → Google Workspace → Gmail → Authenticate email | **There is no DKIM today**, which hurts deliverability and is required for a meaningful DMARC policy |
| `_dmarc` | TXT | Start with `v=DMARC1; p=none; rua=mailto:me@mariamkaldas.com` | **There is no DMARC today.** Monitor first, tighten later |

## Project layout

```
src/app/            routes, layout, fonts, sitemap, robots, icons, api/contact
src/components/     hero, mirror, method, voyage (+controller), stories, booking embed/dialog/panel, faq, header, footer
src/content/        all copy and data: site facts, testimonials (verbatim), mirror, method, voyage, faq, about, credentials
src/lib/            contact schema/mailer/rate limit, Calendly prefill, Mirror store, SEO + JSON-LD builders
config/redirects.mjs   legacy Wix URL redirects (308), shared with the tests
scripts/            map, image, brand-asset and verification tooling
```

**Editing copy:** change the files in `src/content/` (testimonials, Mirror statements and replies, voyage chapters, FAQ,
about). Run `npm test`: the testimonials are checked sentence by sentence against the audit's verbatim record.

## Verified results (final build, `next start`, headless Chromium)

| Check | Result |
|---|---|
| `npm run lint` · `npm run typecheck` · `npm run build` | Pass, no warnings. All content routes prerender as static |
| Unit tests (`npm test`) | 32 pass |
| Browser flows (Mirror → `/book` prefill, dialog, contact form) | 21 / 21 pass, including Calendly receiving `customAnswers.a1` and the UTM tags |
| `/api/contact` security tests | 18 / 18 pass (origin, content type, injection, honeypot, timing, size, 429 + `Retry-After`) |
| WCAG AA text contrast (computed from real styles, all routes, mobile and desktop, Mirror replies and FAQ answers expanded, menu open) | 0 failures in 196 text runs on the home page and 37 to 76 on every other page |
| axe-core (desktop, all routes) | 0 violations of any severity |
| Console errors, HTTP ≥ 400, broken images (own pages) | None (the 404 page is intentional) |
| The same suites against the **live deployment** (`mariamkaldas.vercel.app`) | Audit passes (0 contrast failures, 0 axe violations); 18 / 18 applicable browser flows pass; contact endpoint answers 503 until email keys exist and 403 for cross-origin posts; LCP 280 to 604 ms on Vercel's CDN, CLS ≤ 0.002 |
| One `<h1>` per page, `lang`, description, canonical, `og:image`, valid JSON-LD | Pass on all routes |
| Hero booking CTA without scrolling | Visible at 360×640, 390×664, 390×844, 768×1024, 1280×720, 1440×900 (top edge 422 px on phones, 631 px on desktop; the old site: 1,188 px and 1,292 px, as plain text) |
| CLS | 0.000 on every page |
| Requests on first load | **30** on the home page; 27 to 31 on other pages |
| Total transfer, home page | about 410 KB (fonts 117 KB, images 30 to 86 KB, CSS 9 KB) |

**Initial JavaScript did not reach the "under 100 KB" goal, and cannot on this framework.** Measured gzipped:
**155 KB at load** and 177 KB after idle prefetching of other routes. React DOM (71 KB) plus Next's client runtime
(46.5 KB) plus the bundler runtime (4.8 KB) are about 122 KB before any site code; the site's own code and the router add
about 33 KB. What was done to keep it as small as possible: server components by default, no animation library (the
Voyage is CSS plus a 100-line scroll controller), the Calendly integration is split out and only loads on `/book` or when
the dialog opens, and `zod` is kept out of the browser bundle. Going lower would mean a different framework.

**`/book` is heavier by design** (52 to 88 requests) because Calendly's own app loads inside its iframe (about 3.5 MB of
its JavaScript on desktop). That cost is Calendly's, and no other page pays it.

## Deviations from the approved blueprint (and why)

1. **Routes follow the Phase 2 instruction:** `/testimonials` and `/faq` keep their old URLs (so no redirect is needed
   for them) instead of the blueprint's `/client-stories` and `/work-with-me#faq`. There is no `/work-with-me` page;
   team (MBTI) sessions live in the FAQ (`/faq#teams`). Redirects use `permanent: true`, which Next.js sends as **308**.
2. **No Framer Motion / `motion` package.** The hero reveal is CSS, and the Voyage is CSS plus a small scroll
   controller. This keeps the JavaScript budget as low as the framework allows and is simpler. `motion` can still be
   added later for richer choreography.
3. **Calendly account is `kaldas`**, not `mariamkaldas` (which returns 404).
4. **Nodemailer is included alongside Resend** (as requested); Resend is preferred when its key is set.
5. **Cache Components and Partial Prefetching are on**, as the scaffold generated them. They are the framework's
   direction, and the site is fully static.
6. Verified-fact corrections applied in copy: "Ikagai" (old FAQ) becomes "Ikigai"; "30 different countries" becomes
   "30+ countries"; "helped to design and establish" (her wording) is kept, never "founded"; she lives in Charleston
   (no "roots" claim); the CPCC and PCC credentials are real text, not only images; the footer email link is
   `mailto:me@mariamkaldas.com` (the old site linked `info@mysite.com`).

## Needs Mariam's approval before the live cutover

- **Bio edits** in `src/content/about.ts` and `voyage.ts` (typos fixed; "30+ countries"). The family line is hers; confirm she wants it public.
- **Draft copy written for her to rewrite:** Mirror replies, "so what" lines under each Voyage chapter, the sample questions under each method pillar, the engagement path steps.
- **Facts:** "One hour" comes from her Wix service page (confirm the Calendly event length); "Formerly U.S. Department of State"; the Voyage's "Route illustrative" arc (ports not confirmed); the exact State Department title and dates.
- **Testimonials** are first names only, verbatim, including their typos ("she's help me identify"); confirm she may publish them and wants any light copy edits. Add roles or full names with permission.
- **Credential links** point to the issuing bodies' sites. Replace with her verification pages if she has them.
- **Photos** are the two portraits from the old site (cropped). A planned photo shoot would replace them.
- **Privacy page** describes how the site actually behaves; have her review the wording.
- **Calendly:** add the first question for prefill, confirm the event length, and confirm which plan features (colors, branding) apply.

## Credits and licenses

Fonts: Newsreader, Source Sans 3 and DM Mono under the SIL Open Font License (texts in `src/app/fonts/licenses`).
Basemap: Natural Earth (public domain). Photographs and credential badges belong to Mariam Kaldas and the issuing bodies.
