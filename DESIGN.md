---
name: Brent & Denise — Retiring Abroad
description: A personal retirement blog with an editorial, sun-baked warmth.
colors:
  terracotta-rust: "oklch(0.5 0.16 50)"
  clay-paper: "oklch(0.958 0.014 48)"
  plaster-surface: "oklch(0.986 0.008 55)"
  ink-umber: "oklch(0.24 0.025 45)"
  faded-umber: "oklch(0.46 0.03 45)"
  dusk-clay: "oklch(0.17 0.02 45)"
  ember: "oklch(0.72 0.15 55)"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', Times, serif"
    fontSize: "clamp(1.5rem, 1.125rem + 1.875vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(1rem, 0.9375rem + 0.3125vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(0.875rem, 0.8125rem + 0.3125vw, 0.9375rem)"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "4px"
  md: "8px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.terracotta-rust}"
    textColor: "{colors.plaster-surface}"
    rounded: "{rounded.sm}"
    padding: "8px 24px"
    height: "44px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.terracotta-rust}"
    rounded: "{rounded.sm}"
    padding: "8px 24px"
    height: "44px"
  tag-filter:
    backgroundColor: "transparent"
    textColor: "{colors.faded-umber}"
    rounded: "{rounded.sm}"
    padding: "4px 16px"
    height: "44px"
  post-card:
    backgroundColor: "{colors.plaster-surface}"
    textColor: "{colors.ink-umber}"
    rounded: "{rounded.sm}"
    padding: "16px"
  input:
    backgroundColor: "{colors.plaster-surface}"
    textColor: "{colors.ink-umber}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
    height: "44px"
---

# Design System: Brent & Denise — Retiring Abroad

## Overview

**Creative North Star: "The Sun-Baked Letter"**

The site reads like a letter written from a warmer place: clay-toned paper, ink-brown prose, and serif headings that carry a human voice. It is a reading surface first. Every screen exists so a visitor can follow one couple's move abroad, so ornament stays out of the way of the sentences.

Warmth comes from the palette and the serif, not from decoration. Surfaces are flat and separated by hairlines. There are no gradients, shadows in active use, or illustrated scenes. The terracotta accent is the only saturated color on the page, and it marks what can be acted on: buttons, links, the current filter, the active timeline marker.

The system was rebuilt from the incumbent implementation. It preserves the original identity of warm ground plus serif voice, and moves the background from a neutral cream to a rosier clay paper. The Impeccable detector still reads any warm light background as a cream palette; that warning is accepted deliberately here, because the warm ground is the identity the brief asks for and the accent, text, and surface tokens carry the contrast work.

**Key Characteristics:**
- Clay paper ground, ink umber text, one terracotta accent.
- Georgia for headings, the platform sans for body and labels.
- Flat surfaces with 1px alpha borders; no shadows in practice.
- 44px minimum touch targets everywhere.
- Mobile-first, two-column grid only from 768px.

## Colors

A single-hue warm family, stepped by lightness: clay paper and plaster for surfaces, umber for text, rust for action.

### Primary
- **Terracotta Rust**: the one accent. Buttons, links, active filter state, focus ring, timeline marker. It is deliberately darker than a display orange so text on it stays legible.

### Neutral
- **Clay Paper**: page background in light mode. Warm but pink-shifted, not the standard cream.
- **Plaster Surface**: cards, inputs, and the inner border of the timeline marker. One step lighter than the page.
- **Ink Umber**: headings and body text.
- **Faded Umber**: dates, meta lines, secondary descriptions. Chosen to clear 4.5:1, not to look grey.
- **Dusk Clay**: page background in dark mode.
- **Ember**: the accent in dark mode. Brighter than the light-mode rust because it sits on a dark ground.

### Named Rules
**The One Accent Rule.** Terracotta covers under 10 percent of any screen. If a second element wants it, that element wants an underline, a border, or weight instead.

**The Contrast Floor Rule.** Body and meta text clear 4.5:1, and so does light text on accent fills. Test the accent as link text on the page background before using it as a background.

## Typography

**Display Font:** Georgia (with Times New Roman, Times, serif)
**Body Font:** the platform sans stack (Segoe UI, Roboto, Helvetica)
**Label Font:** the same sans stack, at label sizes and weights

**Character:** a literary serif for names and titles against a plain reading sans. The pairing says personal essay, not product page.

### Hierarchy
- **Display** (700, clamp 24px to 36px, 1.3): page titles and post titles. Capped at 36px; the scale never gets theatrical.
- **Title** (700, clamp 18px to 22px, 1.3): section headings and card titles.
- **Body** (400, clamp 16px to 18px, 1.6): prose. Post content is held to 720px, about 70 characters at desktop size.
- **Label** (600, clamp 14px to 15px, 1.2): buttons, filters, metadata, form labels.

### Named Rules
**The Voice Is Serif Rule.** Headings and the site name are serif. Everything that behaves like a control or a caption is sans. Do not set a button in Georgia.

## Layout

A single centered column, max 1040px, with 16px gutters rising to 24px, 32px, then 48px at 376px, 768px, and 1024px. Sections stack with 64px separation. Cards and post lists switch to two columns at 768px and never exceed two. Post bodies narrow to 720px regardless of viewport. The mobile header wraps: logo on its own line, nav beneath, theme toggle top right.

## Elevation & Depth

The system is flat. Depth is a hairline border and a one-step surface change, never a shadow. Shadow tokens exist in CSS from the original build but no component uses them; treat them as unused and do not add elevation without replacing this rule deliberately.

## Shapes

Controls are 4px radius; cards, images, and the inner focus ring use 8px. Pills appear only on small controls and filters. Borders are 1px at 12 to 15 percent alpha, which keeps them visible on both themes without reading as lines. Dashed frames are not used as decoration; a dashed border means "placeholder".

## Components

### Buttons
- **Shape:** 4px radius, 44px minimum height, padding 8px by 24px, 600 weight.
- **Primary:** terracotta fill, plaster text, 150ms opacity hover at 0.85 to 0.9.
- **Secondary:** transparent fill, terracotta text and 1px border, same hover.
- **Ghost/link:** text-only read-more and back links; 44px hit area, no underline at rest.

### Chips (tag filter)
Unselected chips are transparent with a hairline border and faded text; selected chips keep the border, switch to terracotta, and show a count in a smaller size. Height is 44px so they remain touch-safe when they wrap on mobile.

### Cards / Containers
- **Corner Style:** 4px on post cards, 8px on bio cards.
- **Background:** plaster over clay paper.
- **Shadow Strategy:** none; see Elevation.
- **Border:** 1px hairline.
- **Internal Padding:** 16px (cards), 24px (bio cards).

### Inputs / Fields
Plaster fill, 1px hairline border, 4px radius, 44px minimum height, 12px by 8px padding. Focus shifts the border to terracotta and drops the default outline, with a 2px focus ring token for keyboard users.

### Navigation
Sans, 600 weight, 14 to 15px, 44px minimum height. The current page is indicated by a surface fill and full-strength text, not by an underline. Nav wraps to its own row under 768px; social icon links stay in one row at 44px targets.

### Post page
Back link, hero image at 16:9, serif title, meta line with author and human-readable date, then Markdown body at 720px. Share buttons sit below the body in a bordered row; the copy control confirms success in accent text for 2.4 seconds.

## Do's and Don'ts

### Do:
- **Do** keep the accent under 10 percent of the viewport and use it to mark action.
- **Do** verify any new text color against its actual background, including dark mode.
- **Do** keep interactive targets at 44px minimum, including wrapped chips.
- **Do** use the 4px spacing scale and the existing 64px section rhythm.

### Don't:
- **Don't** add shadows, gradients, glass, or glow effects.
- **Don't** set controls or captions in Georgia.
- **Don't** use dashed borders except for deliberate placeholders.
- **Don't** exceed two columns for cards or raise display type above 36px.
- **Don't** introduce a second accent color.
