---
name: Brent & Denise — Retiring Abroad
description: A field guide to a move abroad, drawn from rainforest, reef, and limestone.
colors:
  mist: "oklch(0.955 0.010 170)"
  paper: "oklch(0.988 0.004 170)"
  paper-alt: "oklch(0.972 0.008 170)"
  basalt: "oklch(0.22 0.02 190)"
  lichen: "oklch(0.42 0.02 185)"
  canopy: "oklch(0.42 0.09 155)"
  canopy-deep: "oklch(0.32 0.08 155)"
  reef: "oklch(0.55 0.10 210)"
  sun: "oklch(0.72 0.13 75)"
  night: "oklch(0.17 0.012 190)"
  fern: "oklch(0.78 0.12 155)"
typography:
  display:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 3.4vw, 3.6rem)"
    fontWeight: 800
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Literata, Georgia, Times New Roman, serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.0625rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Archivo, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  sm: "2px"
  md: "4px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.canopy}"
    textColor: "{colors.mist}"
    rounded: "{rounded.sm}"
    padding: "8px 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.canopy}"
    rounded: "{rounded.sm}"
    padding: "8px 24px"
    height: "44px"
  tag-filter:
    backgroundColor: "transparent"
    textColor: "{colors.lichen}"
    rounded: "{rounded.sm}"
    padding: "0 16px"
    height: "44px"
  post-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.basalt}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.basalt}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "44px"
---

# Design System: Brent & Denise — Retiring Abroad

## Overview

**Creative North Star: "The Field Guide"**

The site is a field guide for a move, not a travel brochure. It borrows the discipline of an expedition log: cool mist light, hairline rules, square waypoint markers, and a route profile that shows the journey in one glance. The three landscapes behind the identity are the Costa Rican canopy, the Belizean reef, and Italian limestone, which appear as the canopy green accent, the reef teal waypoint, and the sun-marked current position.

Warmth is not the strategy here. The ground is intentionally cool, and the accents carry the climate: deep canopy green for action, reef teal and a single sun ochre for position. Headings are expedition signage in Archivo caps; prose is set in Literata for long reading. The only ornament is structural: rules, ticks, and a drawn route.

This world replaced a warm cream, Georgia, terracotta system that sat directly on the model-default cluster. The replacement was deliberate, and the old palette is an anti-reference.

**Key Characteristics:**
- Cool mist ground, basalt text, canopy green action.
- Archivo caps for display and controls, Literata for reading.
- Flat surfaces with hairline borders and 2px structural rules.
- Square markers, not circles, for waypoints and the current stop.
- One authored motion: the route profile draws once on load.

## Colors

A cool light family with three landscape accents, each with one job.

### Primary
- **Canopy**: links, primary buttons, active filter fill, focus ring. It is the action color and the only accent used for interactive text.

### Secondary
- **Reef Teal**: the 2027 waypoint in the route profile, and future-facing markers. Never used for text.

### Tertiary
- **Sun Ochre**: the current position marker and the current timeline stop. Never used for text on light surfaces.

### Neutral
- **Mist**: page background in light mode.
- **Paper** and **Paper Alt**: cards, inputs, code, and inset blocks.
- **Basalt**: headings and body text.
- **Lichen**: dates, meta, secondary descriptions.
- **Night**: page background in dark mode, with **Fern** replacing Canopy.

### Named Rules
**The Cool Ground Rule.** The light background stays cool. Any warm near-white returns the site to the cluster it was rebuilt to escape.

**The One Action Color Rule.** Canopy marks what can be acted on. Reef and sun are for position and sequence only; if they appear on a control, the sequence is lying.

## Typography

**Display Font:** Archivo (self-hosted latin subset, weights 400 to 900)
**Body Font:** Literata (self-hosted latin subset, weights 300 to 700)

**Character:** signage plus reading. Archivo gives the page a trailhead placard voice; Literata keeps a long post readable at 68 characters. Neither is a system fallback in practice.

### Hierarchy
- **Display** (800, clamp 36px to 58px, 1.08, -0.02em, uppercase): page and post titles.
- **Title** (700, clamp 22px to 28px, 1.08): section headings and card titles.
- **Body** (400, 16px to 17px, 1.7): prose, capped at 68ch.
- **Label** (600, 11.5px to 12px, 0.1em tracking, uppercase): nav, buttons, filters, dates, metadata.

### Named Rules
**The Two-Voice Rule.** Archivo for anything that behaves like signage or a control; Literata for anything meant to be read at length. Do not set a paragraph in Archivo or a button in Literata.

**The Caps Budget Rule.** Uppercase is reserved for display, labels, and short headings. No uppercase body copy, no all-caps paragraphs.

## Layout

One centered column, max 1120px, gutters from 20px to 48px. Sections separate with 64px. The hero is a two-column grid from 900px: copy left, route profile right. Post lists are one column to 768px, two from there, never three. Post bodies narrow to 68ch. The mobile header keeps the logo and theme toggle on one row, with nav wrapping beneath.

## Elevation & Depth

Strictly flat. There are no shadows in the system. Depth comes from three devices only: a 1px hairline for component edges, a 2px rule for structural divisions (header bottom, footer top, post navigation), and a one-step surface change for insets. The route profile draws with a single 1100ms stroke animation, disabled under `prefers-reduced-motion`.

## Shapes

Controls use a 2px radius; cards and inputs that hold content use 4px; cards read as plates rather than pills. Waypoints, timeline markers, and the profile ticks are square, which is the identity's strongest form cue. Dashed borders are reserved for genuine placeholders, such as the unresolved destination. Circular forms appear only in the social icons and the placeholder camera glyph.

## Components

### Buttons
- **Shape:** 2px radius, 44px minimum height, 8px by 24px padding, uppercase Archivo at 0.08em tracking.
- **Primary:** canopy fill, mist text; hover shifts to canopy-deep.
- **Secondary:** transparent with a 1px canopy border and canopy text; hover fills canopy.

### Chips (tag filter)
Transparent with a 1px border and lichen text; the active chip inverts to a canopy fill with mist text, and the count stays legible at 0.75 opacity. 44px tall so wrapped rows remain touch-safe.

### Cards / Containers
- **Corner Style:** 4px.
- **Background:** paper over mist.
- **Border:** 1px hairline, strengthening on hover or focus-within.
- **Shadow Strategy:** none.
- **Internal Padding:** 20px.

### Inputs / Fields
Paper fill, 1px hairline, 2px radius, 44px minimum height, 12px by 8px padding, Literata. Focus moves the border to canopy and keeps a 2px focus ring.

### Navigation
Uppercase Archivo at 0.78rem with 0.08em tracking, 44px rows. The current page is marked by a 2px canopy underline, not a fill. Social icons stay at 44px squares.

### Route profile
The signature component: a 560 by 300 SVG with a hairline baseline, three ticks, a filled area at 9 percent canopy, a 2px route line, and square waypoints (sun for now, reef for 2027, outlined for 2031). It is decorative and aria-hidden; the caption carries the meaning in text, and it sits beside the hero copy on desktop.

### Post page
Back link, 16:9 image with a hairline border, display title, uppercase meta line, Serif body at 68ch, then a 2px-ruled post navigation row and share controls.

## Do's and Don'ts

### Do:
- **Do** keep the light ground cool and the accents to their assigned roles.
- **Do** verify contrast for body, meta, and text on accent fills in both themes.
- **Do** keep every target at 44px, including wrapped chips and waypoints in the header.
- **Do** use square markers for sequence and position.
- **Do** let the route profile be the page's one drawn moment.

### Don't:
- **Don't** return to warm cream, beige, or terracotta.
- **Don't** set headings in a system serif or body copy in the display face.
- **Don't** add shadows, gradients, glass, or glow.
- **Don't** use reef or sun for interactive text.
- **Don't** round cards beyond 4px or turn markers into circles.
