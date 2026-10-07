---
id: REF-020
title: Branding and Design System
type: reference
status: approved
version: 2.0
owner: design
audience:
  - developer
  - design
  - product
tags:
  - branding
  - design-system
---

# Branding and Design System

![Rasadgah — KPI observatory](logo/logo.svg)

Index of the Rasadgah visual identity, messaging and UI design rules.

## Table of Contents

- [1. Brand at a Glance](#1-brand-at-a-glance)
- [2. Directory Structure](#2-directory-structure)
- [3. Document Index](#3-document-index)
- [4. Source of Truth](#4-source-of-truth)
- [5. Related Documents](#5-related-documents)

## 1. Brand at a Glance

| Element    | Value                                                                                            |
| ---------- | ------------------------------------------------------------------------------------------------ |
| Name       | **Rasadgah** — Persian رصدگاه, "observatory"                                                     |
| Tagline    | KPI observatory                                                                                  |
| Slogan     | *Observe what matters.*                                                                          |
| Logo       | Observatory dome with rising KPI bars; the telescope points at an amber target star              |
| Palette    | Night Sky: navy `#0F172A`, sky `#38BDF8`, star `#FBBF24`; positive `#4ADE80`, negative `#F87171` |
| Typography | Outfit (display), Inter (UI), JetBrains Mono (code)                                              |
| Theme      | Dark (`night-sky`)                                                                               |

## 2. Directory Structure

```text
docs/03-design/branding/
├── README.md                    this index (REF-020)
├── branding.yml                 authoritative tokens and asset paths
├── theme.md                     theming and localisation (DES-010)
├── color-palette/
│   ├── color-palette.md         colour tokens and contrast (DES-011)
│   ├── palette.json             design tokens (mirror of branding.yml)
│   └── swatches.svg             visual swatches
├── fonts/
│   ├── fonts.md                 typography (REF-021)
│   ├── inter/  outfit/  jetbrains-mono/   .woff2 files
├── gui-layout/
│   ├── layout-description.md    screens and components (DES-012)
│   └── layout-diagram.svg       wireframe
├── logo/
│   ├── README.md                logo assets and usage (REF-022)
│   ├── logo.svg  logo-dark.svg  logo-light.svg  logo-icon.svg
│   ├── source/                  editable lockups with live text
│   └── candidates/              concepts and evaluation (REF-023)
└── messaging/
    ├── product-description.md   approved product copy (REF-024)
    └── slogan.md                slogan, taglines, voice (REF-025)
```

## 3. Document Index

| ID      | Document                                                    | Type      |
| ------- | ----------------------------------------------------------- | --------- |
| REF-022 | [Logo Assets and Usage](logo/README.md)                     | reference |
| REF-023 | [Logo Candidates and Evaluation](logo/candidates/README.md) | reference |
| DES-011 | [Colour Palette](color-palette/color-palette.md)            | design    |
| REF-021 | [Typography](fonts/fonts.md)                                | reference |
| DES-012 | [GUI Layout](gui-layout/layout-description.md)              | design    |
| DES-010 | [Theming and Localisation](theme.md)                        | design    |
| REF-024 | [Product Description](messaging/product-description.md)     | reference |
| REF-025 | [Slogan, Taglines and Voice](messaging/slogan.md)           | reference |

## 4. Source of Truth

- Colour values, font stacks, geometry and asset paths: [branding.yml](branding.yml).
- Implementation of the colour tokens: [src/app/globals.css](../../../src/app/globals.css).
- Application copy of the icon: [public/brand/logo-icon.svg](../../../public/brand/logo-icon.svg).

A change to the brand shall update `branding.yml`, the affected documents in this folder and the implementation in the same change.

## 5. Related Documents

- [DES-001 System Architecture](../architecture.md)
- [USR-001 User Guide](../../06-user/user-guide.md)
