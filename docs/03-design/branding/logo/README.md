---
id: REF-022
title: Logo Assets and Usage
type: reference
status: approved
version: 2.0
owner: design
audience:
  - developer
  - design
tags:
  - logo
  - assets
  - branding
  - svg
---

# Logo Assets and Usage

## Table of Contents

- [1. Asset Inventory](#1-asset-inventory)
- [2. Design Concept](#2-design-concept)
- [3. Construction](#3-construction)
- [4. Clear Space and Minimum Sizes](#4-clear-space-and-minimum-sizes)
- [5. Usage Rules](#5-usage-rules)
- [6. Editing the Wordmark](#6-editing-the-wordmark)
- [7. Use in the Application](#7-use-in-the-application)
- [8. Related Documents](#8-related-documents)

## 1. Asset Inventory

| File | Size | Usage |
| --- | --- | --- |
| [logo.svg](logo.svg) | 360 × 96 | Primary lockup with its own navy background. Use where the background is unknown, for example README files. |
| [logo-dark.svg](logo-dark.svg) | 360 × 96 | Transparent lockup for dark surfaces (`#0F172A`, `#1E293B`). |
| [logo-light.svg](logo-light.svg) | 360 × 96 | Transparent lockup for light surfaces (`#F8FAFC`, `#FFFFFF`). |
| [logo-icon.svg](logo-icon.svg) | 64 × 64 | Icon mark: favicon, application header, avatars. |
| [source/](source/) | — | Editable lockups with live text (see Section 6). |
| [candidates/](candidates/README.md) | — | Concepts considered and evaluation. |

The text in the three lockups is converted to outlines, so they render identically without the brand fonts installed.

## 2. Design Concept

*Rasadgah* (رصدگاه) is Persian for "observatory". The mark combines three ideas:

1. **Dome** — the observatory, the place from which KPIs are watched.
2. **Rising bars** — the KPIs, in increasing opacity from left to right.
3. **Telescope and star** — the tube points at an amber star, the target each KPI is measured against.

The wordmark "Rasadgah" is set in Outfit Bold, the tagline "KPI OBSERVATORY" in Inter SemiBold with 4 px letter spacing.

## 3. Construction

On the 64 × 64 grid of [logo-icon.svg](logo-icon.svg):

| Element | Geometry | Colour |
| --- | --- | --- |
| Tile | 64 × 64, corner radius 14 | `navy-900` `#0F172A` |
| Dome | Arc, centre (32, 44), radius 22, stroke 4 | `sky-400` `#38BDF8` |
| Base | 52 × 5 at (6, 44), radius 2.5 | `sky-400` |
| Bars | 6 px wide, heights 7 / 11 / 15, opacity 55 % / 80 % / 100 % | `sky-400` |
| Telescope | (40.5, 24.5) → (46, 14.5), stroke 4.5 | `sky-400` |
| Star | Four-point star centred at (51, 9), radius 6.5 | `star-400` `#FBBF24` |

## 4. Clear Space and Minimum Sizes

- Clear space: at least the height of the dome's base bar × 2 (10 px at 64 px icon size) on every side. Scale proportionally.
- Lockup: minimum width 160 px.
- Icon: minimum width 16 px. Favicon sizes: 32 × 32 and 16 × 16.

## 5. Usage Rules

- Use [logo-dark.svg](logo-dark.svg) on dark surfaces and [logo-light.svg](logo-light.svg) on light surfaces.
- Do not stretch, rotate or recolour the mark.
- Do not place the star in another colour; amber marks the target throughout the product.
- Do not add shadows, outlines or gradients.
- Do not set the wordmark in another font.

## 6. Editing the Wordmark

The files in [source/](source/) contain live `<text>`. To regenerate the outlined lockups:

1. Install Outfit Bold and Inter SemiBold from [fonts/](../fonts/fonts.md).
2. Edit the file in `source/`.
3. Export with Inkscape:

   ```bash
   inkscape --export-text-to-path --export-plain-svg \
     --export-filename=logo.svg source/logo.svg
   ```

4. Repeat for `logo-dark.svg` and `logo-light.svg`, and check the result in [candidates/showcase.html](candidates/showcase.html).

## 7. Use in the Application

The icon mark is copied to [public/brand/logo-icon.svg](../../../../public/brand/logo-icon.svg). It is used as the favicon and in the application header ([src/app/layout.tsx](../../../../src/app/layout.tsx)). When the mark changes, update both files in the same change.

## 8. Related Documents

- [REF-020 Branding and Design System](../README.md)
- [DES-011 Colour Palette](../color-palette/color-palette.md)
- [REF-023 Logo Candidates and Evaluation](candidates/README.md)
