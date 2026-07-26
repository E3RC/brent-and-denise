---
slug: blog-website
intent: unclear
review_required: true
status: awaiting-approval
pending_action: write .omo/plans/blog-website.md
approach: Static HTML/CSS/JS blog SPA with JSON-driven content, Cloudflare Pages hosting
created: 2026-07-26
---

# Draft: brentanddenise.com Blog Website

## Routing

- **Intent**: UNCLEAR — bootstrap project, fuzzy outcome (user wants a blog/influencer site but needs defaults)
- **Review required**: TRUE (UNCLEAR path auto-runs high-accuracy review)

## Components Ledger

| ID | Component | Outcome | Status | Evidence |
|---|---|---|---|---|
| C1 | Git repo + GitHub remote | Project is version-controlled and pushed to GitHub | Assumed | User requested "make it a GitHub repository" |
| C2 | Static SPA index.html | Single HTML entry point with hash-based routing for all pages | Default | AGENTS.md convention for this workspace |
| C3 | Design system | CSS custom properties, light/dark mode, mobile-first, clamp() scale | Default | AGENTS.md conventions |
| C4 | Home page | Hero, latest posts preview, social proof, newsletter CTA | Default | Standard blog pattern |
| C5 | About page | Brent & Denise story, retirement plans, moving abroad narrative | Default | Core content requested by user |
| C6 | Blog system | Posts stored in JSON, listing page + post detail view with pagination | Default | Standard static blog pattern |
| C7 | Social media integration | Links to profiles + embedded social feed widgets | Default | "Typical influencer setup" |
| C8 | Newsletter signup | Email capture form integrated with Kit (or similar) | Default | Community-building best practice |
| C9 | Contact page | Form or contact info | Default | Standard site section |
| C10 | Resources page | Links to tools, services, recommendations for expats/retirees | Default | Relevant to the niche |
| C11 | Deployment | Cloudflare Pages with custom domain + SSL | Default | Best free hosting option for static sites |
| C12 | Analytics | Privacy-focused analytics (Plausible or Cloudflare Web Analytics) | Default | Measure engagement without invading privacy |

## Open Assumptions Ledger

| # | Assumption | Default | Rationale | Reversible? | Notes |
|---|---|---|---|---|---|
| A1 | Tech stack | Static HTML/CSS/JS (no build tools) | Follows workspace conventions; zero build complexity; blogs managed via JSON data file | Yes — could migrate to Astro/Ghost later | AGENTS.md: "Static HTML/CSS/JS unless otherwise specified" |
| A2 | Routing | Hash-based (#home, #about, #blog, #post-slug) | Single HTML entry, no server config needed | Yes | AGENTS.md: "Hash-based routing (#view-name)" |
| A3 | Hosting | Cloudflare Pages (free tier) | Unlimited bandwidth, global CDN, Cloudflare acquired Astro team in 2026 — solid ecosystem | Yes — could move to Netlify/Vercel anytime | $0/mo, custom domain, SSL included |
| A4 | Blog content | JSON data files (assets/data/posts.json) | No database, no CMS, static-friendly, easy to edit | Yes — could add git-based CMS later | Content creator (developer) manages posts |
| A5 | Newsletter | Kit (ConvertKit) free tier | 10K free subscribers, unlimited sends, creator-focused | Yes — could switch to Ghost/Beehiiv | Free up to 10K subs |
| A6 | Analytics | Cloudflare Web Analytics (free, privacy-first) | No cookie consent needed, no GDPR hassle | Yes — could add Plausible/Umami | Free, privacy-preserving |
| A7 | Social media | Instagram + YouTube + X/Twitter embeds; link pages for TikTok/Facebook | Most relevant platforms for retirement/moving-abroad content | Yes | User can add/remove platforms |
| A8 | Social proof | Embedded social feed widget (e.g., Curator.io or EmbedSocial) on homepage | Shows latest Instagram posts as social proof | Yes | Free tier available |
| A9 | Footer layout | Links, newsletter signup, copyright, social icons | Standard blog footer pattern | Yes | Reversible |
| A10 | Color palette | Warm earth tones (retirement/comfort theme) + accent color | Appropriate for retirement/lifestyle content | Yes — easy to change CSS variables | Default choice; user can veto |

## Research Summary

- Workspace conventions (AGENTS.md): Static HTML/CSS/JS, single HTML entry, hash-based routing, no build tools, light+dark mode mandatory, mobile-first, CSS custom properties
- Blog architecture research: Ghost CMS ($15/mo managed) vs Astro+Cloudflare ($0/mo) vs Static SPA (build-tool-free, follows conventions)
- Chosen approach: Static SPA with JSON-driven blog content — simplest architecture, follows workspace conventions, $0/mo hosting, full control

## Gate State

- [x] Exploration complete
- [x] Topology locked (12 components)
- [x] Assumptions recorded (10 defaults)
- [x] Plan written and filled
- [x] Metis gap analysis done — 22 gaps identified, all critical/high folded into plan
- [x] High-accuracy dual review:
  - [x] Momus: APPROVE (Round 2 — all 15 changes verified)
  - [x] Oracle: APPROVE (Round 2 — all 7 requested changes addressed)
- [x] User approval received (prior: "seems like a solid plan")
- [x] Plan complete and ready for execution
