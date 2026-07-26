# Brent & Denise — Retiring Abroad

A static blog website documenting our retirement planning journey and move abroad.

## Tech Stack

- **Static HTML/CSS/JS** — no build tools, no frameworks, no runtime dependencies
- **Cloudflare Pages** — free hosting, global CDN, auto-deploy from GitHub
- **Hash-based routing** — single HTML entry point with JavaScript view switching

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
├── assets/
│   ├── css/style.css    # Design system with light/dark mode
│   ├── js/
│   │   ├── app.js       # Hash router, dark mode, blog rendering
│   │   └── posts.js     # BlogPosts API (data loading, rendering)
│   ├── data/
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

## Adding a Blog Post

1. Add your image to `assets/img/blog/<post-slug>.webp` (resize to 1200×630px, compress <200KB, WebP format)
2. Add a new post object to `assets/data/posts.json` following the existing schema
3. Update `feed.xml` with the new post entry
4. Commit and push to `main` — Cloudflare Pages auto-deploys

## Deployment

The site auto-deploys from GitHub to Cloudflare Pages on every push to `main`.

### Deploy prerequisites

1. `brentanddenise.com` domain must be registered
2. Cloudflare account with Pages enabled
3. GitHub repo connected to Cloudflare Pages

### Manual deploy steps

1. Push to `main`: `git push origin main`
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
- **Content management**: Posts are edited directly in JSON. For non-technical content management, consider adding Decap CMS (git-based visual editor).

## License

© 2026 Brent & Denise. All rights reserved.
