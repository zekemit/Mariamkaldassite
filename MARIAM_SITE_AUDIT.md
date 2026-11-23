# Mariam Kaldas: Site Audit (Phase 1)

**Audited:** `https://www.mariamkaldas.com` (Wix) · **Audit date:** 2026-11-23 · **Status:** Discovery only. No application code has been written.

**Evidence tags used throughout**

| Tag | Meaning |
|---|---|
| **[V]** | Verified directly in this audit (live fetch, headless-browser measurement, DNS lookup) |
| **[S]** | Corroborated by a third-party source (linked in the Sources appendix) |
| **[E]** | Estimate, inference, or recommendation. Treat as a hypothesis |
| **[Q]** | Needs confirmation from Mariam before it is published anywhere |

**Measurement caveat.** Performance numbers come from headless Chromium in a datacenter container behind an egress proxy. Byte counts are *decoded* sizes. They are good for comparing pages and for order-of-magnitude conclusions, and they are not a Lighthouse score.

---

## 0. Top findings (read this first)

**The rate-limiting bottleneck is the path from landing to a booked session.** Everything else is secondary. Evidence:

1. **There is no booking CTA in the first screen**, on desktop or mobile. The first "book" link is a plain inline text link reading **"here"**, sitting **1,292 px down on desktop** and **1,188 px down on mobile (about two screens)**. On mobile, the only *text* link in the first 844 px is an *outbound* link to CTI (the logo, the menu button and a floating action button are the only other tappable elements). **[V]**
2. **Three overlapping booking paths exist** and none is embedded: the Calendly profile (`calendly.com/kaldas`), a specific Calendly event (`/kaldas/sample`), and a live Wix Bookings calendar (`/booking-calendar/free-sample-coaching-session`) that showed real open slots when tested. The home page links to the generic Calendly profile, while the FAQ links to the specific event. **[V]**
3. **The hero is partly broken.** The hero overlay image (`f84b2094…jpg`) returns **HTTP 403** (for both curl and headless Chromium through this environment's proxy; confirm once in a normal browser) and renders as a broken-image icon on mobile. The hero subline (`#74F9FF` on sky blue) has a measured contrast of **1.11:1** (WCAG needs 4.5:1, or 3:1 for large text), so it is effectively invisible. On mobile it wraps over five lines. **[V]**
4. **The credentials are hidden.** CPCC and PCC (ICF) appear only as two small, unlabeled badge images on the About page. The home page text mentions CTI and MBTI but never says PCC, ICF or CPCC, and no badge is linked to a verification page. **[V]**
5. **The proof is thin.** There are 7 unique testimonials, all first-name-only, with no role, company, photo, date or measurable result. One testimonial is duplicated, and the six tiles use stock imagery. Proof lives on its own page, with none on the home page. **[V]**
6. **The offer is undefined.** There is no process, cadence, duration or price anywhere. The FAQ answers "What are your rates?" with "let's set up a free sample session". The MBTI team offer says "Cost Varies" and is not in the navigation. **[V]**
7. **Stale and template signals erode trust:** `© 2021`; the email link on every page is the Wix placeholder `mailto:info@mysite.com`; an April 2023 event ("Registration is closed") is still indexed; the Events page is empty; a personal Zoom room URL is published on a public page. **[V]**
8. **The positioning is split.** The logo says "Leadership and Personal Development Coach" and the hero says "Empowering leaders". But the SEO keywords target "life coach / career coach / find life passion / stuck in career Charleston". **[V]**
9. **The platform is heavy for ~500 words of copy:** about 150 requests, 4.4–4.7 MB decoded, about 3.3 MB of JavaScript across about 98 JS files on *every* core page. **[V]**
10. **Migration risk:** nameservers are Wix (`ns10/ns11.wixdns.net`) and email is **Google Workspace** (MX = `aspmx.l.google.com` and alternates). A careless DNS cutover would break `me@mariamkaldas.com`. **[V]**

**Corrections to the brief (these change the build):**

| Brief says | Verified reality |
|---|---|
| Booking via **Picktime** | **No Picktime reference exists** on any page or in any source. The live stack is **Calendly + Wix Bookings** **[V]** |
| "**30-country voyage**" | Her site says "students from **30** different countries on our inaugural voyage." Public record: about 200 students from **35** countries; inaugural voyage sailed 2007-09-05; a second voyage ran in 2008; the program was cancelled in June 2008 **[S]**. Use "students from 30+ countries" |
| "Charleston **roots**" | Her site says she lives there ("living out our dream in Charleston, SC"). Nothing says she is from there |
| CPCC / PCC claims | **Confirmed**, but only as badge images on the About page (alt text `CredentialBadges_PCC.jpg`, `CCT_CPCC_Badge.png`) **[V]**. The PCC badge reads "Professional Certified Coach · ICF"; the CPCC badge reads "Certified Co-Active® Professional Coach" |
| Washington, D.C. | Corroborated by a Franciscan Mission Service (FMS) profile titled "Mariam in DC" **[S]**. Her own site never names D.C. |
| "Beach walk-and-talk" | Her FAQ says in-person sessions for local clients ("did someone say, on the beach?!"). "Walk-and-talk" is a proposed name **[Q]** |
| Executive / C-suite positioning | **None of the 7 testimonials is from an executive.** They are career pivots, confidence recovery, accountability and personal growth. See the positioning risk in the Blueprint |

---

## 1. Method and sources

| Target | Result |
|---|---|
| `/`, `/more-about-me`, `/faq`, `/testimonials` | HTTP 200. Full text, links, meta, headings and images extracted **[V]** |
| `/services` | 200. **Not in nav.** 2 services listed **[V]** |
| `/service-page/free-sample-coaching-session` | 200. Orphan **[V]** |
| `/service-page/myers-briggs-team-facilitation` | 200. Orphan **[V]** |
| `/booking-calendar/free-sample-coaching-session` | 200. Live availability calendar (orphan) **[V]** |
| `/events-page` | 200. Title only; **no content** **[V]** |
| `/events-1/seven-principles-for-making-marriage-work` | 200. 2023 event, "Registration is closed" **[V]** |
| `robots.txt`, `sitemap.xml` (+3 child sitemaps) | 200. Wix-generated; page `lastmod` values 2022-12-20 to 2024-11-12 **[V]** |
| `calendly.com/kaldas`, `/kaldas/sample` | 200. JS shell, `robots: noindex` **[V]** |
| Rendering | Headless Chromium at 1440×900 and iPhone 13 emulation, full-page screenshots, computed styles, network accounting **[V]** |
| DNS | NS, MX, A, TXT via DNS-over-HTTPS **[V]** |

**Not found anywhere:** social-media links (LinkedIn, Instagram, etc.), a blog, a newsletter, press mentions, video, a privacy policy, or analytics evidence. **[V]**

---

## 2. Current sitemap and user journey

### 2.1 Sitemap

| # | URL | In nav? | Wix `lastmod` | Role | Verdict |
|---|---|---|---|---|---|
| 1 | `/` | Home (and "Contact", which returns here) | 2022-12-20 | Hero, welcome, "Is coaching right for me?", footer form | Core |
| 2 | `/more-about-me` | "About" | 2022-12-20 | Bio narrative + 2 credential badges | Core |
| 3 | `/faq` | "FAQ" | 2022-12-20 | 4 Q&As | Core |
| 4 | `/testimonials` | "Testimonials" | 2022-12-20 | 6 tiles → lightbox | Core |
| 5 | `/services` | **No (orphan)** | 2022-12-20 | Lists 2 services | Hidden offer page |
| 6 | `/service-page/free-sample-coaching-session` | No | 2024-11-12 | 1 hr, free | Duplicate of Calendly offer |
| 7 | `/service-page/myers-briggs-team-facilitation` | No | 2024-11-12 | 3 hr, "Cost Varies", at the customer's place | Hidden B2B offer |
| 8 | `/booking-calendar/free-sample-coaching-session` | No | n/a | Wix Bookings calendar with live slots | Competes with Calendly |
| 9 | `/events-page` | No | 2022-12-20 | Empty | Dead |
| 10 | `/events-1/seven-principles-for-making-marriage-work` | No | 2023-03-03 | Christian marriage workshop, Myrtle Beach, 2023-04-29, closed | Stale, off-brand |

**Navigation (all pages):** Home · About · FAQ · Testimonials · Contact. There is no "Work with me", Services, or Book item. **[V]**

**Outbound and utility links:** `coactive.com` (CTI, linked twice on home, including a stray link wrapping the words "and a"); `calendly.com/kaldas`; `calendly.com/kaldas/sample`; `mailto:me@mariamkaldas.com?subject=I'm ready for a sample session!` (FAQ); **`mailto:info@mysite.com`** (footer, all pages); `goo.gl/images/gGoFzv` (FAQ "Ikagai", which resolves to a **Google Images viewer page for a third-party blog's graphic**; "ikigai" is misspelled). **[V]**

### 2.2 CTA map

| Page | CTA text | Destination | Position |
|---|---|---|---|
| Home | "Book **here**" (inline, in the Welcome paragraph) | `calendly.com/kaldas` | 1,292 px (desktop), 1,188 px (mobile) |
| Home | "Read More" (button) | `/more-about-me` | Below Welcome |
| Home | "Book a free sample session **here**" | `calendly.com/kaldas` | Below the reflection list |
| Home, all pages | "Book a Session: https://calendly.com/kaldas" (raw URL) | Calendly profile | Footer |
| Home, all pages | Form "Submit" | Wix form (Name / Email / Subject / Message) | Footer |
| FAQ | "free sample session" ×3 | `calendly.com/kaldas`, `/kaldas/sample` (×2) | In-answer |
| FAQ | `me@mariamkaldas.com` | mailto with prefilled subject | In-answer |
| Services | "Book Now" | `/booking-calendar/free-sample-coaching-session` (Wix Bookings) | Orphan page |
| Services | "Read More" / "More Info" | Service pages | Orphan page |

### 2.3 Journey and friction

```
Landing (Home)
  └─ hero: logo, nav, "IMPACT" billboard. NO CTA, no "who/what/for whom" in the first screen
       └─ scroll ~1,300 px → inline link "here"
            └─ leaves site → calendly.com/kaldas (generic profile, noindex)
                 └─ pick event type → pick time → confirm
Alt A: Nav → FAQ → three different booking links (profile / sample event / mailto)
Alt B: /services (orphan) → Wix Bookings calendar (separate availability; sync with Calendly unknown) [Q]
```

| ID | Friction point | Evidence | Severity |
|---|---|---|---|
| F1 | No CTA above the fold | Mobile first 844 px: the only text-bearing interactive elements are "Skip to Main Content" and the CTI link | **High** |
| F2 | First booking link is plain text "here" at ~1.4 viewports down | Measured 1,292 px (desktop) | **High** |
| F3 | Hero text unreadable; broken hero image | 1.11:1 contrast; asset returns 403 | **High** |
| F4 | Credentials not in the hero; badges small and unlinked | PCC badge is 189×128 px | **High** |
| F5 | Proof is not on the home page; testimonial text hidden behind ">" | Tiles show 15–35-word teasers | **High** |
| F6 | Three booking systems, none embedded; home vs FAQ link to different Calendly URLs | Link audit above; Wix slots live | **High** (double-booking risk) |
| F7 | Offer undefined (what happens, how long, how many sessions, cost) | Rates question deflected | Medium |
| F8 | Footer form: placeholders as labels, 3 of 4 fields without programmatic labels; email link is `info@mysite.com` | DOM audit | Medium |
| F9 | Stale trust signals | © 2021; 2023 event; empty Events page | Medium |
| F10 | A floating round "•••" action button overlaps content on mobile (appears to be Wix's quick-action bar **[E]**) | Screenshot | Low |
| F11 | Duplicate and orphan content | Kevin C. quote appears twice; stray text "Educator, writer, storyteller." trails the testimonials | Low |
| F12 | Personal Zoom room URL published on a public service page | `/service-page/free-sample-coaching-session` | Low–Medium (privacy) |
| F13 | Outbound "Ikagai" link goes to a Google Images viewer page | Resolved URL is `images.google.com/imgres?…` | Low |

---

## 3. Verbatim copy and brand voice

*Typos and odd spacing are preserved exactly as published (for example "Ikagai", "went onto", "she's help me").*

### 3.1 Home (`/`)

```text
Empowering leaders to make a professional and personal
IMPACT
Welcome
Well, hello there. Come on in. Perhaps you've happened upon my site because you're searching for what you want to do with your life, or because you're stuck where you are and know there's got to be a different path. Whatever it may be, you've come to the right place.
I am passionate about facilitating transformative experiences for my clients.
I am certified professional and personal coach through the Coaches Training Institute (CTI) and a certified Myers-Briggs Type Indicator (MBTI) practitioner. Over the course of the last couple of decades, I have worked, lived, and traveled in over 45 countries. I have had extensive experience in organizations ranging from start-ups and non-profits to higher education and the U.S. Department of State. Having worked with individuals and teams from a variety of backgrounds, it would be my honor to journey with you. Let's have a free sample session to see if we're a fit! Book here.
Read More
Is coaching right for me?
Are you a driven leader who wants to make an impact?
Do you always meet external deadlines, but struggle to meet the ones you set for yourself?
Are you playful and have a great sense of humor?
Have you been dreaming about your next steps, but don’t know how to get there?
Even with all you’ve accomplished, do you sometimes struggle to see how talented you really are?
Do you doubt the value of your expertise?
Are you scared, or maybe a little intimidated, to go after what you really want for yourself?
Let's give it a try and see if there's a connection! Book a free sample session here.
```

### 3.2 About (`/more-about-me`)

```text
ABOUT ME
Passionate about Empowering You to make an Impact
Wanting to know more about me? I truly am passionate about facilitating transformative experiences for my clients. This passion has been cultivated through my own journey as a professional, wife, mother, and friend.
I knew I was ready for a non-conformist journey when I ditched my business major at the University of Virginia and pursued a double major in Religious Studies and Sociology. When it came time to find a job after graduation, I turned down an offer to manage my own tutoring center, and instead took a job as the Director of Student Life at an agricultural college in Thessaloniki, Greece. Knowing that I loved working with people from a developmental perspective, I went onto to the University of Maryland to study Higher Education and Student Affairs.
During my graduate studies, I was longing to work at the intersection  of intercultural communication and student affairs. I also loved travel and being on the water, so after graduating with my M.Ed., I helped to design and establish a university-at-sea program called The Scholar Ship. We had students from 30 different countries on our inaugural voyage. And yes, I did sail around the world. And yes, it was epic.
I then left the ship to volunteer in Zambia as the Public Relations Manager for the Coptic Orthodox Church. After returning to the United States, I became the Associate Director of Franciscan Mission Service, where I supported volunteers serving with impoverished and marginalized communities across the globe.
Most recently, I was the External Engagement Advisor in the Office of Religion and Global Affairs at the U.S. Department of State where I worked with religious leaders, academic scholars, and faith-based organizations at the intersection of foreign policy. I have now found joy in coaching, being a mother of two incredible little ones, and as a wife to an amazing husband. We are living out our dream in Charleston, SC.
```

*Images on this page (not text): the PCC badge and the CPCC badge (section 5).*

### 3.3 FAQ (`/faq`)

```text
So you have some questions...

Who do you typically coach?
I typically coach passionate, vibrant people who are thoughtful, reflective and willing to take risks. Generally, they aren't looking to "settle" and show this through desiring and pursuing a path that feeds their spirit, mind, and soul. If you resonate with some (or all!) of the following statements, then we might just be a great coach-client fit:
When you think about where you work or what you want to do, you want to be passionate about the mission of the organization, your role, and your colleagues.
You want deep joy and fulfillment out of what you do.
You believe that each person has what the Japanese call Ikagai, or a "reason for being," and you’re either trying to figure yours out, or you have some sense of it and you’re trying to figure out how to align it with making a living.
You are committed to seeking and pursuing your dreams and goals, even if right now you're not quite sure how to make them happen.
You are mesmerized by the growth and evolution of us as human beings, and are committed to learning new things about yourself and the world around you.
Your spiritual beliefs are important to you and integral to your identity.
You consider yourself to be a genuine individual, and are committed to personal growth.

What are your rates?
I know, it's the burning question. But seriously, let's set up a free sample session to see if we have a good client-coach fit, and I'd be happy to chat rates with you!
Email: me@mariamkaldas.com
Phone: (843) 936-1601

Where do you coach?
I typically coach over the phone or via Zoom, as it allows me to work with you no matter where you are in the world. That said, local clients (I'm in Charleston, South Carolina) are always welcome to contact me about doing in-person (did someone say, on the beach?!) sessions!
Schedule a free sample session to see what it would be like to work together as coach and client, or call me at (843) 936-1601 or email me@mariamkaldas.com.
I look forward to talking with you!

Why should I hire a coach?
To be honest, you shouldn’t.
Not unless, of course, you’re ready, willing, and committed to making changes in your life. Ask yourself:
Am I ready to take on challenges, set goals, and commit to following through?
Am I ready to be stretched and grown over the coming months?
Am I ready to find and transform my life passion into my daily reality?
If you’re ready to live a life you're passionate about, then working with a coach may be the next best step for you.
I'm real with you from the start, which is why I offer a free sample session with anyone who is interested in finding out more. By the end of session, I will be honest about whether I think coaching is a good fit for you, and we both get to decide if we’d be a good coach-client match.
If you’d like to schedule a free sample session, or if you have any questions, feel free to email me@mariamkaldas.com or give me a call at (843) 936-1601.
```

### 3.4 Services (`/services`, orphan) and service pages

```text
SERVICES
All Services
Personal & Professional Growth
Myers-Briggs Team Facilitation
Service Information
Free Sample Coaching Session
Let's find out if we're a fit! Read More
1 hr
Free
Book Now
Myers-Briggs Team Facilitation
Leverage personality differences to make your team more effective! Read More
3 hr
Cost Varies
More Info
```

```text
Free Sample Coaching Session
Let's find out if we're a fit!
1 hr
Free
Book Now
Service Description
You bring the topic and we'll go from there!
Contact Details
+ (843) 936-1601
me@mariamkaldas.com
Charleston, SC, USA
```

*(The location line on this page is a personal Zoom room URL, intentionally redacted here. See F12.)*

```text
Myers-Briggs Team Facilitation
Leverage personality differences to make your team more effective!
3 hr
Cost Varies
Customer's Place
Service Description
As a result of this session, individuals and teams will have:
-Increased awareness of strengths, challenges, and blind spots
-Increased tolerance of differences that are innate while recognizing  that behavior can be changed or modified
-Action planning to enhance performance as an individual, manager  and leadership team member
Contact Details
+ (843) 936-1601
me@mariamkaldas.com
Charleston, SC, USA
```

### 3.5 Event page (stale; recommend dropping)

```text
Seven Principles for Making Marriage Work
Sat, Apr 29 |
Saint Mark Coptic Orthodox Church
A Half-Day Christian Workshop Based on the Seven Principles for Making Marriage Work
Registration is closed
Time & Location
Apr 29, 2023, 10:00 AM – 2:30 PM
Saint Mark Coptic Orthodox Church, 1400 Carolina Forest Blvd, Myrtle Beach, SC 29579, USA
About the event
Proven tools to help couples:
Improve friendship, fondness, and admiration
Enhance romance and intimacy
Manage conflict constructively
Create shared meaning
Maintain gains throughout a lifetime
Registration for One Couple
$0.00
Sale ended
```

### 3.6 Global footer (every page)

```text
Let's Connect!
© 2021 by Kaldas Consulting, LLC
Are you near Charleston, SC? I'd love to meet up in person! Drop me a note, and we'll grab coffee.
Otherwise, fill out the form, give me a call or text, or send me an email -- I look forward to hearing from you!
Tel: (843) 936-1601
Email: me@mariamkaldas.com
Book a Session: https://calendly.com/kaldas
Thanks for submitting!
```

*Form fields:* Name, Email, Subject, Message. *Button:* Submit. *Entity:* Kaldas Consulting, LLC. *Location:* Charleston, SC, USA.

### 3.7 SEO / meta copy as published

| Item | Value |
|---|---|
| Home `<title>` | Mariam Kaldas Coaching |
| Other titles | About \| Mariam Kaldas · FAQ \| Mariam Kaldas · Testimonials \| Mariam Kaldas · Services \| Mariam Kaldas · Events Page \| Mariam Kaldas |
| Meta description (home only) | With incredible insight and deep intuition, Mariam Kaldas connects clients to their passion through powerful coaching. |
| Meta keywords | career coach charleston, find life passion charleston, life coach charleston, mariam kaldas, mariam kaldas charleston, mariam kaldas coaching, personal coach charleston, professional coach charleston, stuck in career charleston |
| OG image | Home portrait (tea at the stone table), cropped 2500×1330 |
| Calendly page | "Calendly - Mariam Kaldas"; `robots: noindex` |

### 3.8 Brand voice analysis

| Trait | Evidence (verbatim) | Keep for the rebuild? |
|---|---|---|
| Warm, direct, a little playful | "Well, hello there. Come on in." · "And yes, I did sail around the world. And yes, it was epic." · "(did someone say, on the beach?!)" | **Yes. This is the differentiator.** |
| Radical candor as a qualifier | "Why should I hire a coach? To be honest, you shouldn't." · "By the end of session, I will be honest about whether I think coaching is a good fit for you" | **Yes. Selectivity reads as high-value.** |
| Second-person diagnostic questions | "Do you always meet external deadlines, but struggle to meet the ones you set for yourself?" | **Yes. Strongest hook on the site.** |
| Purpose language | passion(ate) ×9, fit ×7, free ×15, sample ×10, career ×6, growth ×5, strength ×5, transformative ×3, journey ×3, impact ×3, joy ×3, dream ×3 | Keep "purpose/fit/honesty"; retire "free sample" and "passion" overuse |
| Whole-person and faith-inflected | "feeds their spirit, mind, and soul" · "Your spiritual beliefs are important to you and integral to your identity" | **Decision needed** (see Blueprint D2) |
| Self-disclosure as authority | "ditched my business major" · "turned down an offer to manage my own tutoring center" | **Yes. Turns the CV into a story.** |
| Weak spots | Passive "Perhaps you've happened upon my site"; hedged "a couple of decades"; "extensive experience in organizations ranging from…" | Rewrite with specifics |

### 3.9 Credentials and claims ledger

| Claim | Source | Status | Notes |
|---|---|---|---|
| CTI certified professional and personal coach; **CPCC** (Certified Co-Active® Professional Coach) | Home text; CPCC badge image on About | **[V]** | Badge looks like a digital credential (verification icon). Ask for the badge URL **[Q]** |
| **PCC**, ICF Professional Certified Coach | PCC badge image on About (189×128 px) | **[V]** image only | Link to ICF credential verification. ICF's published PCC path requires a documented minimum of client-coaching hours; verify current figures before quoting any number **[S]** |
| Certified **MBTI** practitioner | Home text; MBTI facilitation service page | **[V]** | |
| University of Virginia, double major Religious Studies and Sociology | About | **[V]** | |
| Director of Student Life, agricultural college, Thessaloniki, Greece | About | **[V]** | Institution unnamed **[Q]** |
| M.Ed., University of Maryland (Higher Education and Student Affairs) | About | **[V]** | |
| Helped design and establish **The Scholar Ship** (university-at-sea); "sailed around the world" | About | **[V]**; program **[S]** | Public record: ran 2007 and 2008 voyages; ~200 students from 35 countries on the 2007 inaugural voyage; cancelled June 2008. **Wording must be exact:** "helped design and establish", never "founded". Confirm which student count Mariam can personally vouch for **[Q]** |
| Public Relations Manager, Coptic Orthodox Church, Zambia | About | **[V]** | FMS 2012 profile confirms a 2008 mission in Zambia "with another organization" **[S]** |
| Associate Director, Franciscan Mission Service | About | **[V]** + **[S]** | FMS 2012 profile: associate director, "started as FMS' first domestic volunteer" **[S]** |
| External Engagement Advisor, Office of Religion and Global Affairs, U.S. Department of State | About | **[V]** text | FMS 2014 post says "enrolled in a fellowship with the Office of Faith-based Community Initiatives at the State Department" **[S]**. Confirm exact title and dates **[Q]** |
| "Worked, lived, and traveled in over 45 countries" | Home | **[V]** claim | Safe as written |
| Charleston, SC (resident) | About, footer, service pages | **[V]** | "Roots" is not supported |
| Older third-party pages list her under a different surname | FMS pages **[S]** | **[S]** | Ask whether to add `alternateName` in structured data **[Q]** |

---

## 4. Social proof inventory

**All 7 unique clients and 8 published quote blocks.** The site tiles use six "…ing you" labels (stretching, strengthening, challenging, encouraging, empowering, discovering) with stock circular images.

*Text below is verbatim. Where a tile shows a teaser and a longer lightbox text, they are listed separately.*

### 4.1 Kevin C. *(tile label: "stretching you"; the same body text is duplicated under "empowering you" **[V]** bug)*

> "I think this is the core of the coaching experience: to view myself as I am and acknowledge all the parts of myself."

> Mariam is a sentient person, who can ask me questions that force me to really think about myself, and how I function as a person... I think this is the core of the coaching experience: to view myself as I am and acknowledge all the parts of myself, whether they're good or bad. Mariam was amazing at doing this and getting me to really introspect and figure out exactly what I'm doing right, and what I can improve on.

**Tags:** Mindset shift. **Best fragment:** "ask me questions that force me to really think about myself".

### 4.2 Indy *(tile: "strengthening you")*

> "Mariam is a wonderful career coach. During my career transition from research into programming, I really struggled with the thought of “losing” years of experience in order to pursue what I’m passionate about."

> She helped me reframe my point of view to take that experience into my next chapter of life, which ultimately is going to make me happier. Mariam’s methodology of focusing on both strengths and areas of growth has helped me surpass personal obstacles that I’ve worked on my entire life, while reinforcing self-assuring actions. Because of her unwavering support, I’m able to be the best version of myself.”

**Tags:** Career pivot, Mindset shift. **Best fragment:** "She helped me reframe my point of view to take that experience into my next chapter of life".

### 4.3 Reuschal *(tile: "challenging you")*

> "[Mariam] has pulled the best of out me, and she's help me identify the things that have been holding me back. She's been invaluable."

> Coaching has been a game changer for my career. Having no success at the two companies I joined after graduating law school, those failures really took their toll on my belief in myself and the work that I was capable of doing. Working with Mariam has allowed me to really dig deep into some of those fears and irrational beliefs that I held about myself and my abilities. Working with her, and working on the projects she assigned to me, helped me identify who I am, who I want to be, and the type of work I want to do. She has pulled the best of out me, and she's help me identify the things that have been holding me back. She's been invaluable. She's changed the way that I work, changed the way I interact with my teammates and I can't thank her enough for the work she's done for me and my career.

**Tags:** Leadership breakthrough (team behavior), Mindset shift, Career pivot. **Best fragment:** "She's changed the way that I work, changed the way I interact with my teammates".

### 4.4 Monica *(tile: "encouraging you")*

> "I truly enjoyed and appreciated my time working with Mariam. She helped me stay on track..."

> ...and make progress with my goals (accountability and moving forward), while also taking a holistic approach to caring for me as a person (addressing mindset challenges and hurdles). I would wholeheartedly recommend her!

**Tags:** Personal accountability, Mindset shift. **Best fragment:** "taking a holistic approach to caring for me as a person".

### 4.5 Dan *(tile: "empowering you")*

> "Mariam's coaching was instrumental in my success in moving on with my new career."

> After doing some reflection, it dawned on me that Mariam's coaching was instrumental to my success in moving on with my new career. I think she's an excellent coach.

**Tags:** Career pivot.

### 4.6 Josh *(tile: "empowering you")*

> Mariam is a master at uncovering areas that need growth, while at the same time highlighting and encouraging strengths. She is an extremely valuable asset to have on your team.

**Tags:** Leadership breakthrough (team and strengths). *Written from a team viewpoint. Confirm his relationship to Mariam **[Q]**.*

### 4.7 Margarita *(tile: "discovering you")*

> "Professional and personal coaching with Mariam was a unique experience for me. It helped me realise what my strengths are, face my weaknesses, and look at opportunities without fear or hesitation."

> In terms of my professional goals, during a relatively short period of time and thanks to Mariam's coaching, I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months. On a personal level, we worked on my relationships with the loved ones, and with Mariam's guidance I discovered things I never imagined I would, and started working on them. There is still lots to be done, but I’m positive these will be solved in due time.

**Tags:** Leadership breakthrough (launch), Mindset shift. **Best fragment:** "I managed to bring to life a project which had waited in the drawer for a long time, and I turned it into a growing success within months".

### 4.8 Categorization summary (proposed taxonomy; multi-tag allowed)

| Transformation | Clients | Count | Note |
|---|---|---|---|
| **Mindset shift** | Kevin C., Indy, Reuschal, Monica, Margarita | 5 | Strongest and most consistent theme |
| **Career pivot** | Indy, Reuschal, Dan | 3 | Includes research→programming and a post-law-school reset |
| **Leadership breakthrough** | Reuschal (team behavior), Josh (team and strengths), Margarita (launch) | 3 | Thin for "executive" claims |
| **Personal accountability** | Monica | 1 | Add 2–3 more to make this filter worth showing |

### 4.9 Proof gaps (what the upgrade needs)

- **Missing on all 7:** full name or approved descriptor, role and company (or an anonymized descriptor), headshot or initials, date, and a one-line measurable outcome. Collect with consent **[Q]**.
- **Visual:** six stock black-and-white circular images (alt texts: Yoga Symmetry, Muscular Man Lifting Kettle Ball, Together at the Top, Track Race, Reflection, Type Writer) carry no information. Replace.
- **Defects:** the Kevin C. body text is duplicated; stray text "Educator, writer, storyteller." trails the page.
- **Volume:** 7 first-name quotes will not carry premium pricing. Plan 3 to 5 new, named, role-tagged quotes, ideally including at least one team or leader client and one video **[E]**.

---

## 5. Media and assets

### 5.1 Images

Base URL: `https://static.wixstatic.com/media/<id>`

| Asset | Wix media id | Original size | Where used | Notes |
|---|---|---|---|---|
| **Logo**: "Mariam Kaldas / Leadership and Personal Development Coach", navy bold-serif wordmark with a cyan brush stroke | `7b24a0_9e8048305ade441f983a05ffd4679957~mv2.png` | 1186×422, 90 KB | Header | Raster, not vector. Rebuild as SVG |
| **Portrait A**: seated at a stone table, tea cups, lake and mountains behind (strong story image) | `7b24a0_f336156f8a5c40b7bb9fca0f98da721a~mv2_d_3264_2448_s_4_2.jpg` | 3264×2448, 2.7 MB | Home; OG image | Good source file. Alt text empty |
| **Portrait B**: yellow dress against stone columns | `7b24a0_5425b6326245462fbbc3d02e2d1e431d~mv2_d_3000_2000_s_2.jpg` | 3000×2000 | About | Alt text reads as a personal engagement-photo filename. Replace |
| **PCC badge**: ICF Professional Certified Coach | `7b24a0_90f1f96b99eb42ceba52296b334e0a16~mv2.jpg` | 189×128, 31 KB | About | Too small for retina; request the official asset |
| **CPCC badge**: Certified Co-Active® Professional Coach | `7b24a0_29fb2bc446a445c794cc5d6c4aa99115~mv2.png` | 600×600, 126 KB | About | Good resolution |
| Hero background "Mountains" | `84770f_0cf5b6c1550a4b8c92f92f1064cc68de~mv2.jpg` | about 1432×1074, 113 KB | Home | Generic sky-blue stock gradient |
| Hero overlay | `f84b209469da4471b60850dc411d770b.jpg` | n/a | Home | **HTTP 403, broken** **[V]** |
| About background "Mountains" | `5ae58bc939e44a8c8ac0dcafa8a5eb10.jpg` | about 1440×1096, 2.5 MB | About | A 2.5 MB decorative background |
| Testimonial tiles ×6 | various | 130–151 px | Testimonials | Stock imagery |

**No video, no social-media icons, no press logos.** **[V]**

### 5.2 Colors (computed from live styles)

| Hex | Where | Contrast issue |
|---|---|---|
| `#0A5587` navy | Headlines ("IMPACT", "WELCOME"), logo wordmark | On white 7.89:1, passes |
| `#57BBBF` teal | Footer background, active nav, inline accent copy | On white **2.27:1, fails** |
| `#74F9FF` cyan | Hero subline | On sampled sky `rgb(179,227,231)`: **1.11:1, fails** |
| `#36D1B5` mint | Testimonial tiles | White text on it **1.92:1, fails** |
| `#303F4D` slate | Quote glyph | |
| `#B0A986` khaki | Testimonials page | |
| `#CFC7F2` lilac | About page band behind the last bio paragraph | Visible layout bug: the paragraph runs from a teal gradient into this band |
| `#116DFF` Wix blue | Default links | |
| `#000` / `#FFF` | Body copy / surfaces | |

**Eight unrelated hues, no system.** Footer black text on teal passes (9.27:1).

### 5.3 Typography (loaded fonts)

| Role | Family | Note |
|---|---|---|
| Headlines, display | **Lulo Clean One Bold** (Wix/Monotype web font) | Wide-tracked, geometric. Reads as a "life-coach template" |
| Body | **Avenir LT W01 35 Light** | 15 px nav; body is **justified** on Home, creating visible spacing rivers |
| Testimonial labels | **Dancing Script** | Third voice, unrelated to the brand |
| Testimonials body | **Futura LT W01 Book** | Fourth family |

Wix-bundled Monotype fonts are licensed for use on Wix and are likely not portable **[E]**. Budget for new fonts.

### 5.4 Contact and platform

| Item | Value |
|---|---|
| Email | `me@mariamkaldas.com` (Google Workspace mailbox **[V]** via MX) |
| Phone / text | `(843) 936-1601` |
| Booking | `https://calendly.com/kaldas` · `https://calendly.com/kaldas/sample` · Wix Bookings calendar |
| Entity / location | Kaldas Consulting, LLC · Charleston, SC, USA |
| Hosting | Wix. Responses carry `x-wix-request-id`, served via Cloudflare |
| DNS | Nameservers `ns10.wixdns.net`, `ns11.wixdns.net`. Apex A: `185.230.63.186`, `.107`, `.171`. Apex → `www` via 301 |
| Email DNS | MX: `aspmx.l.google.com` (10), `alt1` (20), `alt2` (30), `alt3` (40), `alt4` (50). SPF: `v=spf1 include:_spf.google.com ~all` |
| Existing Vercel project | **None** matching "mariam" or "kaldas" |

### 5.5 Performance (headless Chromium, decoded bytes)

| Page | Requests | Decoded size | JS decoded | JS files |
|---|---|---|---|---|
| Home (desktop) | 150 | 4.4 MB | 3.2 MB | 98 |
| About | 151 | 4.3 MB | 3.2 MB | 97 |
| FAQ | 150 | 4.4 MB | 3.2 MB | 98 |
| Testimonials | 156 | 4.6 MB | 3.2 MB | 97 |
| Services (orphan) | 167 | 6.3 MB | 5.0 MB | 106 |

Roughly 500 words of copy per page. Timings (5.6–8.1 s to network idle; one 20 s mobile outlier) are noisy in this environment and are not used for conclusions.

---

## 6. UX and conversion critique

### 6.1 Why it feels dated (measured, not opinion)

1. **Template aesthetics.** A stock sky-blue gradient hero with a 110 px wide-tracked "IMPACT" billboard and teal footer is the 2016–2018 "life-coach template" look.
2. **No palette system.** Eight unrelated hues (section 5.2), and three of the colors fail contrast.
3. **Four type families with no hierarchy.** Justified body text on the home page creates visible spacing rivers.
4. **Generic imagery doing the work of proof.** The only distinctive assets are two good portraits, one of them buried half a page down. Testimonials rely on stock tiles.
5. **No information design.** The seven reflection questions (the best content on the site) are a plain bullet list. There is no interaction, no sequence, no payoff.
6. **A one-page funnel hidden in a four-page site.** The offer, the process and the price are absent. The services and booking pages exist but are orphaned.
7. **Platform weight.** About 150 requests and about 3.3 MB of JS per page. It feels slow because it is.

### 6.2 Biggest opportunities (ranked by systemic impact over effort)

| Rank | Opportunity | Why it matters |
|---|---|---|
| 1 | **Hero with the primary CTA, credentials and one sentence of who-it's-for, visible without scrolling** | Fixes F1–F4 at once |
| 2 | **One booking path, embedded** (single source of truth for availability) | Removes F2, F6 and the double-booking risk |
| 3 | **Turn the "Is coaching right for me?" questions into an interactive mirror that pre-qualifies and pre-fills the booking form** | Converts her best content into the funnel |
| 4 | **Proof on the home page, with names, roles and outcomes** | Premium pricing needs verifiable proof |
| 5 | **Define the offer:** process, duration, cadence, investment structure | Removes the "what am I buying?" stall |
| 6 | **Make the global story the memorable moment** (Scholar Ship → Zambia → D.C. → Charleston) | Her rare differentiator is currently a paragraph |
| 7 | **Rebuild on a lean stack and fix accessibility** | Speed, SEO and WCAG fixes |

### 6.3 Accessibility and SEO defects **[V]**

- **Empty `<h1>` on every page** (a zero-width space). The visual headline is an `<h3>`. Headings skip levels (H1 empty → H3 → H4 → H6).
- **3 of 4 home images have no alt text;** the logo alt reads like a filename ("Updated Logo w Transparent Background.pn").
- **3 form inputs lack programmatic labels** (placeholders only). **8–9 tap targets are under 44 px.**
- **Among the core pages, only the home page has a meta description.** About, FAQ, Testimonials, Services and Events have none; the service and event pages carry descriptions auto-copied from their body text. Inner-page titles are generic ("About | Mariam Kaldas").
- **Keywords contradict the positioning:** "life coach", "career coach", "find life passion", "stuck in career" vs the "Leadership" logo line.
- **Only two auto-generated JSON-LD blocks:** a `LocalBusiness` (name, phone, Charleston, SC locality, no street address) and a `WebSite`. No `Person` with credentials, no `areaServed` for online coaching, no `FAQPage`.

### 6.4 What to keep

Her voice (section 3.8), the honest "you shouldn't hire a coach unless…" framing, the free low-risk first session, the seven reflection questions, the bio narrative, and the "…ing you" testimonial verbs (stretching, strengthening, challenging, encouraging, empowering, discovering), which can seed the filter vocabulary.

---

## 7. Open questions for Mariam (content the site cannot be built without)

**Offer and economics**
1. Process: sessions per month, session length, typical engagement length, between-session support (email/voice), homework?
2. Pricing: show a "starting at", a range, or "on request"? Packages?
3. Is the "free sample session" 30 or 60 minutes? Source of truth for availability: Calendly or Wix Bookings? Calendly plan tier?
4. MBTI team facilitation: still offered? Pricing model? Corporate clients served?

**Clients and proof**
5. Permission and details for each testimonial: full name, role, company or descriptor, headshot, date, outcome.
6. 3 to 5 new client stories, including at least one video. Any executives or team leaders?
7. Client count, coaching hours (PCC requires a documented minimum; confirm real figure), industries, geographies.
8. Press, speaking, podcasts, publications.

**Positioning**
9. Ideal client in one sentence. Executives, emerging leaders, mission-driven professionals, career changers?
10. How visible should faith be? (FAQ lists "spiritual beliefs" as a fit criterion; a Christian workshop was hosted in 2023.)
11. Is "chemistry session" the right new name for the sample session?
12. Beach/in-person sessions: location, logistics, "walk-and-talk" format?

**Facts to confirm for the narrative**
13. Student count on the Scholar Ship (her "30" vs public "~35") and her exact role.
14. Exact State Department title and dates; the Thessaloniki institution's name; Zambia dates.
15. CPCC and PCC badge URLs for verification links; the official ICF badge asset.
16. Name variants to add to structured data.

**Assets and operations**
17. Original photo files; appetite for a half-day editorial shoot (Charleston).
18. Domain registrar and renewal date; Wix plan end date; who controls DNS.
19. Any analytics (Wix Analytics screenshot: traffic, form submissions, bookings per month) to set a baseline.
20. Who will edit content after launch?
21. Privacy: OK to remove the personal Zoom room URL and the personal alt text?

---

## 8. Sources

- Franciscan Mission Service, ["National Volunteer Month Profile: Mariam in DC" (2012)](https://franciscanmissionservice.org/2012/04/national-volunteer-month-profile-mariam-in-dc/) and ["Bonds of Friendship" (2014)](https://franciscanmissionservice.org/2014/12/bonds-of-friendship/)
- [Wikipedia: The Scholar Ship](https://en.wikipedia.org/wiki/The_Scholar_Ship)
- ICF, [PCC credential requirements](https://coachingfederation.org/credentialing/icf-credentials-overview/pcc/) (verify current figures)
- Co-Active / CTI, [What is Co-Active](https://coactive.com/what-is-co-active/)
- Calendly, [Advanced embed for developers](https://calendly.com/help/advanced-calendly-embed-for-developers) · [Pre-fill invitee information](https://calendly.com/help/how-to-pre-fill-invitee-information-in-an-embed)
