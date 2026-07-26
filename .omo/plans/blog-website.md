# blog-website - Work Plan

## TL;DR (For humans)

A static HTML/CSS/JS blog website for **brentanddenise.com** — a couple documenting their retirement planning journey and move out of the US. Single-page app, no build tools, no monthly hosting fees (Cloudflare Pages free tier). Blog posts managed via a JSON data file (developer-managed for MVP; upgradeable to Decap CMS for non-technical visual editing). Light/dark mode, mobile-first, social media integration, newsletter signup. Zero-runtime, zero-database, fully static.

**The timeline context captured**: Denise retires Dec 2027 (17-month horizon), Brent has 5 years. Content themes will reflect this countdown/runway narrative.

**What it will NOT do**: No CMS admin panel (posts are JSON files — developer-managed initially; Decap CMS upgrade path documented), no e-commerce, no paid memberships, no server-side processing, no database.

**Effort**: ~12 todos, ~3-4 hours implementation.
**Risk**: Low — all static, no state, no runtime dependencies.
**Ongoing cost**: ~$1/mo (domain amortized) + $0 hosting.
**Known trade-offs** (reviewed in Metis gap analysis):
- Hash-based routing means social media crawlers won't see blog post OG tags — sharing a post link shows home page preview instead of post-specific preview. This is a known limitation of hash-routed SPAs. Mitigation paths (future): (a) Cloudflare Worker with HTMLRewriter that serves per-post OG tags using URL paths instead of hashes, or (b) static per-post `.html` files with meta redirects, or (c) prerendering service like Prerender.io. Full SSR would require architecture migration. For MVP, accept the generic preview.
- Dark mode preference does not persist between sessions (no localStorage). Each load defaults to system `prefers-color-scheme`. Toggle button flips it in-session only.
- Contact form uses `mailto:` (opens device mail app). Works on most phones with a mail client configured; silent failure if no mail app is set up. JS cannot detect mailto failure, so the error state is informational only.

## Scope

**In scope:**
- Git repository initialized, pushed to GitHub (`brent-and-denise` or similar)
- Single HTML entry point with hash-based routing: flat view names (`#home`, `#about`, `#blog`, `#contact`, `#resources`) plus `#post-<slug>` for individual blog posts (router checks if hash starts with `#post-` to extract the slug — keeps the hash a single token, not a path)
- CSS design system: custom properties, light+dark mode, mobile-first (375/768/1024 breakpoints), clamp() scale
- Home page: hero section, latest 3 posts, Instagram feed widget, newsletter CTA
- About page: Brent & Denise story with retirement timeline (Dec 2027 / 5 years)
- Blog system: JSON data file with posts, listing with pagination (max 2 columns at desktop — AGENTS.md prohibits 3-column identical grids), individual post view with rich content + social embeds
- Contact page: form using Cloudflare Pages Function or external service
- Resources page: curated links for expat/retirement planning
- Social media: profile links (Instagram, YouTube, X/Twitter) + embedded feed widget
- Newsletter: Kit (ConvertKit) signup form embedded
- Analytics: Cloudflare Web Analytics (privacy-first, no cookies)
- Deployment: Cloudflare Pages, custom domain (brentanddenise.com), SSL, auto-deploy from GitHub
- SEO: Open Graph tags, semantic HTML, sitemap
- Performance: Lighthouse scores 90+ all categories

**Out of scope:**
- CMS admin panel (posts are JSON files, edited directly — **developer-managed for MVP**; Brent & Denise cannot independently publish. Upgrade path: Decap CMS, a git-based visual editor that writes to `posts.json` without build tools)
- Paid memberships or subscriptions
- E-commerce or product sales
- Server-side rendering or dynamic server (note: this means post-specific OG tags for social sharing are unavailable — see Known trade-offs)
- User comments system
- Multi-language support
- Migrating existing content (none exists)

**MUST NOT have** (enforced per AGENTS.md rules):
- No colored side borders on cards (border-left accent trick)
- No icon-in-colored-circle decorations
- No centered everything — left-align body content by default
- No decorative background blobs or shapes
- No gradient buttons — solid accent color only
- No gradient text or neon glow effects
- No copyright/license headers in files
- No one-letter variable names
- No inline comments unless explicitly requested

## Verification strategy

Every todo must pass:
1. **Manual smoke test** — load the page in a browser, verify content renders, navigation works, dark mode toggles
2. **Lighthouse audit** — 90+ performance, accessibility, best practices, SEO
3. **Responsive check** — test at 375px, 768px, 1024px widths
4. **Touch target audit** — all interactive elements ≥44×44px
5. **Light/dark mode** — toggle works, no unreadable contrast
6. **Validator** — HTML and CSS pass W3C validation (no errors)
7. **JSON validation** — `posts.json` must pass `JSON.parse()` without errors; verify with `node -e "JSON.parse(require('fs').readFileSync('assets/data/posts.json'))"`
8. **JS console** — no console errors when navigating all routes (check DevTools Console panel)
9. **Broken link check** — all external links resolve (Instagram, YouTube, X/Twitter, Kit); all internal hash links navigate to existing views
10. **`fetch()` error path** — simulate network failure (`DevTools → Network → Offline`) and verify error states render instead of infinite skeleton

## Execution strategy

Build in dependency order with explicit sequencing:
Wave 1 (Foundation): TODO-1 → TODO-2
Wave 2 (Shell + Pages): TODO-3 → TODO-4 + TODO-5 + TODO-8 (parallel-safe: all are independent pages built on the shell)
Wave 3 (Blog): TODO-6 → TODO-7 (blog data must exist before views)
Wave 4 (Integration): TODO-9 (depends on TODO-3 shell for footer icons, TODO-4 home for newsletter CTA, TODO-7 post detail for share buttons) → TODO-10 (depends on all pages being complete for OG tags and semantic HTML across every view)
Wave 5 (Deployment): TODO-11 (repo must exist) → TODO-12 (everything must be complete)

## Todos

### Wave 1: Foundation

#### TODO-1: ✅ Initialize git repo and project scaffold
- **References**: Project root at `C:\Scripts\Brent and Denise\`
- **Paths created**:
  - `C:\Scripts\Brent and Denise\.gitignore`
  - `C:\Scripts\Brent and Denise\index.html`
  - `C:\Scripts\Brent and Denise\404.html` (Cloudflare Pages custom 404 page with site navigation)
  - `C:\Scripts\Brent and Denise\_redirects` (for future Cloudflare Pages Function support: `/* /index.html 200`)
  - `C:\Scripts\Brent and Denise\assets/css/style.css`
  - `C:\Scripts\Brent and Denise\assets/js/app.js`
  - `C:\Scripts\Brent and Denise\assets/js/posts.js`
  - `C:\Scripts\Brent and Denise\assets/data/posts.json`
  - `C:\Scripts\Brent and Denise\assets/img/` (empty, with .gitkeep)
  - `C:\Scripts\Brent and Denise\assets/img/blog/` (empty subdir for blog post images)
  - `C:\Scripts\Brent and Denise\favicon.ico`
- **Actions**:
  1. `git init` in project root
  2. Create `.gitignore` with: `node_modules/`, `.DS_Store`, `dist/`, `.env`, `*.log`
  3. Create empty directory structure above
    4. Create `index.html` skeleton: `<!DOCTYPE html>` with `<html>` (no hardcoded `data-theme` — the JS will set it on load based on `prefers-color-scheme`; an inline `<script>` block in `<head>` reads `prefers-color-scheme` and sets `data-theme` before paint to prevent FOUC), empty `<head>` and `<body>`
   5. Create empty CSS placeholder, JS placeholder, empty posts.json (`{"posts": []}`), 404.html (minimal page with site nav), _redirects (`/* /index.html 200`)
   6. Create a simple SVG favicon (BD initials)
   7. Create `assets/img/blog/` subdirectory for blog post images
  7. `git add . && git commit -m "feat: initial project scaffold"`
- **Acceptance criteria**: Directory structure exists, git is initialized, initial commit made
- **QA happy**: `git log` shows initial commit, all directories exist
- **QA failure**: Missing files → create them
- **Commit**: `feat: initial project scaffold`

#### TODO-2: ✅ Build CSS design system
- **References**: AGENTS.md (CSS custom properties, clamp() scale, light+dark mode, 375/768/1024 breakpoints, no hardcoded values)
- **File**: `assets/css/style.css`
- **Actions**:
  1. Define `:root` and `[data-theme="dark"]` with CSS custom properties:
     - Colors: --color-bg, --color-surface, --color-text, --color-text-secondary, --color-accent (warm earth — e.g., `oklch(0.55 0.15 60)` for accent), --color-border (alpha-blended: `oklch(... / 0.12)`)
     - Typography: --text-xs through --text-xl using `clamp()` (max heading --text-xl = 36px)
     - Spacing: --space-1 through --space-32 on 4px scale
     - Shadows: tone-matched to surface via oklch, not pure black
     - Font: system font stack (--font-body, --font-heading)
  2. Set body font-size to --text-base, line-height 1.6
  3. Mobile-first, breakpoints at 375px (`@media (min-width: 376px)`), 768px, 1024px
  4. Focus-visible ring on all interactive elements
  5. Skeleton loading animation (pulsing gradient)
  6. All `<img>` rules: `max-width: 100%`, `height: auto`
  7. `.container` utility: max-width 1024px, centered, padding left/right --space-4
  8. Transition on `color` and `background-color` for smooth dark mode toggle (200ms ease)
- **Acceptance criteria**: CSS file is W3C-valid, uses only custom properties (zero hardcoded values), dark mode variables defined, clamp() scale for all text sizes, breakpoints at correct values, focus-visible ring declared
- **QA happy**: Open CSS file, grep for any hardcoded `#` or `rgb` outside `:root` — should find zero
- **QA failure**: Hardcoded color found → move to custom property
- **Commit**: `feat: add CSS design system with light/dark mode`

### Wave 2: Shell + Pages

#### TODO-3: ✅ Build site shell (header, footer, navigation, hash routing)
- **References**: AGENTS.md (single HTML entry, hash-based routing, 44×44px touch targets, no localStorage)
- **Files**: `index.html`, `assets/js/app.js`
- **Actions**:
  1. In `index.html`:
     - `<head>`: meta viewport, title "Brent & Denise — Retiring Abroad", Open Graph meta tags (title, description, image, url), favicon link, CSS link
     - `<body>`: `<header>` with logo/home link, navigation links (Home, About, Blog, Contact, Resources), dark mode toggle button (sun/moon icon via inline SVG or text), `<main id="app">` with `<section id="view-home">` through `<section id="view-resources">` (each has a skeleton placeholder), `<footer>` with copyright, social links placeholder, newsletter link, back-to-top
     - Each section has a loading skeleton state (e.g., pulsing placeholder divs)
  2. In `assets/js/app.js`:
     - Hash routing: on `hashchange` and page load, parse `window.location.hash`. Known views: `#home`, `#about`, `#blog`, `#contact`, `#resources` — show matching section via `hidden` attribute toggle. If hash starts with `#post-`, extract slug (everything after `#post-`) and load blog post detail. Default to `#home`.
     - Dark mode toggle: on load, check `prefers-color-scheme` media query, set `data-theme` attribute on `<html>` (no persistence — localStorage is sandbox-blocked). Toggle button flips `data-theme` between "light" and "dark" for the session.
     - Load blog posts on hash change to `#blog` or `#post-*` via `posts.js`
     - Smooth scroll-to-top on page change
     - Intersection Observer for lazy-loading content sections
- **Acceptance criteria**: Page loads, all 5 nav links switch views via hash, dark mode toggle works, skeleton states visible on initial render, 44×44px touch targets on nav items
- **QA happy**: Click each nav link → URL hash changes and correct section visible; toggle dark mode → colors switch
- **QA failure**: Clicking nav link does nothing → check hashchange listener; dark mode not working → check data-theme attribute setter
- **Commit**: `feat: add site shell with hash routing and dark mode`

#### TODO-4: ✅ Build Home page
- **References**: Draft topology C4
- **File**: `index.html` (`#view-home` section)
- **Actions**:
  1. Hero section: full-width, headline "We're Leaving America. Here's Why." or similar, subheadline about Brent & Denise's retirement journey, primary CTA button "Read Our Story" (→ `#about`), secondary CTA "Follow Along" (→ `#blog`)
  2. Latest posts section: heading "Latest from the Blog", 3 post card placeholders (actual content loaded dynamically via JS)
  3. Social proof section: embedded Instagram feed widget (placeholder div with id="instagram-feed")
  4. Newsletter section: heading "Join the Journey", brief text, embedded Kit signup form placeholder
  5. All elements use CSS custom properties, skeleton loading for dynamic content
- **Acceptance criteria**: Home page renders hero with both CTAs, latest posts section visible, social proof section present, newsletter CTA visible, responsive at all breakpoints
- **QA happy**: Navigate to `#home` → hero visible, CTA buttons clickable and navigate to correct hash sections
- **QA failure**: Hero missing → check section content; CTA links wrong → fix href values
- **Commit**: `feat: add home page with hero and newsletter CTA`

#### TODO-5: ✅ Build About page
- **References**: User story — Denise retires Dec 2027, Brent has 5 years, moving abroad to save costs
- **File**: `index.html` (`#view-about` section)
- **Actions**:
  1. Page title: "Our Story"
  2. Two-column bio layout on desktop (stacked on mobile):
     - Brent's side: photo placeholder, bio text, his 5-year countdown timeline
     - Denise's side: photo placeholder, bio text, her Dec 2027 countdown timeline
  3. "Why We're Leaving" section: explain cost of living in America, retirement savings challenges, decision to move abroad
  4. "Where We're Going" section: placeholder for future content about destination country
  5. Timeline visual: CSS-based timeline showing key milestones (now → Denise retires → Brent retires → move date → settled)
  6. CTA at bottom: "Follow Our Journey" linking to blog
- **Acceptance criteria**: Both bios render, countdown timelines present, "Why We're Leaving" section explains rationale, timeline graphic displays milestones, responsive layout stacks on mobile
- **QA happy**: Navigate to `#about` → all sections present, timeline shows Dec 2027 and 5-year markers
- **QA failure**: Timeline not visible → check CSS timeline styles; text missing → verify section content
- **Commit**: `feat: add about page with retirement timeline`

### Wave 3: Blog System

#### TODO-6: ✅ Create blog post data structure and sample posts
- **References**: Posts stored as JSON for static consumption
- **Files**: `assets/data/posts.json`, `assets/js/posts.js`
- **Actions**:
  1. Define post schema in `posts.json`:
     ```json
     {
       "posts": [
         {
           "id": "post-1",
           "slug": "why-we-are-leaving-america",
           "title": "Why We're Leaving America",
           "author": "Brent & Denise",
           "date": "2026-07-26",
           "image": "assets/img/blog/placeholder.jpg",
           "alt": "Description",
           "excerpt": "A short preview...",
           "content": "<p>Full HTML content...</p>",
           "tags": ["retirement", "moving-abroad"],
           "social": {
             "instagram": "https://instagram.com/p/...",
             "youtube": "https://youtube.com/..."
           }
         }
       ]
     }
     ```
  2. Create 3-5 sample posts demonstrating different types:
     - Personal intro post (why we're doing this)
     - Practical post (cost comparison US vs abroad)
     - Emotional post (saying goodbye)
     - Resource post (top 5 countries for retirement)
     - Update post (milestone reached)
  3. In `posts.js`:
     - `fetch('assets/data/posts.json')` to load posts data
     - `getPost(slug)` — returns single post object by slug
     - `getPosts(page, perPage)` — returns paginated list
     - `getLatestPosts(count)` — returns most recent N posts
     - `getPostsByTag(tag)` — filter by tag
     - `renderPostCard(post)` — returns HTML string for a post card
     - `renderPost(post)` — returns full HTML for a single post view
     - All functions export via global `window.BlogPosts` object
  4. Include skeleton loading: while posts load, show pulsing card placeholders
- **Acceptance criteria**: `posts.json` has valid JSON with 3-5 posts, `posts.js` exports `BlogPosts` global with all 5 functions, fetching returns correct data
- **QA happy**: `JSON.parse(posts.json)` succeeds, `BlogPosts.getPost('why-we-are-leaving-america')` returns matching object
- **QA failure**: JSON parse error → fix trailing commas or syntax; function undefined → check export
- **Commit**: `feat: add blog data structure and post loader`

#### TODO-7: ✅ Build blog listing page and post detail view
- **References**: AGENTS.md (hash-based routing, max --text-xl heading, no colored side borders, no gradient text)
- **File**: `index.html` (`#view-blog` section), `assets/js/app.js` (routing updates)
- **Actions**:
  1. Blog listing view (`#view-blog`):
     - Header: "Latest Posts" with optional tag filter buttons
     - Post grid: 1 column mobile, 2 columns tablet and above (max 2 columns — AGENTS.md prohibits 3-column identical grids)
     - Each post card: featured image (alt, width, height, loading="lazy"), title (--text-lg), date, excerpt, tags, "Read More" link → `#post-<slug>`
     - Pagination at bottom: "Older Posts" / "Newer Posts" links
     - Skeleton loading: 3 pulsing card shapes
     - Empty state: "No posts yet — check back soon!" with primary action "Follow Us on Instagram"
  2. Post detail view (`#post-<slug>`):
     - Dynamic view: `app.js` parses hash `#post-why-we-are-leaving-america` → extracts slug `why-we-are-leaving-america` → calls `BlogPosts.getPost(slug)`
     - Featured image at top (alt, width, height, loading="lazy")
     - Title (--text-xl max), author, date, tags
     - Full HTML content rendered with rich formatting
     - Social media embed zone: if post has social URLs, render embeds
     - Share buttons: copy link, share via text (no localStorage)
     - "Previous Post" / "Next Post" navigation at bottom
     - Back to blog link
     - Skeleton loading while post loads
     - Error state: "Post not found" with link back to blog
  3. Update hash router to handle `#post-<slug>` pattern (extract slug from the hash string after `#post-`)
- **Acceptance criteria**: Blog listing shows sample posts with correct excerpt, pagination works, clicking post opens detail view, detail view shows full content, social embeds render if present, back navigation works, handles invalid slug gracefully
- **QA happy**: Navigate to `#blog` → see posts; click first post → URL becomes `#post-why-we-are-leaving-america` → full article renders; click "Back to Blog" → returns to listing
- **QA failure**: Hash routing fails for `#post-<slug>` → check hash parsing logic; post not found → verify error state renders; images not lazy-loading → check loading="lazy"
- **Commit**: `feat: add blog listing and post detail views`

### Wave 4: Pages + Integration

#### TODO-8: ✅ Build Contact page and Resources page
- **References**: AGENTS.md (no localStorage/sessionStorage, 44×44px touch targets, skeleton loading)
- **File**: `index.html` (sections `#view-contact` and `#view-resources`)
- **Actions**:
  1. Contact page (`#view-contact`):
     - Page title: "Get in Touch"
     - Text: "We'd love to hear from you — whether you're planning your own retirement abroad, have questions about our journey, or just want to say hi."
     - Contact form: name (required), email (required, `type="email"`), subject, message textarea (required, minlength 10)
     - HTML5 validation: `required` attribute on name, email, message; `type="email"` for email field; `minlength="10"` on message
     - Submit button (44px min height)
     - Form submits via `mailto:hello@brentanddenise.com?subject=...&body=...` with pre-encoded form data
     - Note: mailto works on devices with a configured mail app; silently fails without one. Cloudflare Pages Function (serverless) at `/api/contact` can be added post-deployment for server-side handling.
     - Success feedback triggers immediately on submit click: hide form, show "Thanks! We'll get back to you." message (mailto is fire-and-forget — no callback available)
     - Error state: "Couldn't open your mail app. Please email us directly at hello@brentanddenise.com" (more specific than the original generic "Something went wrong")
  2. Resources page (`#view-resources`):
     - Page title: "Resources for Your Own Journey"
     - Categories as sections:
       - "Retirement Planning" — links to financial planning tools, retirement calculators
       - "Moving Abroad" — visa info, expat communities, shipping services
       - "Cost of Living" — Numbeo, expat cost comparisons
       - "Healthcare" — international insurance providers, travel health tips
     - Each resource: linked title + brief description, external link (`target="_blank" rel="noopener"`)
     - Skeleton loading for any dynamic content
     - Empty state: "Resources coming soon — we're researching and will share what we find."
- **Acceptance criteria**: Contact form renders all fields with labels, submit works via mailto, Resources page has 4 category sections with at least 2 links each, all external links open in new tab with noopener
- **QA happy**: Fill out contact form → click submit → opens default mail client; click resource link → opens in new tab with `rel="noopener"`
- **QA failure**: Form not submitting → check form action; external links missing rel → add `target="_blank" rel="noopener noreferrer"`
- **Commit**: `feat: add contact page and resources page`

#### TODO-9: ✅ Integrate social media and newsletter
- **References**: Librarian research (Instagram embed, Kit newsletter, social feed widgets)
- **File**: `index.html`, `assets/js/app.js`
- **Actions**:
  1. Social media links in header and footer:
     - Instagram → `https://instagram.com/brentanddenise`
     - YouTube → `https://youtube.com/@brentanddenise`
     - X/Twitter → `https://x.com/brentanddenise`
     - TikTok → `https://tiktok.com/@brentanddenise`
     - Each is an icon link with screen-reader text, min 44×44px
  2. Instagram feed embed on home page:
     - Static approach (MVP): create a CSS grid of 4 placeholder photo squares (gray) with a "Follow @brentanddenise on Instagram" link → `https://instagram.com/brentanddenise`
     - Upgrade path: replace with EmbedSocial or Curator.io embed code when ready (create free account, paste embed script into the `#instagram-feed` div)
     - No Instagram API or Graph API calls — keeps it fully static for MVP
  3. Newsletter signup:
     - Static placeholder approach (MVP): inline HTML form in `#newsletter-form` div on home page and footer — heading "Join Our Journey", text "Be the first to know when we post.", `mailto:hello@brentanddenise.com?subject=Subscribe` link styled as a button
     - Upgrade path: create a Kit (ConvertKit) account, build an embed form, replace the `#newsletter-form` contents with Kit's embed code (JS-based). Document Kit CSS overrides needed to match the site's design system.
     - Note: Kit's embed JavaScript adds a render-blocking dependency — account for this in performance testing if upgraded
  4. Social sharing on blog posts:
     - Add share buttons to post detail view: "Share on X", "Copy Link" (via `navigator.clipboard.writeText` — works without localStorage)
- **Acceptance criteria**: Social icons in header and footer (all 4 platforms), each is a clickable link with 44×44px touch target, newsletter signup area present on home page, blog posts have share buttons
- **QA happy**: Click Instagram icon → opens Instagram profile in new tab; newsletter section visible on home page; blog post detail shows share buttons → click "Copy Link" → URL copied to clipboard
- **QA failure**: Link opens in same tab → add `target="_blank"`; clipboard API fails → add fallback "Link copied!" message; icon missing → check HTML structure
- **Commit**: `feat: integrate social media links and newsletter signup`

#### TODO-10: ✅ Add analytics and SEO polish
- **References**: Cloudflare Web Analytics (privacy-first), Open Graph tags, semantic HTML
- **File**: `index.html` (`<head>`), all page content sections
- **Actions**:
  1. Cloudflare Web Analytics:
     - Sign into Cloudflare dashboard → Web Analytics → add site (brentanddenise.com)
     - Copy the beacon snippet (or use Cloudflare's automatic analytics through Cloudflare Pages)
     - Insert into `<head>` of `index.html`
     - For MVP: skip the snippet — Cloudflare Pages auto-detects analytics if enabled in dashboard
  2. SEO:
     - `<title>`: "Brent & Denise — Retiring Abroad: Our Journey from America to..."
     - `<meta name="description">`: tagline about the blog
     - Open Graph tags: `og:title`, `og:description`, `og:image`, `og:url`, `og:type="website"`
     - Twitter Card tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
     - Canonical URL tag
     - Semantic HTML: `<header>`, `<nav>`, `<main>`, `<article>` for blog posts, `<section>`, `<footer>`, proper heading hierarchy (h1 → h2 → h3, no skipping)
     - Sitemap: create `sitemap.xml` in project root listing all pages (must be manually updated when new posts are added)
     - RSS feed: create `feed.xml` in project root — standard Atom/RSS format listing latest 10 posts with title, link, description, date, author (must be manually updated when new posts are added)
  3. Image workflow documentation (add to README):
     - Source image → resize to 1200×630px (OG image ratio) → compress to <200KB → convert to WebP → save to `assets/img/blog/<post-slug>.webp`
     - Reference in posts.json as `"image": "assets/img/blog/<post-slug>.webp"`
     - All images must have meaningful `alt` text describing the content
  4. Performance:
     - Ensure all images have `width`, `height` attributes to prevent CLS
     - Inline critical CSS for above-the-fold content (or keep single CSS file and accept the request — single CSS < 15KB is fine)
     - Defer non-critical JS with `defer` attribute
     - Preload hero image if applicable
     - Verify no render-blocking resources beyond the single CSS file
- **Acceptance criteria**: `<head>` has all OG and Twitter Card tags, semantic HTML elements used throughout, sitemap.xml created, images have width/height, JS is deferred, Lighthouse scores 90+ all categories
- **QA happy**: Run Lighthouse audit → 90+ all categories; view page source → OG tags present, semantic elements used
- **QA failure**: Lighthouse <90 → check render-blocking resources, image dimensions, CLS; missing OG tags → add all required tags
- **Commit**: `feat: add analytics, SEO meta tags, and performance optimizations`

### Wave 5: Deployment

#### TODO-11: ✅ Deploy to Cloudflare Pages and configure domain
- **References**: Cloudflare Pages, custom domain setup
- **File**: N/A (infrastructure setup)
- **Actions**:
  1. Create GitHub repository:
     - `gh repo create brent-and-denise --public --source=. --remote=origin --push`
     - Or via GitHub web UI → create repo → `git remote add origin ... && git push -u origin main`
  2. Cloudflare Pages setup:
     - Log into Cloudflare dashboard → Pages → Create a project → Connect to GitHub
     - Select the `brent-and-denise` repo
     - Build settings: Framework preset = "None" (static), Build output = `/` (root)
     - No build command needed (pure static files)
     - Deploy
  3. Custom domain:
     - Prerequisite: domain `brentanddenise.com` must be registered and accessible (check with `whois brentanddenise.com`). If domain is NOT registered: stop and notify user — domain registration is a prerequisite outside the scope of this plan. Register at a domain registrar (Cloudflare Registrar, Namecheap, etc.) before proceeding.
     - If domain is with another registrar: update nameservers to Cloudflare's (`ns1.cloudflare.com`, `ns2.cloudflare.com`, etc. — visible in Cloudflare dashboard after adding the site)
     - If domain is already on Cloudflare: skip nameserver step
     - In Cloudflare Pages → Custom domains → Add `brentanddenise.com`
     - DNS setup: In Cloudflare Pages → Custom domains → Add `brentanddenise.com` → Cloudflare handles DNS records automatically (CNAME flattening for apex). No manual CNAME record needed — do NOT add one; the Pages UI creates the correct records.
     - Wait for domain verification: Cloudflare adds a TXT record for ownership verification. Confirm in the Cloudflare dashboard that verification is complete before proceeding.
     - Optionally: add a `www` CNAME record targetting `brentanddenise.com` or `<project>.pages.dev` for `www.brentanddenise.com` → redirect to apex
     - Disable DNSSEC at the domain registrar if enabled (DNSSEC + Cloudflare proxy causes resolution failures)
     - Wait for SSL certificate provisioning (automatic, may take up to 24 hours)
     - Verify: `dig +short brentanddenise.com` should return Cloudflare IPs; `curl -I https://brentanddenise.com` should return HTTP 200
  4. Cloudflare Pages Function for contact form (optional post-MVP):
     - Create `/functions/api/contact.js`:
       - `export async function onRequest(context) { ... }`
       - Receives POST form data, sends email via SendGrid/Mailgun/etc.
       - Returns JSON response
     - For MVP: skip this; form uses `mailto:` fallback
  5. Enable Cloudflare Web Analytics from dashboard (no code change needed)
  6. Optional: create `404.html` in project root (Cloudflare Pages serves this for unknown paths — include site nav so users can find their way back)
  7. Optional: create `_redirects` file in project root for future Cloudflare Pages Function support (`/* /index.html 200` — not needed for MVP hash routing but prevents issues if functions are added later)
- **Acceptance criteria**: GitHub repo exists and is pushed, Cloudflare Pages deploys successfully (green check), custom domain resolves to Cloudflare Pages, SSL is active, site loads at `https://brentanddenise.com`
- **QA happy**: Visit `https://brentanddenise.com.pages.dev/` → site loads; after DNS propagates, visit `https://brentanddenise.com/` → site loads with SSL
- **QA failure**: Deployment fails → check build settings (output directory should be `/`); DNS not resolving → verify CNAME record; SSL not working → wait for Cloudflare auto-provisioning (up to 24h)
- **Commit**: `feat: deploy to Cloudflare Pages and configure custom domain`

#### TODO-12: ✅ Final integration, visual QA, and documentation
- **References**: Full workflow verification phase
- **File**: All project files
- **Actions**:
  1. Full smoke test across all pages and features:
     - Navigate every hash route: #home, #about, #blog, #post-<slug>, #contact, #resources
     - Verify dark mode toggle on each page
     - Test all external links open in new tab
     - Verify form submit triggers mailto
     - Test on 375px, 768px, 1024px viewport widths
     - Verify skeleton loading states appear before content loads
     - Verify empty states render when no data (e.g., blog page if posts.json is empty)
     - Verify error states (e.g., invalid post slug)
  2. Lighthouse audit on home page and blog page:
     - Target: 90+ Performance, 95+ Accessibility, 95+ Best Practices, 95+ SEO
     - Fix any issues found
  3. Visual QA:
     - Check all text is readable in both light and dark mode
     - Verify no horizontal scroll at any breakpoint
     - Verify font scale: headings use clamp() values, no heading larger than --text-xl (36px)
     - Verify touch targets: all buttons/links ≥44×44px
  4. Create README.md with:
     - Project description
     - Tech stack summary
     - How to run locally: `npx serve .` or `python -m http.server 8000` (NOT just opening index.html — `fetch()` for posts.json is blocked by CORS on `file://` protocol)
     - How to add a blog post: edit `assets/data/posts.json`, add a post object following the schema, add image to `assets/img/blog/`, commit + push
     - How to deploy (push to GitHub main branch triggers Cloudflare Pages auto-deploy)
     - Domain info
  5. Final commit and push:
     - `git add . && git commit -m "feat: final polish and documentation"`
     - `git push origin main`
- **Acceptance criteria**: All 5 hash routes work, dark mode toggles on all views, Lighthouse 90+/95+/95+/95+, no visual regressions, README documents project, git is clean with everything pushed
- **QA happy**: Full smoke test passes all routes and features, Lighthouse scores meet targets, README exists with meaningful content
- **QA failure**: Any route fails → fix routing; Lighthouse <90 → optimize; README missing → create it
- **Commit**: `feat: final polish and documentation`

## Final verification wave

Run after ALL todos complete:

- **F1 Plan compliance audit**: Verify every todo's acceptance criteria is demonstrably met, every file referenced exists
- **F2 Code quality review**: HTML validates (W3C), CSS validates, JS has no console errors, `posts.json` passes `JSON.parse()`, no hardcoded colors, no localStorage usage, no copyright headers, no inline comments
- **F3 Real manual QA**: Open the deployed site in a real browser, click through every page, toggle dark mode, test responsive at 3 breakpoints, verify Lighthouse scores, test `fetch()` failure by going offline in DevTools
- **F4 Scope fidelity**: Confirm nothing out-of-scope was built, nothing in-scope was skipped

## Commit strategy

| # | Message | Scope |
|---|---|---|
| 1 | `feat: initial project scaffold` | Structure + git init |
| 2 | `feat: add CSS design system with light/dark mode` | CSS foundation |
| 3 | `feat: add site shell with hash routing and dark mode` | Header/footer/JS router |
| 4 | `feat: add home page with hero and newsletter CTA` | Home |
| 5 | `feat: add about page with retirement timeline` | About |
| 6 | `feat: add blog data structure and post loader` | JSON + posts.js |
| 7 | `feat: add blog listing and post detail views` | Blog UI |
| 8 | `feat: add contact page and resources page` | Contact + Resources |
| 9 | `feat: integrate social media links and newsletter signup` | Social + newsletter |
| 10 | `feat: add analytics, SEO meta tags, and performance optimizations` | SEO + perf |
| 11 | `feat: deploy to Cloudflare Pages and configure custom domain` | Deployment |
| 12 | `feat: final polish and documentation` | README + QA |

## Success criteria

1. `https://brentanddenise.com` loads and displays the blog
2. All 5 pages (Home, About, Blog, Contact, Resources) are navigable via hash routing
3. Blog posts render from `posts.json` with listing and detail views
4. Dark mode toggle works on every page
5. Site is fully responsive at 375px, 768px, 1024px
6. Lighthouse scores 90+ across all categories
7. All images have alt text, explicit dimensions, and lazy loading
8. All interactive elements have 44×44px touch targets
9. GitHub repo is public, Cloudflare Pages auto-deploys on push
10. Social media links, newsletter signup, and analytics are integrated
11. No build tools, no runtime dependencies, no database
