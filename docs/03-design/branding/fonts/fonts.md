---
id: REF-021
title: Typography
type: reference
status: approved
version: 2.0
owner: design
audience:
  - developer
  - design
tags:
  - typography
  - fonts
---

# Typography

## Table of Contents

- [1. Font Families](#1-font-families)
- [2. Font Files](#2-font-files)
- [3. Type Scale](#3-type-scale)
- [4. Current Application Status](#4-current-application-status)
- [5. Adopting the Brand Fonts in the Application](#5-adopting-the-brand-fonts-in-the-application)
- [6. Licences](#6-licences)
- [7. Related Documents](#7-related-documents)

## 1. Font Families

| Family             | Role                                         | Weights       |
| ------------------ | -------------------------------------------- | ------------- |
| **Outfit**         | Wordmark, display headings, large KPI values | 500, 700      |
| **Inter**          | UI text, labels, body copy, logo tagline     | 400, 600, 700 |
| **JetBrains Mono** | Tokens, JSON samples, API examples           | 400, 700      |

CSS stacks (from [branding.yml](../branding.yml)):

```css
--font-sans: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--font-display: 'Outfit', 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, Consolas, monospace;
```

## 2. Font Files

| Folder                             | Files                                                             |
| ---------------------------------- | ----------------------------------------------------------------- |
| [outfit/](outfit/)                 | `Outfit-Medium.woff2`, `Outfit-Bold.woff2`                        |
| [inter/](inter/)                   | `Inter-Regular.woff2`, `Inter-SemiBold.woff2`, `Inter-Bold.woff2` |
| [jetbrains-mono/](jetbrains-mono/) | `JetBrainsMono-Regular.woff2`, `JetBrainsMono-Bold.woff2`         |

## 3. Type Scale

Values as used in [src/app/globals.css](../../../../src/app/globals.css):

| Element                  | Size     | Weight | Family  |
| ------------------------ | -------- | ------ | ------- |
| KPI value                | 1.9 rem  | 700    | display |
| Site name (header)       | 1.25 rem | 700    | display |
| Panel heading            | 1.1 rem  | 600    | sans    |
| Token                    | 1.1 rem  | 400    | mono    |
| Body                     | 1 rem    | 400    | sans    |
| KPI label                | 0.9 rem  | 500    | sans    |
| Change, target, metadata | 0.85 rem | 400    | sans    |

Line height: 1.5.

## 4. Current Application Status

The application currently uses the system font stack (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`) for all text, so no font files are downloaded. The logo lockups do not depend on installed fonts because their text is converted to outlines ([REF-022, Section 6](../logo/README.md#6-editing-the-wordmark)).

## 5. Adopting the Brand Fonts in the Application

1. Copy the required `.woff2` files to `public/fonts/`.
2. Declare them in `src/app/globals.css`:

   ```css
   @font-face {
     font-family: 'Outfit';
     font-weight: 700;
     font-display: swap;
     src: url('/fonts/Outfit-Bold.woff2') format('woff2');
   }
   ```

3. Add the stacks from Section 1 to `:root` and apply `--font-display` to `.kpi-card__value` and `.site-header h1`, and `--font-mono` to `.token code`.
4. The Content-Security-Policy already allows fonts from `'self'` through `default-src`.

## 6. Licences

All three families are licensed under the SIL Open Font License 1.1, which permits use, embedding and redistribution, including commercial use. The licence text shall accompany the font files when they are redistributed.

## 7. Related Documents

- [REF-020 Branding and Design System](../README.md)
