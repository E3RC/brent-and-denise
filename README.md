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
├── admin/
│   ├── index.html       # Decap CMS loader page (served at /admin/)
│   └── config.yml       # Decap CMS schema (post fields, Git Gateway backend)
├── assets/
│   ├── css/style.css    # Design system with light/dark mode
│   ├── js/
│   │   ├── app.js       # Hash router, dark mode, blog rendering
│   │   └── posts.js     # BlogPosts API (data loading, markdown rendering)
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

## Authoring Posts (Decap CMS)

Blog posts are managed through [Decap CMS](https://decapcms.org/) — a git-based, browser-only visual editor that runs at `https://brentanddenise.com/admin/`. Authors sign in via Netlify Identity and write posts in a friendly editor; no JSON editing required.

The CMS writes new posts back to `assets/data/posts.json`. After a publish, Cloudflare Pages auto-deploys the site within ~30 seconds.

### One-time setup

The CMS is already deployed to `/admin/` on Cloudflare Pages, but to enable sign-in and commit-to-GitHub you need to wire up Netlify Identity once:

1. **Create a free Netlify account** at https://app.netlify.com. Netlify does not need to host the site — Cloudflare Pages still hosts everything; we only use Netlify for Identity.
2. **Add a Netlify "site" connected to this GitHub repo**: `Site settings → Build & deploy → Continuous deployment → Link repository → GitHub`. Build command: leave empty. Publish directory: `.`.
3. **Enable Identity**: `Identity → Enable`.
4. **Enable Git Gateway**: `Identity → Services → Git Gateway → Enable`. Authorize Netlify to access this GitHub repo when prompted.
5. **Invite authors** (Brent, Denise): `Identity → Identity tab → Invite users`. Each invitee receives a confirmation email first — they click it, then set a password, then sign in at `/admin/`.
6. **Lock registration to invite-only**: `Site settings → Identity → Registration preferences → Registration mode: Only invited users can create accounts`. Do NOT leave it on "Open" — that lets any visitor self-register.
7. **Stop Netlify's parallel deploys** (we use Netlify only for identity, not hosting): `Site settings → Build & deploy → Build settings → Stop builds`. Cloudflare Pages remains the real deploy target.

After step 7, the editor at `https://brentanddenise.com/admin/` will accept sign-ins via Netlify Identity and commit posts directly to GitHub on `main`.

### Publishing a post

1. Visit `https://brentanddenise.com/admin/` (also reachable from the small "Editor" link in the footer).
2. Sign in with the email you were invited at.
3. Click **New Post** and fill in: **ID** (`post-5`, `post-6`, …), **Slug** (lowercase hyphenated, e.g. `first-week-in-portugal`), **Title**, **Author**, **Publish Date**, **Hero Image** (drag-and-drop), **Alt Text**, **Excerpt** (50–220 chars), **Body** (Markdown), **Tags**, **Social Links**.
4. Click **Publish** — Decap commits to `main` → Cloudflare Pages auto-deploys in ~30 seconds. The post appears on the home page, blog list, and its own `/#post-<slug>` URL.

### Save as draft

The configuration uses **editorial workflow** (Draft → In Review → Ready). To save without publishing, click **Save draft** instead of **Publish**. Drafts are committed to a `cms/<branch>` PR-style branch; promoting to Ready merges to `main`.

⚠️ **Preview-deploy noise**: Every draft save creates a new branch which Cloudflare Pages will build into a preview URL like `<hash>.brent-and-denise.pages.dev`. To suppress these, in Cloudflare Pages: `Settings → Builds → Preview deployments → Disable for non-production branches`. Drafts still work; you just won't see a preview URL per save.

### Local development

```bash
# One-time
npm install -g decap-server

# From the project root, in a separate terminal from your static server:
decap-server
```

Then open `http://localhost:8080/admin/` (served by `decap-server`) while a static server (`npx serve .`) runs on a different port. Edits land in your local checkout instead of GitHub.

### Updating the RSS feed

`feed.xml` is currently hand-maintained. After publishing a new post, append a new `<entry>` block to `feed.xml` with the post's title, link, id, and updated date. See the existing entries for the format. (A script that auto-regenerates `feed.xml` from `posts.json` is a future improvement; the per-post `body` markdown in the CMS is already ready for it to consume.)

## Privacy & Security Notes

- The CMS at `/admin/` exposes only a sign-in screen to anonymous visitors — no data leak.
- `<meta name="robots" content="noindex,nofollow">` on `admin/index.html` keeps the editor URL out of search results.
- Markdown bodies are rendered by `marked@13.0.3` then sanitized by `dompurify@3.1.7` (subresource-integrity-pinned) — disallowed tags and `javascript:` URIs are stripped before insertion.
- External links from posts open in a new tab with `rel="noopener noreferrer"` so reader main windows stay safe.

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
- **Sitemap coverage**: `sitemap.xml` declares `/`, `/#about`, `/#blog`, `/#contact`, and `/#resources`, but the major crawler implementations (Google, Bing) strip fragment identifiers from `<loc>` and treat all of them as `https://brentanddenise.com/`. The 4 hash-route entries are aspirational until the routing is migrated to real URL paths; only the home page is meaningfully indexable today.
- **Dark mode persistence**: Preference is saved for 365 days via cookie (`SameSite=Lax`, no `localStorage`/`sessionStorage`). Defaults to system `prefers-color-scheme` on first visit; the toggle button (sun/moon in the header) flips the preference and a `<head>`-inline script applies it before paint to prevent flash.
- **Contact form**: Uses `mailto:` which requires a configured mail app. Cloudflare Pages Function can be added later for server-side handling.
- **Content management**: Posts are edited in-browser through Decap CMS at `/admin/` (see "Authoring Posts" above). The CMS is git-backed: every publish is a commit to `main` that triggers a Cloudflare Pages redeploy. The "Editor" link in the footer takes authors to the CMS.
- **`feed.xml` is hand-maintained**: After publishing a new post via Decap, append a new `<entry>` block to `feed.xml` for RSS subscribers. Auto-regenerating it from `posts.json` is a planned improvement.
- **Editorial-workflow preview deploys**: Each "Save Draft" creates a Cloudflare Pages preview deploy. Disable preview deploys for non-`main` branches in Cloudflare Pages settings to suppress the noise (see the Authoring Posts section).

## License

© 2026 Brent & Denise. All rights reserved.
