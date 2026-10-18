# Product: Brent & Denise — Retiring Abroad

## What this is

A personal blog by Brent and Denise, a married couple in suburban Ohio planning to retire abroad. Denise retires in December 2027 after thirty-two years in public education. Brent retires in 2031, waiting for full retirement age because it nearly doubles his Social Security benefit. They are researching where to go, cutting their overhead, and writing about the numbers as they go.

## Who it is for

People their age who are considering the same move, plus family and friends following along. Readers arrive from a shared link or a search for something like "cost of living in Portugal" or "retire abroad on a pension." They want specifics: money, visas, healthcare, and an honest account of what the move costs.

## What it has to do

1. Let a reader find a post and read it without friction, on a phone, in one hand.
2. Make the numbers legible. Posts carry dollar and euro figures; they must be easy to scan and hard to misread.
3. Feel like it was written by two specific people, not by a content operation.
4. Give authors a browser editor (Decap at `/admin/`) that publishes without touching JSON.
5. Stay static: no build step required to serve the site, no runtime dependencies beyond two pinned CDN scripts for Markdown.

## Voice

First person plural, plain, occasionally dry. They are not lifestyle influencers and the site should not sound like one: no hype, no exhortation, no "embark on a journey of discovery." Dates and figures are facts; feelings are theirs.

## Constraints

- Static hosting on Cloudflare Pages, deployed from GitHub `main`.
- 44px minimum touch targets.
- Both light and dark themes, preference persisted in a cookie.
- Accessibility floor: WCAG AA contrast for text, keyboard-operable controls, visible focus.
- The existing URL structure must keep working: hash routes for sections, `/post/<slug>/` for posts.

## Visual direction (set 2026-10-18)

Adventure and the outdoors, drawn from three landscapes the couple is drawn to: the Costa Rican canopy, the Belizean reef, and Italian limestone. The site should feel like a field guide for a move, not a travel brochure. Not a wellness brand, not a startup landing page, and explicitly not the warm-cream, serif, terracotta look that dominates AI-generated personal sites.

## Non-goals

- No booking, affiliate commerce, comments, or memberships.
- No customer dashboard, search, or account system.
- No photographic hero until real photographs of Brent and Denise exist.
