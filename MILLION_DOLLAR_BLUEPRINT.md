# Million-Dollar Blueprint: mariamkaldas.com rebuild

**Status: approved and built (Phase 2).** This is the Phase 1 design document. Where the build differs from it, see the *Phase 2 as-built addendum* at the end of this file and the README's "Deviations" section.
**Companion:** `MARIAM_SITE_AUDIT.md` (evidence, verbatim copy, asset catalog). Same evidence tags: **[V]** verified in this work · **[S]** third-party source · **[E]** estimate or recommendation · **[Q]** needs Mariam's confirmation.

---

## 0. Decision summary

**Goal.** Raise perceived value and bookings for Mariam. **One metric:** complimentary chemistry sessions booked per 100 visitors. The baseline is unknown (no analytics evidence exists); Phase 0 sets it.

**Rate-limiting bottleneck (site).** Landing → booked session. Today the first booking link is a plain "here" 1,292 px down the page, three booking paths compete, and nothing is embedded. **[V]** Polish, motion and fonts do not matter until that path is fixed. That is why the build starts with a conversion vertical slice.

**Rate-limiting bottleneck (project).** Content, not code. Proof details, the offer definition, verified facts and photos all come from Mariam. Phase 0 is the critical path.

**Two corrections to the brief that change the build**

1. **Picktime does not exist on her stack.** She uses **Calendly** (plus a duplicate Wix Bookings calendar). The embed spec is therefore Calendly-first, and Cal.com is the fallback. **[V]**
2. **"Executive" positioning is ahead of her proof.** All 7 testimonials are career pivots, confidence recovery, accountability and personal growth, and none is from an executive. A premium site must feel premium *and* be believable. I recommend leading with "driven leaders at a turning point" (her own phrase) and adding "executive" language once 2+ executive or team-leader stories exist. Details in 1.3.

**Fact flags that must be fixed in copy:** "30-country voyage" is actually *students from 30+ countries*; the Scholar Ship ran 2007 and 2008 and was cancelled in 2008, so say "helped design and establish", never "founded". "Charleston roots" is unsupported; she lives there. **[V][S]**

**The plan in one paragraph.** Collapse 10 URLs (4 in nav, 6 orphaned) into **5 content pages and 2 utility pages**. Open with a hero that carries the booking CTA and the credentials in the first screen. Convert her best existing content (the reflection questions) into an interactive Mirror that pre-qualifies visitors and pre-fills the booking form. Spend all the design boldness in one place, a scroll-driven **Voyage** (Charlottesville → Thessaloniki → at sea → Zambia → D.C. → Charleston). Use one color rule, **"Brick means book,"** so the only warm-red element on the site is the booking action. Build on Next.js on Vercel, lean by design (about 25 requests instead of 150).

**Approval needed on 12 decisions (section 9), each with a recommended default.** If you say "go with your defaults," I proceed on those.

---

## 1. Positioning strategy

### 1.1 The rare blend (what no competitor can copy)

| Layer | Evidence | Source |
|---|---|---|
| **Credentials that matter** | CTI **CPCC** + ICF **PCC** + certified **MBTI** practitioner | [V] badges |
| **Institutional gravity** | U.S. Department of State, Franciscan Mission Service (associate director), a university-at-sea | [V][S] |
| **Global range** | Worked, lived and traveled in **45+ countries**; led a Zambia PR function; intercultural student affairs | [V] her claim |
| **Warm, candid voice** | "To be honest, you shouldn't [hire a coach]." · "Well, hello there. Come on in." | [V] |
| **Whole-person frame** | Spirit, mind and soul; ikigai; faith as an acknowledged fit criterion | [V] |

**Positioning statement (draft):** *Coaching for driven, purpose-led leaders at a turning point, from a Co-Active and ICF-credentialed coach who has led across 45+ countries and will tell you honestly whether she can help.*

### 1.2 Message hierarchy

Promise (go after what you actually want) → Mechanism (Co-Active, MBTI, accountability, strengths and edges) → Proof (credentials, named stories, her background) → Offer (a complimentary chemistry session) → Action (book).

### 1.3 Positioning risk (earned override)

The brief frames "high-ticket executive coaches." Her proof today supports **leaders and professionals at a turning point**, not C-suite.

- **Cost of overshooting:** executive buyers look for executive proof and find none. Her real strength (career pivots such as research → programming, post-law-school reset) self-deselects. Her current SEO keywords ("career coach", "life coach", "stuck in career") also stop matching.
- **Recommendation [E]:** lead with "driven leaders" and "next chapter." Keep a visible "career transition" section on `/work-with-me` so those searches and clients remain served. Switch to "executive" language only after 2+ executive or team-leader stories are documented. The "million-dollar" feel comes from craft, clarity and proof, not from inflated claims.

### 1.4 Ideal client (from her FAQ and testimonials)

Thoughtful, reflective, risk-willing professionals who want mission-aligned work and deep fulfillment; mid-career people changing course; leaders who meet every external deadline but not their own; high achievers who doubt the value of their expertise; people for whom spirituality is part of identity (**D2**).

### 1.5 Language rules

| Do | Don't |
|---|---|
| "Students from 30+ countries" · "helped design and establish The Scholar Ship" · "worked, lived, and traveled in 45+ countries" | "30-country voyage" · "founded the Scholar Ship" · "Charleston native" |
| Use her sentences wherever possible (they are the brand) | Generic coaching copy ("unlock your potential", "transform your life") |
| "Chemistry session" with a plain description of what happens | "Free sample session" (retire) |
| State credentials by name, linked to verification | "Certified coach" with no body named |
| Named, role-tagged proof | First names only, no context |

---

## 2. Benchmark research (Step 2 results)

### 2.1 What was inspected, and the limits

**13 sites inspected live** in headless Chromium (1440×900, scrolled to trigger lazy content): fonts loaded, platform, scroll and animation libraries, CTAs in the first viewport, nav, section sequence, request counts **[V]**. Dorie Clark was also inspected; nothing transferable.

**Not inspected, and why (no claim below relies on them):** `novusglobal.com` (a business accelerator, not the coaching firm; the coaching firm is `novus.global`, which *was* inspected), `richlitvin.com` (Cloudflare 520 on two attempts), `whitneyjohnson.com` (blank render), `dewberrycharleston.com` (parked domain), **`awwwards.com` (blocked at the egress proxy)**. Awwwards findings therefore come from one directly inspected recognized site (Kasia Siwosz) plus search listings **[S]**, not from browsing Awwwards.

### 2.2 Verified measurements

| Site | Stack [V] | First-viewport CTA(s) [V] | Display + body type [V] | Requests / JS files [V] |
|---|---|---|---|---|
| **Reboot** (reboot.io), CEO coaching | WordPress, Typeform | "WORK WITH US"; "SCHEDULE A DISCOVERY CALL" (on-load modal) | National (grotesque) + Tiempos Text (serif body) | 147 / 50 |
| **Co-Active / CTI** | WordPress, HubSpot | "GET STARTED", "CONNECT WITH US" | Arimo | 196 / 78 |
| **CCL** (ccl.org) | WordPress | "Talk to us", "Talk to an advisor" | Lora + Noto Sans | **40 / 2** |
| **Korn Ferry** | Webflow, GSAP | "Contact", "Learn More"; autoplay hero video | Gotham | 214 / 84 |
| **Marshall Goldsmith** | Wix assets | "CONTACT" only; 3-item nav (HOME, MG ADVISORS, CONTACT) | Custom display (160 px name) + Open Sans | 252 / 140 |
| **Tony Robbins** | Next.js, Shopify, HubSpot | "Start now" ×2; promo modal over hero | Suisse Int'l + **IBM Plex Mono** accent | 256 / 79 |
| **Marie Forleo** | WordPress | "Free Training" pill in nav | Ivy Presto Display + Area Normal | 268 / 63 |
| **Susan David** | WordPress, Nuxt, HubSpot | "Book", "Get Certified"; "Take the Quiz" | Manier + handwritten accent | 131 / n/a |
| **Tasha Eurich** | n/a | "BOOK TASHA"; a client testimonial *inside* the hero | protipo-wide + acumin-pro | 191 / n/a |
| **Novus Global** (novus.global) | WordPress, HubSpot | "Meet Our Coaches" | Avenir | 279 / 79 |
| **Kasia Siwosz** (Awwwards Honorable Mention, 2025-11-06 **[S]**) | **Webflow, GSAP, Lenis** | "Book your Consultation" | Satoshi + Playfair Display | **42 / 17** |
| **Kinfolk** | WordPress, **Lenis**, muted loop video | "Learn More" (subscribe) | Custom serif family + custom sans | 128 / 35 |
| **Montage Palmetto Bluff** (Lowcountry luxury) | WordPress, Mux/HLS video | "Check availability" | Above The Beyond (italic display) + Garamond Nova + Spezia | 122 / n/a |
| *mariamkaldas.com (today)* | Wix | none | Lulo Clean One + Avenir Light | **150 / 98** |

**Takeaways [V]:** the Awwwards-recognized coaching site and CCL both run on about 40 requests. Heavy is not required for "premium." Only 2 of 13 use Lenis smooth-scroll and 2 use GSAP, so scroll choreography is not required for credibility. A Wix site (Marshall Goldsmith) can serve a top-tier global coach, which means clarity and proof, not platform, drive the premium read. **No inline scheduling widget was detected on any of the 13 home pages** (the only Calendly string, in Tony Robbins' HTML, is not an on-page widget in the first viewport); they route to a conversation (modal, form, "talk to us"). That tempers the embed case; see 2.4.

### 2.3 Patterns worth borrowing

| Pattern | Seen at | How we use it |
|---|---|---|
| **Conversation-framed CTA** (not "free trial") | CCL "Talk to us"; Kasia "This starts with a real conversation"; Reboot "Schedule a discovery call" | "Chemistry session" is a conversation with a mutual fit decision. Matches her honesty |
| **Self-selection that qualifies** | Kasia: "Recognising the Signs You're Ready", "The rules"; CTI: "Not Sure Which Step is Yours?"; Susan David: "Take the Quiz" | The Mirror, plus a plain "this probably isn't for you if…" from her own FAQ |
| **Process explained *before* the ask** | Kasia: "The Consultation Process", "Your move"; Reboot: "Approach", "Philosophy in Practice" | "How we'll work together" and a real 4-step path above the booking band |
| **Authority at first glance** | CCL: title "Trusted by 2/3 of the Fortune 1000"; Forleo: "You Might Have Seen Me On"; Tasha: testimonial in the hero | Credential strip directly under the hero (CPCC, PCC, MBTI, 45+ countries) |
| **Contrast positioning line** | Novus: "Most coaching firms help you get what you want. We help you explore what you're capable of." | One sentence of this kind in the Method intro [draft] |
| **Investment transparency** | CTI: "Investment & ROI" (only 1 of 13) | Show *structure and duration*, not a price list (**D4**) |
| **Named, titled proof** | Reboot: CEO name + role beside the quote | Upgrade all testimonials (intake template, Appendix C) |
| **Manifesto headline** | Susan David: a cascading list that ends "EVERYTHING." | Informs the Mirror's typographic treatment |
| **Lowcountry vernacular and mood** | Montage Palmetto Bluff ("A Classic Southern Escape", "River to Table") | Coastal light and live-oak mood in photography; italic display used sparingly |
| **Type-led editorial restraint** | Kinfolk: one custom serif family at scale, almost no chrome | Our hero is type and one photograph |
| **Monospace as data accent** | Tony Robbins (IBM Plex Mono) | Mono only for credential codes, years and coordinates |

### 2.4 Anti-patterns observed (avoid)

Modal over the hero (Robbins, Reboot); cookie banner over the hero (Montage); a preloader reading "1%" before any content (Kasia); an 11-item nav (Reboot); autoplay-video weight (Korn Ferry); mass-market "free tools/free training" CTAs on a high-trust offer (Forleo); a CTA-less hero (Goldsmith, tolerable only because of his name recognition).

**On the embed:** the evidence that an embedded calendar beats a redirect comes **only from scheduling vendors**, with conflicting figures (2–3×, 40–60%, 35%) and no independent study **[S]**. I treat it as a **hypothesis**. The sound argument is friction: her first session is self-serve, so a calendar on the page beats form-and-wait. Plan: ship the embed on `/book`, keep phone and email fallbacks, and A/B test embed vs redirect once there is traffic (Phase 9).

### 2.5 What separates a bespoke brand site from a template (derived)

1. **One unmistakable typographic decision** (not Inter/Roboto, not the trending default). 2. **One signature interaction**, memorable and cheap. 3. **Art-directed photography** instead of stock. 4. **Copy that sounds like one person.** 5. **Restraint:** fewer sections, each with a single job. 6. **Speed:** the two most-awarded builds here are among the lightest. 7. **Named proof.** (Mostly **[E]**, anchored by the **[V]** data above.)

---

## 3. Visual and brand system: "Warm Editorial Authority and Coastal Luxury"

### 3.1 Concept: the logbook

Mariam sailed around the world on a floating university. The site reads like a well-kept log written in a warm human voice: restrained editorial type, generous margins, a hairline route, and coordinates in mono *only where the content is literally data* (credential codes, years, place coordinates). No anchors, ropes or compass roses.

**Plan review against the brief (what I changed to avoid the generic default).** My first instinct, a cream background with terracotta accent and Cormorant or Playfair headlines, is the most common "luxury coach" look, so I changed it:

- **Warm accent is function-coded, not decorative.** The brick-red appears *only* on booking actions.
- **Cool Lowcountry tint added** (haint blue, the pale blue-green of traditional porch ceilings) so the palette is Charleston-specific and evolves her existing teal instead of discarding it.
- **Headline serif is Newsreader**, not Cormorant, Playfair or Instrument Serif. Cormorant's hairlines fail at small sizes, and Playfair is already used on a recognized competitor site **[V]**.
- **The Voyage is the single bold move.** Everything else is quiet.

### 3.2 Palette (6 tokens; contrast measured)

| Token | Hex | Role | Contrast |
|---|---|---|---|
| **Alabaster** | `#F8F5EE` | Page background | n/a |
| **Oyster** | `#E8E1D2` | Alternate surface, hairlines | Navy on Oyster **11.81:1** |
| **Harbor Navy** | `#11263C` | Text, dark sections | On Alabaster **14.12:1** |
| **Haint Blue** | `#A9CFC9` | Route line, quiet washes, focus tint | Navy on Haint **9.12:1** |
| **Brass** | `#B8955A` | Hairlines and ornaments; text only on navy (**5.48:1**). For text on light use dark brass `#7C5E28` (**5.53:1**). Brass on Alabaster is only 2.58:1, so never use it for text | |
| **Brick** | `#9E3F2B` | **Booking actions only** | Alabaster on Brick **6.03:1**; hover `#8F3624` (**7.09:1**) |

Usage target **[E]:** about 60% Alabaster, 20% Navy, 10% Oyster, 5% Haint, 3% Brass, 2% Brick. Her legacy teal `#57BBBF` fails on white (2.27:1) and is retired. Haint blue preserves the recognizable family at passing contrast.

### 3.3 Typography

| Role | Face (all open-license, self-hosted) | Why |
|---|---|---|
| Display and pull quotes | **Newsreader** (Display optical size; italic for quotes) | Literary, authoritative, high-contrast at large sizes; its optical-size axis prevents thin hairlines at small sizes |
| Body and UI | **Source Sans 3** | Classic humanist sans, very legible, unlike the usual AI-default families |
| Data accents | **DM Mono**, regular only | Credential codes, years, coordinates |

**Scale (desktop; clamp for mobile):** Hero display 64–112 px, line-height about 1.0; H2 44–56; H3 30–36; lede 22–24; body **19 px / 30 px**, max **62 characters** per line; small 15; mono 13. Body text is **left-aligned** (her current justified text produces visible rivers). Optional licensed upgrade tier (e.g., a Klim or Pangram-class serif) is a budget decision (**D5**), not required.

### 3.4 Layout, shape, texture

- **Left-aligned asymmetric 12-column grid**, wide margins, one photograph per section at most.
- **Photographs have 2 px corners; the booking CTA is a pill; nothing else is rounded.** Shape encodes function.
- **No card grids and no 3-column icon rows.** Sections are editorial spreads.
- **Hairline rules (Brass at 40%) only mark chapter breaks.** Paper grain at about 3% via an inline SVG noise **[E]**.
- Dark chapters (Voyage, booking band) use Harbor Navy with Alabaster text, Haint route and Brass coordinates.

### 3.5 Imagery and art direction

Reuse **Portrait A** (tea at the stone table above the lake) and **Portrait B** (columns) from the originals (3264×2448 and 3000×2000) for launch. Commission a half-day shoot (**D6**): Charleston light, marsh and harbor plates, a candid working portrait on Zoom, a beach session. Shot list in Appendix D. No stock imagery; the six stock testimonial tiles are removed.

### 3.6 Motion (restrained, with reasons)

| Moment | What happens | Trigger |
|---|---|---|
| **Hero** | Headline lines mask-reveal (about 700 ms, 90 ms stagger); portrait fades in; runs **once** | Page load |
| **The Voyage** | Route draws as you scroll; stops light up; text swaps | Scroll (**the one memorable piece**) |
| **The Mirror** | Selected statements reveal Mariam's reply | User action |
| **Client stories** | Cards reflow when a filter is chosen | User action |
| **Everything else** | No entrance animations; link hovers change underline thickness only | n/a |

`prefers-reduced-motion`: hero static, the Voyage becomes a plain vertical timeline with the full route visible. **No smooth-scroll hijacking** (hurts accessibility and INP).

### 3.7 Guard rails (explicit "no" list)

No eyebrow label above every heading. No tracked ALL-CAPS labels. No single-word accent in headlines. No numbered markers except genuine sequences (engagement path, voyage years). No arrows appended to buttons. No gradient washes. No card kit. No modal, banner or preloader before content. No stock photography. No auto-playing media.

---

## 4. Master layout and wireframe spec

### 4.1 Homepage flow

| # | Section | Job | Conversion role |
|---|---|---|---|
| 1 | **Hero** | Say who it is for, what changes, and the one action | Primary CTA #1 |
| 2 | **Credibility strip** | Remove doubt in three seconds | Trust |
| 3 | **The Mirror** | Self-identification and pre-qualification | Micro-commitment; reveals CTA |
| 4 | **How we'll work together** | Make the offer tangible | Removes "what am I buying?" |
| 5 | **The Voyage** | Differentiate through story | Memorability, authority |
| 6 | **Client stories** (3 featured + link) | Social proof, filterable | Trust |
| 7 | **Booking band** | Convert, with phone and email fallback | Primary CTA #2 |
| 8 | **FAQ (4) + footer** | Last objections, contact | Fallback conversion |

**Global chrome:** sticky header with wordmark left; Work with me, About, Client stories, FAQ; and the **brick pill** "Book a chemistry session" at the right (a shortened label to fit; the hero and band use "Book a complimentary chemistry session"). On mobile the pill stays in the header; no bottom bar or popup.

### 4.2 Hero

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Mariam Kaldas        Work with me  About  Client stories  FAQ  (Book a chemistry session) │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                         ┌────────────────────┐ │
│  You meet every deadline                                │                    │ │
│  except your own.            ← Newsreader Display       │     PORTRAIT       │ │
│                                                         │  tall crop, bleeds │ │
│  Coaching for driven leaders ready to go after          │  to right edge     │ │
│  what they actually want. Co-Active, MBTI and           │                    │ │
│  honest straight talk, in Charleston and over           │                    │ │
│  Zoom, wherever you are.                                │                    │ │
│                                                         │                    │ │
│  ( Book a complimentary chemistry session )  ← brick    │  Charleston, SC    │ │
│  See if this is for you          ← text link to Mirror  └ 32.78°N 79.93°W ───┘ │
│  Sixty minutes. No obligation. An honest answer.  [Q]                           │
├──────────────────────────────────────────────────────────────────────────────┤
│ CPCC  Certified Co-Active® Professional Coach      PCC  ICF Professional Certified Coach │
│ MBTI® Certified Practitioner     45+ countries     Formerly U.S. Department of State [Q]│
└──────────────────────────────────────────────────────────────────────────────┘
Mobile: header (wordmark + pill) → portrait 4:5 → headline → CTA → strip. CTA visible without scrolling.
```

**Headline options** (**D8**): **A** "You meet every deadline except your own." (her question, sharpened; recommended) · **B** "Lead the next chapter you keep planning." · **C** "Your expertise is real. Your next step should feel that way too." Run A first; B as the A/B challenger.

**Acceptance (measurable):** booking CTA top edge ≤ **560 px** on a 390-px phone and ≤ **700 px** on a 1440-px desktop (today: 1,188 and 1,292, plain text). One real `<h1>`. Hero image ≤ about 150 KB **[E]**. No overlays.

### 4.3 Credibility strip

Five separate items with hairline separators (not middle-dot strings); codes (CPCC, PCC) in mono. Each credential links to its verification page (**[Q]** badge URLs; the CPCC badge looks like a digital credential). Institutional names appear as plain text, not logos, to avoid implied endorsement.

### 4.4 The Mirror ("Who I work with")

Her seven questions become first-person statements the visitor taps. Wording is hers, minimally rephrased **[Q]**.

```
Does any of this sound like you?                        Tap the ones that do.
 ┌─────────────────────────────────────────────────────────────────────────┐
 │ ( ) I'm a driven leader and I want my work to make an impact.            │
 │ (x) I meet every external deadline. The ones I set for myself keep slipping.│ ← selected: Mariam's reply fades in below
 │       "Then your calendar isn't the problem. Let's find what is."  [draft] │
 │ ( ) I'm playful and I have a great sense of humor.                       │
 │ ( ) I've been dreaming about my next steps and don't know how to get there.│
 │ ( ) Even with all I've accomplished, I struggle to see how talented I am.│
 │ ( ) I doubt the value of my expertise.                                   │
 │ ( ) I'm a little scared to go after what I really want for myself.       │
 └─────────────────────────────────────────────────────────────────────────┘
 0 selected: "Tap the ones that sound like you."
 1–2: "That's a start. Here's what a chemistry session is like."   3+: "You're in good company. Let's talk."
 (Book a complimentary chemistry session)         This probably isn't for you if you're not ready to
                                                  take on challenges, set goals, and follow through.
```

**Funnel link:** selected statements are saved to `sessionStorage` (not the URL, because they are self-disclosures) and **pre-fill the booking form's "What brought you here?" question**. Calendly supports prefill and custom answers `a1` to `a10`, mapped by question order **[S]**. Mariam arrives knowing the client's themes. Needs one custom question on the event type **[Q]**. Accessibility: checkbox pattern, keyboard operable, replies announced politely.

### 4.5 How we'll work together (method)

Four ideas shown as a sticky left heading and four stacked right-hand entries. They are **not numbered** because they are not a sequence. Each has a large serif phrase, two sentences, a sample session question, and one proof fragment. Pillars are proposed from her own materials and testimonials **[Q]**:

| Pillar | Basis | Proof fragment (verbatim) |
|---|---|---|
| **Co-Active, whole-person coaching** | CTI's cornerstones, including "people are naturally creative, resourceful, and whole" **[S]** | "view myself as I am and acknowledge all the parts of myself" (Kevin C.) |
| **Know your type (MBTI)** | Certified practitioner; MBTI team service | "Increased awareness of strengths, challenges, and blind spots" (service page) |
| **Accountability with heart** | Monica; Reuschal's assigned projects | "taking a holistic approach to caring for me as a person" (Monica) |
| **Strengths first, then growth edges** | Indy; Josh | "focusing on both strengths and areas of growth" (Indy) |

Beneath them, **where we meet:** Zoom or phone worldwide, and in person around Charleston, "on the beach" (her words). **The engagement path is numbered because it is a real sequence:** 1 chemistry session (an honest decision on fit, by both) → 2 kickoff, with MBTI if wanted → 3 coaching cycle (cadence, length **[Q]**) → 4 review and renew. Investment structure per **D4**.

### 4.6 The Voyage (global narrative; the signature moment)

```
┌─ dark chapter (Harbor Navy), ~500vh tall, sticky stage 100vh ────────────────────┐
│  LEFT (text swaps)                      RIGHT (SVG stage, aria-hidden)           │
│  Thessaloniki, Greece                   simplified world basemap, Oyster tint    │
│  Turned down the tutoring-center offer  Haint-blue route draws stop by stop      │
│  for a Director of Student Life job.    Brass mono: 40.64°N 22.94°E   year [Q]   │
│  "…so what for you" line  [draft]       current stop pulses once on arrival      │
│  ───────────────────────────────                                                  │
│  progress: 7 stops; counter ends at "45+ countries"                              │
└──────────────────────────────────────────────────────────────────────────────────┘
Mobile: map sticks to the top 40vh, text scrolls beneath. Reduced motion: static vertical timeline, full route visible.
```

| Stop | Verbatim anchor line (from her bio) | Coordinates (decor; city-level where known) |
|---|---|---|
| Charlottesville, VA | "ditched my business major at the University of Virginia" | 38.03°N 78.48°W |
| Thessaloniki, Greece | "Director of Student Life at an agricultural college in Thessaloniki, Greece" | 40.64°N 22.94°E |
| College Park, MD | "University of Maryland to study Higher Education and Student Affairs" | 38.99°N 76.94°W |
| At sea | "helped to design and establish a university-at-sea program called The Scholar Ship" | Illustrative arc; label only ports Mariam confirms **[Q]** |
| Zambia | "Public Relations Manager for the Coptic Orthodox Church" | Country-level (about 13°S 28°E) |
| Washington, D.C. | "Associate Director of Franciscan Mission Service" and the State Department role | 38.90°N 77.04°W |
| Charleston, SC | "We are living out our dream in Charleston, SC." | 32.78°N 79.93°W |

**Rule:** each stop ends with one "so what for you" sentence in Mariam's voice, so the story converts into client value (drafts in Appendix A). **Fact controls:** "30+ countries"; "helped design and establish"; do not draw ship ports she hasn't confirmed. **Engineering:** inline SVG of a simplified public-domain basemap (about 15–25 KB **[E]**), progress via `useScroll`, no map tiles, no WebGL, hydrated only when near the viewport. DOM order is real headings and paragraphs, with a "skip the journey" link.

### 4.7 Client stories (the proof engine)

```
What clients say changed                              (filters = toggle buttons, keyboard operable)
 ┌ sticky ───────────┐   ┌──────────────────────────────┐ ┌────────────────────────┐
 │ All             7 │   │ “…changed the way I interact │ │ “Coaching has been a   │
 │ Leadership      3 │   │ with my teammates.”          │ │ game changer for my    │
 │   breakthrough    │   │ Reuschal, [role, company? Q] │ │ career.”               │
 │ Career pivot    3 │   │ tags: Leadership, Career     │ │ Reuschal               │
 │ Mindset shift   5 │   │ [ Read the full story ]      │ └────────────────────────┘
 │ Accountability  1 │   └──────────────────────────────┘   (cards of varying height; filter
 └───────────────────┘                                        change = layout animation)
```

- **Inline expand**, not lightbox. Cards use verbatim pull-quotes (bank in Appendix B).
- **Taxonomy (as inventoried):** Mindset shift 5 · Career pivot 3 · Leadership breakthrough 3 · Personal accountability 1. Accountability is thin; collect 2 to 3 more before showing that filter prominently.
- **Data model** (typed content file): `id, firstName, fullName?, descriptor?, tags[], pullQuote, fullQuote, outcome?, photo?, consent{given,date}`.
- **Rules:** no stock images; no invented roles (show first name only until Mariam supplies descriptors); no `Review` or `AggregateRating` schema (self-serving reviews are not eligible for rich results **[E]**); video slot reserved.
- Home shows 3 featured stories (one per top theme) and a link to `/client-stories`.

### 4.8 Booking band and `/book` (the funnel)

**Decision [E]: all CTAs go to `/book`, an internal, prefetched page. One embed in one place** (fewer failure surfaces than a popup plus inline plus page).

```
/book
┌────────────────────────────────────────────────────────────────────────────┐
│ Let's find out if we're a fit.             ┌───────────────────────────────┐│
│ (her line, from the service page)          │  Calendly inline embed        ││
│                                            │  min-height 720, lazy-loaded  ││
│ What happens in the hour                   │  prefilled from the Mirror    ││
│  You bring the topic.                      │                               ││
│  I ask questions you haven't been asked.   └───────────────────────────────┘│
│  We both decide whether this is a fit.     (skeleton while loading; if the  │
│                                             script fails, a plain link shows)│
│ Prefer to talk first?  Call or text (843) 936-1601  ·  me@mariamkaldas.com  │
│ Not ready to book, or asking about teams and MBTI?  Send a note (form)      │
└────────────────────────────────────────────────────────────────────────────┘
```

- **After booking:** listen for `calendly.event_scheduled` **[S]** (needs the inline widget script, not a bare iframe), show "You're booked. Here's how to get the most from our hour," and fire the conversion event.
- **One source of truth for availability.** Retire the Wix Bookings calendar and 301 its URLs to `/book`. Confirm Calendly plan features (branding, redirects, styling) **[Q]**. If they block the design, switch to Cal.com (**D3**).
- **Tracking plan:** Appendix E.

### 4.9 FAQ and footer

Four answers from her FAQ, retaining her voice, merged into `/work-with-me#faq`. Candidate additions, each needing Mariam's answer **[Q]**: "What happens in the chemistry session?" · "How long do clients usually work with you?" · "Is coaching therapy?" · "Do you work with teams?" Footer: phone, email, booking CTA, "Kaldas Consulting, LLC," credential verification links, privacy link, "© 2026."

### 4.10 Supporting pages

| Page | Contents |
|---|---|
| `/work-with-me` | Offer, method detail, engagement path, investment structure, career-transition section, teams and MBTI (`#teams`), FAQ (`#faq`) |
| `/about` | Long-form story set in serif with pull-quotes; credentials ledger with verification links; photo set; signature |
| `/client-stories` | Full proof engine (filters, inline expand, video slot) |
| `/book` | The funnel (4.8) |
| `/privacy`, `/thank-you` (noindex), `404` | Utility. 404 copy: "That page isn't here. Try the home page or book a session." |

---

## 5. Information architecture, SEO and migration

### 5.1 Sitemap

`/` · `/work-with-me` · `/about` · `/client-stories` · `/book` · `/privacy` · `/thank-you`. There is no Events page, no standalone FAQ or Contact page (folded in), and no duplicate services pages.

### 5.2 301 redirect map (old Wix → new)

| Old URL | New |
|---|---|
| `/more-about-me` | `/about` |
| `/faq` | `/work-with-me#faq` |
| `/testimonials` | `/client-stories` |
| `/services` | `/work-with-me` |
| `/service-page/free-sample-coaching-session` | `/book` |
| `/service-page/myers-briggs-team-facilitation` | `/work-with-me#teams` |
| `/booking-calendar/*` | `/book` |
| `/events-page` | `/` |
| `/events-1/seven-principles-for-making-marriage-work` | `/` |

Test every row in CI (Playwright asserts status 301 and destination).

### 5.3 SEO, metadata and structured data

- **Per-page titles and descriptions** (drafts): Home "Mariam Kaldas | Leadership Coach in Charleston, SC and Worldwide"; Work with me "Co-Active Coaching for Driven Leaders | Mariam Kaldas"; About "About Mariam Kaldas: CPCC, PCC, MBTI Practitioner"; Book "Book a Complimentary Chemistry Session | Mariam Kaldas".
- **Keyword coverage:** target "leadership coach Charleston", "Co-Active coach", "virtual leadership coach", and keep "career transition coach" via the `/work-with-me` section. This retains the intents her current keywords chase.
- **Schema (JSON-LD generated from content files; replaces Wix's auto-generated `LocalBusiness` and `WebSite` blocks):** `Person` (credentials via `hasCredential`; `alternateName` if approved **[Q]**), `ProfessionalService` (Charleston, SC; `areaServed` worldwide online), `WebSite`, `FAQPage` (machine-readable only; Google limited FAQ rich results in 2023 **[E]**).
- **Open Graph and Twitter:** per-page images generated at build with Newsreader.
- **Search Console continuity:** the Wix home page carries a `google-site-verification` meta tag. Re-emit it in the new metadata so ownership survives the cutover, and keep the existing Google Workspace verification TXT record in DNS.
- **Local:** Google Business Profile as a service-area business **[Q]**. Keep name, address, phone consistent.

### 5.4 DNS and email cutover (highest-risk step)

**Verified current state [V]:** nameservers `ns10.wixdns.net` and `ns11.wixdns.net`; MX at Google Workspace (`aspmx.l.google.com` priority 10, alt1–alt4 at 20–50); SPF `v=spf1 include:_spf.google.com ~all`; apex A records at Wix (`185.230.63.x`); apex 301s to `www`. **A careless change breaks `me@mariamkaldas.com`.**

**Pre-flight (all before any change)**
1. Export or screenshot every DNS record in the Wix dashboard. Confirm the **registrar, renewal date and domain lock** **[Q]**.
2. Check DKIM and DMARC state, and lower TTLs 24 to 48 h ahead.
3. Create the Vercel project and add apex and `www` domains. Verify the full site on the preview URL.
4. Verify Resend with a **sending subdomain** (DKIM, SPF, return-path records); the root SPF stays as is **[E, validate at setup]**.

**Cutover options.** Wix may lock the default apex and `www` records while the domain is connected to a Wix site **[E, verify in her dashboard]**.
- **Option 1:** edit the A and CNAME records in Wix DNS to Vercel's values (read them from the Vercel dashboard at the time; do not hardcode).
- **Option 2:** move nameservers to a DNS host (Vercel or Cloudflare) **after pre-replicating every MX, TXT and CNAME record**, and query the new nameservers directly before switching.
- **Recommended:** Option 1 if Wix allows it (fewest moving parts). Otherwise Option 2.

**Verification and rollback**
- Test apex and `www` (200, TLS, canonical 301), the redirect table, and **send and receive test emails on me@ (both directions)**.
- Keep the Wix site published for **30+ days**. Do **not** cancel the Wix plan or let a Wix-registered domain lapse until the domain is confirmed safe elsewhere.
- Rollback = restore the Wix A, CNAME or NS values captured in pre-flight.

---

## 6. Tech stack and architecture

| Layer | Choice | Why | Rejected alternative |
|---|---|---|---|
| Framework | **Next.js (App Router) + TypeScript**, static generation; client components only for the Mirror, Voyage, stories filter and booking loader | Specified; static pages; Vercel-native | Astro would ship less JS by default; the gap is small if client islands stay limited **[E]** |
| Styling | **Tailwind CSS**, tokens as CSS variables | Specified; tokens in section 3 | n/a |
| Motion | **Framer Motion** (now the `motion` package; confirm at install) using `LazyMotion`, `m` and `useScroll` | Covers hero reveal, scroll-scrubbed route and layout animation | GSAP (more than needed); **Lenis rejected** (scroll hijack, a11y, INP) |
| Content | Typed TS or MDX files in the repo (testimonials, voyage stops, FAQ); one source feeds UI and JSON-LD | No CMS means no database, auth or cost | CMS (Keystatic) **deferred** until she wants to self-edit |
| Booking | **Calendly inline embed** on `/book`, with fallbacks | Already in use; zero migration | Cal.com if the plan blocks the design; Picktime is not in use |
| Email | **Resend** via a Next route handler; Zod validation; `Reply-To` = visitor; delivered to `me@mariamkaldas.com` | Transactional, DKIM-signed | Nodemailer via Gmail SMTP: app-password fragility, weaker deliverability |
| Anti-spam | Honeypot + minimum-time check; Turnstile only if spam appears | Delete before add | CAPTCHA by default |
| Hosting | **Vercel** via GitHub integration (no project exists yet **[V]**); preview per PR | Specified | n/a |
| Analytics | **Cookieless** (Vercel Web Analytics or Plausible), custom events | No consent banner on the hero **[E]** | GA4 (consent and weight) |
| Fonts | `next/font` self-hosted Newsreader, Source Sans 3, DM Mono | No third-party request; open license | Wix fonts are not portable |
| Images | `next/image`, AVIF/WebP, originals from Mariam | Hero at about 150 KB **[E]** | n/a |
| Map | Simplified SVG basemap (public-domain Natural Earth), no tiles | No API key, tiny | Mapbox or Leaflet (heavy) |
| Quality | Playwright (e2e and screenshots), axe-core, Lighthouse CI budgets in GitHub Actions | Budgets enforced, not hoped for | n/a |

**Budgets (targets [E], set by me; current values measured):**

| Metric | Today (Home) | Target |
|---|---|---|
| Requests | 150 | ≤ 25 |
| JavaScript | about 3.3 MB decoded, 98 files | ≤ about 170 KB gzipped first load; the Calendly script loads only on `/book` |
| Core Web Vitals (Google "good") | not reliably measurable in this environment | LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 (p75, mobile) |
| Lighthouse (mobile) | n/a | Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 |

Units differ (decoded vs gzipped); the target is an order-of-magnitude improvement, not a like-for-like claim.

**Accessibility (WCAG 2.2 AA):** a real `<h1>` per page; all palette pairs pass (section 3.2); visible focus rings; targets ≥ 44 px; labeled form fields; skip link; landmarks; reduced-motion honored; Mirror, filters and Voyage fully keyboard-operable.

**Security and privacy:** security headers and a CSP allowing only the Calendly origin for frames and script; no PII stored (messages go to email only); the contact route is rate-limited; privacy page covers Resend and Calendly processing; remove the published personal Zoom room URL.

**Repo layout (planned):** `app/` (routes, route handlers) · `components/` · `content/` (typed data) · `lib/` (schema, analytics, tokens) · `public/` (optimized assets) · `tests/` (Playwright, axe) · `.github/workflows/` (CI, Lighthouse CI).

---

## 7. Phased build roadmap

Sizing is relative **[E]**: S = under a day, M = a few days, L = one to two weeks of focused work.

| Phase | Deliverable | Size | Exit criteria (testable) |
|---|---|---|---|
| **0. Intake and decisions** *(critical path)* | Answers to D1–D12; Mariam's questionnaire (audit §7); original photos; testimonial permissions; badge URLs; Wix Analytics screenshot; registrar and DNS access | M (waiting on people) | Facts ledger has **zero [Q]** on any claim that will be published |
| **1. Foundation** | Next.js scaffold, tokens, fonts, shell (header and footer), CI (lint, types, Playwright, axe, Lighthouse CI), Vercel project linked to GitHub, preview URL | M | CI green; preview live; shell Lighthouse ≥ 95 |
| **2. Conversion vertical slice** *(execute now after Phase 0)* | Hero, credibility strip, `/book` with Calendly embed and fallbacks, contact API (Resend), event tracking | M | CTA ≤ 560 px on 390-px viewport; a test booking completes end to end; test message arrives with DKIM pass; zero console errors |
| **3. Mirror, method, work with me** | Mirror with sessionStorage → Calendly prefill; method spread; `/work-with-me` with FAQ | M | Prefill verified in the live embed; axe has no serious issues; copy approved |
| **4. Voyage and About** | Scroll-scrubbed route; static fallback; long-form About | L | Smooth on a mid-range phone **[E]**; reduced-motion fallback verified; Voyage JS within budget |
| **5. Client stories engine** | Filterable inline-expand stories; data model; consent log | M | Keyboard operable; ≥ 7 stories; consent recorded for each |
| **6. SEO, schema, analytics, redirects** | Metadata, JSON-LD, OG images, sitemap and robots, Search Console token, redirect map | S–M | Rich Results Test passes; 100% redirect tests pass |
| **7. QA and hardening** | Safari iOS, Chrome, Firefox; screen-reader pass; proofreading; 404 and 500 pages; rate-limit test | M | No blocker issues; budgets met |
| **8. Cutover and monitoring** | DNS and email plan (§5.4); 24 h, 7 d and 30 d checklists | S | Mail verified both directions; 301 map live; Search Console clean |
| **9. Optimize** | A/B hero headline; embed vs redirect; more stories; Business Profile | ongoing | Decisions made from measured conversion, not opinion |

**Why this order:** it ships the biggest conversion fix first (Phase 2) and keeps the signature moment (Phase 4) from blocking launch.

**After you approve this blueprint**, the next step is a detailed implementation plan (per-task steps) before any code, as the process requires.

---

## 8. Triage and risk

### 8.1 Triage (leverage = systemic impact ÷ time × complexity × upkeep)

| Class | Items |
|---|---|
| **DROP** | Events page and the 2023 marriage workshop · Wix Bookings duplicate · stock testimonial tiles · "IMPACT" billboard and sky gradient · justified body text · Dancing Script and Lulo fonts · "free sample" naming · standalone FAQ and Contact pages · lightbox · published Zoom URL · smooth-scroll hijacking |
| **AUTOMATE / TEMPLATIZE** | Testimonial intake form → typed content entries · JSON-LD generated from content · OG images · Calendly `event_scheduled` → analytics · redirect map as a tested table · contact route → Resend |
| **DEFER** | Blog and newsletter (until 90+ days after launch) · CMS (until she asks to self-edit) · A/B tooling (until baseline traffic is known) · video testimonials (start collecting now, publish when ready) · corporate MBTI landing page · multilingual |
| **EXECUTE NOW** (after approval) | Phase 0 intake, then the Phase 2 vertical slice (hero + credentials + `/book` embed + contact route) |

### 8.2 Risk register

| # | Risk | Mitigation |
|---|---|---|
| R1 | Inaccurate claims (Scholar Ship counts, titles) damage trust | Facts ledger; use her exact wording; she signs off |
| R2 | **Email outage at DNS cutover** | Never touch MX; pre-replicate records; low TTL; two-way mail tests; rollback values saved |
| R3 | Positioning ahead of proof | **D1**; add "executive" language only with evidence |
| R4 | Testimonial consent and detail gaps | Intake template (Appendix C); first names only until approved |
| R5 | Photo rights and quality | Collect originals; schedule the shoot (**D6**) |
| R6 | Calendly plan limits (branding, redirects, styling) | Verify plan in Phase 0; Cal.com fallback |
| R7 | Animation scope creep hurts speed and accessibility | One signature moment; budgets enforced in CI |
| R8 | Content arrives late | Questionnaire now; ship the vertical slice with minimal content first |
| R9 | SEO dip after migration | Tested redirect map; preserve keyword intents; Search Console token |
| R10 | Faith visibility misjudged (alienates or dilutes) | **D2** decided explicitly |
| R11 | Domain or email lost via Wix cancellation | Confirm registrar; keep Wix 30+ days |
| R12 | Privacy leaks (Zoom URL, personal alt text, family photos) | Remove; her approval on any family content |

---

## 9. Decisions needed from you (recommended defaults first)

| # | Decision | Recommended default | If you don't answer |
|---|---|---|---|
| **D1** | Positioning scope | "Driven leaders at a turning point"; "executive" only once proof exists | I proceed with this |
| **D2** | Visibility of faith | Whole-person, values-led, with faith visible and inclusive (e.g., on About and one FAQ), not in the hero | Same |
| **D3** | Booking platform | **Stay on Calendly**; Cal.com only if the plan blocks the design | Calendly |
| **D4** | Pricing visibility | No public price; show structure and typical duration (if Mariam confirms) | No price shown |
| **D5** | Typefaces | Free tier: Newsreader + Source Sans 3 + DM Mono | Free tier |
| **D6** | Photography | Launch with existing portraits; commission a half-day shoot after launch | Same |
| **D7** | Offer name | "Complimentary chemistry session" (retire "free sample") | Rename |
| **D8** | Hero headline | Option A, with B as the A/B challenger | A |
| **D9** | DNS approach | Option 1 (edit A and CNAME) if Wix allows, else Option 2 | Decide in Phase 8 with her dashboard |
| **D10** | Who edits content later | You or me via the repo at first; consider Keystatic later | Defer the CMS |
| **D11** | Analytics | Cookieless (Vercel Web Analytics or Plausible) | Vercel Web Analytics |
| **D12** | MBTI team facilitation | Keep as a secondary section on `/work-with-me` | Keep |

---

## Appendix A: Copy deck v0 (draft; Mariam rewrites in her voice)

| Slot | Draft |
|---|---|
| Hero H1 | You meet every deadline except your own. |
| Hero sub | Coaching for driven leaders ready to go after what they actually want. Co-Active, MBTI and honest straight talk, in Charleston and over Zoom, wherever you are. |
| Primary CTA | Book a complimentary chemistry session |
| Secondary | See if this is for you |
| Reassurance | Sixty minutes. No obligation. An honest answer about fit. **[Q: duration]** |
| Mirror title | Does any of this sound like you? Tap the ones that do. |
| Mirror reply examples | "Then your calendar isn't the problem. Let's find what is." · "Doubting your expertise usually means you've outgrown how you describe it." |
| Method intro | Most coaching helps you get what you want. I help you find out what you actually want, and then hold you to it. |
| Pillar 1 | Co-Active coaching. The model I trained in starts from one belief: you are naturally creative, resourceful, and whole. My job isn't to fix you. It's to ask what you haven't been asked. |
| Pillar 2 | Know your type. As a certified MBTI practitioner, I give you language for how you lead, decide and get stuck, and, if you want, how your team does too. |
| Pillar 3 | Accountability with heart. You leave each session with commitments you chose. We check in on them, kindly, without letting you off the hook. |
| Pillar 4 | Strengths first, growth edges next. Real change uses what's already strong while working the edge. We do both. |
| Voyage "so what" lines (examples) | Thessaloniki: Leading in a language I didn't speak taught me how people really change. · At sea: Thirty-plus nationalities in one place teach you fast that there is no single way to lead. |
| Booking H1 | Let's find out if we're a fit. |
| Booking confirmation | You're booked. Here's how to get the most from our hour. |
| Form success | Sent. I read every message and reply within **[one business day, Q]**. |
| Form error | That didn't send. Check the email address, or write to me@mariamkaldas.com directly. |

## Appendix B: Pull-quote bank (verbatim fragments from published testimonials)

> Mariam is a sentient person, who can ask me questions that force me to really think about myself

*Kevin C. Tag: Mindset shift*

> She helped me reframe my point of view to take that experience into my next chapter of life

*Indy. Tags: Career pivot, Mindset shift*

> Coaching has been a game changer for my career.

*Reuschal. Tags: Career pivot, Mindset shift*

> She's changed the way that I work, changed the way I interact with my teammates

*Reuschal. Tag: Leadership breakthrough*

> taking a holistic approach to caring for me as a person

*Monica. Tag: Personal accountability*

> Mariam's coaching was instrumental to my success in moving on with my new career.

*Dan. Tag: Career pivot*

> Mariam is a master at uncovering areas that need growth, while at the same time highlighting and encouraging strengths.

*Josh. Tag: Leadership breakthrough*

> It helped me realise what my strengths are, face my weaknesses, and look at opportunities without fear or hesitation.

*Margarita. Tag: Mindset shift*

> I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months.

*Margarita. Tag: Leadership breakthrough*

## Appendix C: Testimonial intake template (send to each client)

1. Full name as you'd like it shown (or "first name and last initial"). 2. Role and organization, or a descriptor you're comfortable with (for example, "software developer, former researcher"). 3. Headshot (optional). 4. What was the situation before we worked together? 5. What changed, in one concrete sentence (a decision, a launch, a role change, a habit)? 6. Dates we worked together. 7. Permission to publish the above on mariamkaldas.com: yes / no, and whether you'd record a 60-second video. 8. Anything you would like removed or kept private.

## Appendix D: Photography shot list (half-day, Charleston)

Environmental portrait (editorial, tall crop, room for text) · working portrait on Zoom (over-the-shoulder, warm light) · beach session, two people walking, candid · tea and notebook details · marsh and harbor landscape plates at golden hour · tight headshot for schema and Open Graph · a signature on paper (for the About page) · at least two vertical and two horizontal variants of each hero candidate.

## Appendix E: Analytics events

| Event | Fires when | Properties |
|---|---|---|
| `cta_click` | Any booking CTA clicked | `location` (header, hero, mirror, band, footer) |
| `mirror_select` | A statement toggled | `index`, `count` |
| `book_view` | `/book` embed enters viewport | `source` |
| `book_scheduled` | `calendly.event_scheduled` | `source`, `prefilled` (boolean) |
| `contact_submit` | Form accepted | `topic` |
| `story_filter` | Proof filter chosen | `tag` |
| `voyage_complete` | Final stop reached | none |

**KPI:** booked ÷ unique visitors, plus CTA click-through by location. Baseline comes from a Wix Analytics export (Phase 0).

## Appendix F: Sources

- Inspected live in this work: [reboot.io](https://www.reboot.io/) · [coactive.com](https://www.coactive.com/) · [ccl.org](https://www.ccl.org/) · [kornferry.com](https://www.kornferry.com/) · [marshallgoldsmith.com](https://www.marshallgoldsmith.com/) · [tonyrobbins.com](https://www.tonyrobbins.com/) · [marieforleo.com](https://www.marieforleo.com/) · [susandavid.com](https://susandavid.com/) · [tashaeurich.com](https://tashaeurich.com/) · [novus.global](https://novus.global/) · [kasiasiwosz.com](https://kasiasiwosz.com/) · [kinfolk.com](https://www.kinfolk.com/) · [Montage Palmetto Bluff](https://www.montagehotels.com/palmettobluff/)
- Awwwards (via search results, not browsed): [Kasia Siwosz, Coaching for Leaders (Honorable Mention)](https://www.awwwards.com/sites/kasia-siwosz-coaching-for-leaders) · [Happybase (Site of the Day, 2024)](https://www.awwwards.com/sites/happybase)
- Co-Active cornerstones: [coactive.com/what-is-co-active](https://coactive.com/what-is-co-active/)
- Calendly: [Advanced embed for developers](https://calendly.com/help/advanced-calendly-embed-for-developers) · [Pre-fill invitee information](https://calendly.com/help/how-to-pre-fill-invitee-information-in-an-embed)
- Embedded-booking claims (vendor sources, unverified multipliers): [Cal.com](https://cal.com/blog/best-embed-scheduling-widget) · [SchedulingKit](https://schedulingkit.com/blog/how-to-embed-scheduling-on-website) · [CozyCal](https://www.cozycal.com/blog/embed-schedulings-software-on-websites)
- Background verification: [Wikipedia: The Scholar Ship](https://en.wikipedia.org/wiki/The_Scholar_Ship) · [FMS 2012 profile](https://franciscanmissionservice.org/2012/04/national-volunteer-month-profile-mariam-in-dc/) · [FMS 2014 post](https://franciscanmissionservice.org/2014/12/bonds-of-friendship/) · [ICF PCC requirements](https://coachingfederation.org/credentialing/icf-credentials-overview/pcc/)

---

## Phase 2 as-built addendum (2026-11-24)

Approved decisions D1 to D4 and D8 were applied as written. Where the build differs from the plan above:

| Plan | As built | Why |
|---|---|---|
| Routes `/work-with-me`, `/client-stories`; FAQ folded into `/work-with-me#faq` (sections 4.10, 5.1, 5.2) | Routes `/about`, `/testimonials`, `/faq`, `/book`, `/privacy`. Team (MBTI) sessions answered in `/faq#teams` | The Phase 2 instruction named these four subpages, and `/testimonials` and `/faq` need no redirect because they keep their old URLs |
| Redirect map with 301 (5.2) | Same intent, adjusted for the routes above, sent as **308** (`config/redirects.mjs`) | Next.js sends `permanent: true` as 308, which search engines treat as permanent |
| Calendly at `calendly.com/mariamkaldas` (decision D3 as written) | `calendly.com/kaldas/sample` | `/mariamkaldas` returns 404; `/kaldas` and `/kaldas/sample` return 200 |
| `motion` (Framer Motion) with `useScroll` (section 6) | CSS plus a ~100-line scroll controller; no animation library | Keeps the JavaScript budget as low as the framework allows; same visual result |
| Voyage with 7 stops incl. College Park (4.6) | 6 stops as listed in the Phase 2 instruction; the University of Maryland is told within the Thessaloniki and Scholar Ship chapters | Matches the requested route; avoids stacked markers (Washington and College Park are about 15 km apart) |
| Nodemailer rejected in favor of Resend (section 6) | Resend preferred, Nodemailer SMTP as a fallback provider | Both were requested; provider chosen by environment variables |
| Initial JS budget "about 170 KB gzipped" (section 6) | **155 KB at load, 177 KB after idle prefetch** | Framework floor (React DOM plus Next runtime) is about 122 KB; see the README for the breakdown and why a sub-100 KB figure is not reachable on Next.js |

New findings recorded during the build: the domain has **no DKIM and no DMARC** record today (see the README DNS section),
and Calendly delivers prefill to the embed by `postMessage`, not in the iframe URL.
