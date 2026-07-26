# Brent & Denise — Retiring Abroad

A static blog website documenting our retirement planning journey and move abroad.

## Tech Stack

- **Static HTML/CSS/JS** — no build tools, no frameworks, no runtime dependencies
- **Cloudflare Pages** — free hosting, global CDN, auto-deploy from GitHub
- **Hash-based routing** — single HTML entry point with JavaScript view switching
- **Decap CMS-ready admin** — browser-based editing for blog posts and contact/social settings after GitHub OAuth is configured

## Pages

- **Home** — Hero section, latest blog posts, Instagram feed preview, newsletter CTA
- **About** — Brent & Denise's story, retirement timeline (Denise: Dec 2027, Brent: 5 years), "Why We're Leaving" narrative
- **Blog** — Post listings with pagination, individual post views with share buttons
- **Contact** — Contact form with mailto submission
- **Resources** — Curated links for retirement planning, moving abroad, cost of living, healthcare

## Project Structure

```
├── index.html           # Single HTML entry point (all views)
├── 404.html             # Cloudflare Pages custom 404 page
├── _redirects           # SPA redirect rules
├── sitemap.xml          # SEO sitemap
├── feed.xml             # Atom/RSS feed
├── favicon.ico          # Site favicon
├── admin/               # Decap CMS admin entry point and config
│   ├── index.html
│   └── config.yml
├── assets/
│   ├── css/style.css    # Design system with light/dark mode
│   ├── js/
│   │   ├── app.js       # Hash router, dark mode, blog rendering
│   │   └── posts.js     # BlogPosts API (data loading, rendering)
│   ├── data/
│   │   ├── site.json    # Contact, WhatsApp, and social settings
│   │   └── posts.json   # Blog post content
│   └── img/             # Image assets
│       └── blog/        # Blog post images
└── README.md
```

## Running Locally

**DO NOT open index.html directly** — `fetch()` for blog posts is blocked by CORS on `file://`.

Use a local HTTP server:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Editing Content

The site is set up so Brent and Denise can eventually edit content from `/admin/`.

The admin editor uses Decap CMS and writes changes back to GitHub. Cloudflare Pages then redeploys the static site from the repo.

### Admin Setup Required

Before `/admin/` can be used in production, configure a GitHub OAuth provider for Decap CMS on Cloudflare Pages.

1. Create a GitHub OAuth app for `https://brentanddenise.com/admin/`
2. Deploy a Decap-compatible OAuth bridge as a small Cloudflare Worker
3. Point `cms-auth.brentanddenise.com` at that Worker
4. Make sure both editors have GitHub access to `E3RC/brent-and-denise`
5. Visit `https://brentanddenise.com/admin/` and sign in with GitHub

The admin config is intentionally pointed at `https://cms-auth.brentanddenise.com/auth`. If that Worker is not deployed yet, login will fail there. It should not use Netlify's `api.netlify.com/auth` service because this site is hosted on Cloudflare Pages.

Until that OAuth bridge exists, content can still be edited manually in GitHub.

### Blog Posts

Blog posts live in `assets/data/posts.json`. Existing posts can use HTML content. New posts created through the CMS can use Markdown; the site renders both.

### Contact and Social Settings

Contact, social, newsletter email subject, and the future WhatsApp button are controlled by `assets/data/site.json`.

Email is the primary contact method now. WhatsApp is already modeled in the settings file with `whatsappEnabled`, `whatsappNumber`, and `whatsappLabel`, so it can be turned on later without changing page structure.

## Manual Blog Post Updates

1. Add your image to `assets/img/blog/<post-slug>.webp` (resize to 1200×630px, compress <200KB, WebP format)
2. Add a new post object to `assets/data/posts.json` following the existing schema
3. Update `feed.xml` with the new post entry
4. Commit and push to `master` — Cloudflare Pages auto-deploys

## Deployment

The site auto-deploys from GitHub to Cloudflare Pages on every push to `master`.

### Deploy prerequisites

1. `brentanddenise.com` domain must be registered
2. Cloudflare account with Pages enabled
3. GitHub repo connected to Cloudflare Pages

### Manual deploy steps

1. Push to `master`: `git push origin master`
2. Cloudflare Pages auto-detects the push and deploys
3. Verify at `https://brentanddenise.com`

## Design System

- CSS custom properties for all colors (oklch), spacing (4px scale), typography (clamp() scale)
- Light/dark mode via `data-theme` attribute on `<html>`
- Mobile-first responsive: breakpoints at 376px, 768px, 1024px
- Max heading size: --text-xl (36px clamp)
- All interactive elements: min 44×44px touch targets

## Known Limitations

- **Social media previews**: Hash routing means shared post links show the homepage OG tags, not post-specific previews. Mitigation paths: Cloudflare Worker with HTMLRewriter, static per-post HTML files with redirects, or a prerendering service.
- **Dark mode persistence**: Preference is not saved between sessions (no localStorage). Defaults to system `prefers-color-scheme`.
- **Contact form**: Uses `mailto:` which requires a configured mail app. Cloudflare Pages Function can be added later for server-side handling.
- **CMS login**: `/admin/` is present, but production editing still needs a Decap-compatible GitHub OAuth bridge configured for Cloudflare Pages.

## License

© 2026 Brent & Denise. All rights reserved.
