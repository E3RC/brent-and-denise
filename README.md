# Brent & Denise — Retiring Abroad

A static blog website documenting our retirement planning journey and move abroad.

## Tech Stack

- **Static HTML/CSS/JS** — no build tools, no frameworks, no runtime dependencies
- **Cloudflare Pages** — free hosting, global CDN, auto-deploy from GitHub
- **Hash-based routing** — single HTML entry point with JavaScript view switching; each post also gets a prerendered page at `/post/<slug>`

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
├── sitemap.xml          # SEO sitemap (generated, do not edit by hand)
├── feed.xml             # Atom/RSS feed (generated, do not edit by hand)
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
├── post/                 # Generated static page per post, served at /post/<slug>/
├── scripts/
│   ├── build-content.mjs        # Regenerates post pages, feed, and sitemap
│   ├── generate-post-pages.mjs  # Per-post HTML with real meta and prerendered body
│   └── generate-feeds.mjs       # feed.xml + sitemap.xml
├── DESIGN.md             # Design system: tokens, components, rules
├── README.md
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
3. The post editor opens automatically. Click **Add post** and fill in: **ID** (`post-5`, `post-6`, …), **Slug** (lowercase hyphenated, e.g. `first-week-in-portugal`), **Title**, **Author**, **Publish Date**, **Hero Image** (drag-and-drop), **Alt Text**, **Excerpt** (50–220 chars), **Body** (Markdown), **Tags**, **Social Links**.
4. Click **Publish** — Decap commits to `main` → Cloudflare Pages auto-deploys in ~30 seconds. The post appears on the home page, blog list, and its own `/#post-<slug>` URL. Posts are sorted newest first by publish date, so the new one lands at the top regardless of where it sits in `posts.json`. Then pull the commit locally, run `node scripts/build-content.mjs`, and commit the regenerated `post/`, `feed.xml`, and `sitemap.xml`.

### Local development

```bash
# One-time
npm install -g decap-server

# From the project root, in a separate terminal from your static server:
decap-server
```

Then open `http://localhost:8080/admin/` (served by `decap-server`) while a static server (`npx serve .`) runs on a different port. Edits land in your local checkout instead of GitHub.

### Post pages, feeds and sitemap

Everything derived from `posts.json` is generated by one command:

```bash
node scripts/build-content.mjs
```

That writes three things:

- `post/<slug>/index.html` for every post. These are real URLs with per-post Open Graph tags, a canonical link, and the Markdown body prerendered into HTML, so shares and crawlers get the post rather than the home page. They link back into the app with hash routes.
- `feed.xml`, with entries linking to the real post URLs.
- `sitemap.xml`, listing the home page and every `/post/<slug>` URL.

Run it after each publish (the CMS writes only `posts.json`), then commit the results. The scripts need Node 18+ and have no dependencies. `generate-feeds.mjs` validates the data first: duplicate ids or slugs, malformed dates, missing fields, and missing image files make it exit non-zero and write nothing. `generate-post-pages.mjs` renders a Markdown subset (paragraphs, headings, lists, quotes, links, images, inline emphasis, code), which covers what the CMS produces.

### Photos

The CMS owns photos. The **Hero Image** field accepts a file picker or drag-and-drop, writes the file into `assets/img/blog/`, and stores `assets/img/blog/<file>` in `posts.json`. Publishing is all that is required.

- Crop or export to 16:9, 1600 to 2400 px wide. Cards and post pages crop to 16:9, so a portrait phone photo loses its top and bottom.
- Keep files under about 500 KB. `node scripts/build-content.mjs` warns above that, because originals are committed to git history and every visitor downloads the hero.
- Write real alt text in the CMS field. It is used on cards, post pages, and social previews.
- Once a post has a raster hero (`.jpg`, `.png`, `.webp`, `.avif`), `/post/<slug>/` uses that photo as its Open Graph and Twitter image. While the hero is the SVG placeholder, the post falls back to the shared site card, because social platforms ignore SVG.

The site's generated URLs stay stable through all of this. `/post/<slug>/` is wired from `posts.json` alone, so swapping the placeholder for a real photo needs only a publish and a rebuild.

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

The full spec lives in [DESIGN.md](DESIGN.md): tokens in YAML frontmatter plus sections for colors, typography, layout, elevation, shapes, components, and do's/don'ts. `.impeccable/design.json` carries the extensions that the spec's schema cannot hold (tonal ramps, motion, breakpoints, component snippets).

- One stylesheet, `assets/css/style.css`: tokens, base, layout, and every component. There are no inline `<style>` blocks.
- Field-guide identity: cool mist ground, canopy green accent, reef and sun used only for position. No warm cream and no terracotta.
- Type is self-hosted in `assets/fonts/`: Archivo (400 to 900) for display and controls, Literata (300 to 700) for reading. No Google Fonts request at runtime.
- CSS custom properties for all colors (oklch), spacing (4px scale), typography (clamp() scale)
- Light/dark mode via `data-theme` attribute on `<html>`
- Mobile-first responsive: breakpoints at 376px, 768px, 900px (hero), and 1024px
- Display type runs up to 58px in uppercase; labels are tracked small caps
- All interactive elements: min 44×44px touch targets
- Every text token clears WCAG 4.5:1 against its background in both themes

## Known Limitations

- **Social media previews**: each post has a real page at `/post/<slug>` with its own Open Graph tags, so share that URL. Sharing a `/#post-<slug>` hash link still shows the home page tags, because fragments never reach the server.
- **Sitemap coverage**: `sitemap.xml` lists `/` and every `/post/<slug>` URL, all of which are real paths. Section routes (`/#about`, `/#blog`, and so on) are hash-based and intentionally omitted: crawlers strip fragments, so listing them adds nothing. Migrating the sections to real paths is still the way to make them individually indexable.
- **Dark mode persistence**: Preference is saved for 365 days via cookie (`SameSite=Lax`, no `localStorage`/`sessionStorage`). Defaults to system `prefers-color-scheme` on first visit; the toggle button (sun/moon in the header) flips the preference and a `<head>`-inline script applies it before paint to prevent flash.
- **Contact form**: Uses `mailto:` which requires a configured mail app. Cloudflare Pages Function can be added later for server-side handling.
- **Content management**: Posts are edited in-browser through Decap CMS at `/admin/` (see "Authoring Posts" above). The CMS is git-backed: every publish is a commit to `main` that triggers a Cloudflare Pages redeploy. The "Editor" link in the footer takes authors to the CMS.
- **Generated content is manual**: the CMS writes only `posts.json`. After each publish, pull the commit, run `node scripts/build-content.mjs`, and commit `post/`, `feed.xml`, and `sitemap.xml` (see [Post pages, feeds and sitemap](#post-pages-feeds-and-sitemap)).
- **No automated tests**: verification is serving the site locally and checking the rendered views and browser console. The generator scripts validate post data, but there is no test suite for the router or views.
- **Editorial-workflow preview deploys**: Each "Save Draft" creates a Cloudflare Pages preview deploy. Disable preview deploys for non-`main` branches in Cloudflare Pages settings to suppress the noise (see the Authoring Posts section).

## License

© 2026 Brent & Denise. All rights reserved.
