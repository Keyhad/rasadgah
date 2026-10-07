---
id: DES-012
title: GUI Layout
type: design
status: approved
version: 2.0
owner: design
audience:
  - developer
  - design
  - tester
tags:
  - gui
  - layout
  - accessibility
---

# GUI Layout

## Table of Contents

- [1. Overview](#1-overview)
- [2. Page Frame](#2-page-frame)
- [3. Screens](#3-screens)
  - [3.1 Start screen (no token)](#31-start-screen-no-token)
  - [3.2 Dashboard (valid token)](#32-dashboard-valid-token)
  - [3.3 Notice (invalid token or rate limit)](#33-notice-invalid-token-or-rate-limit)
- [4. Components](#4-components)
  - [4.1 KPI card](#41-kpi-card)
  - [4.2 Upload form](#42-upload-form)
  - [4.3 Token panel](#43-token-panel)
- [5. Responsive Behaviour](#5-responsive-behaviour)
- [6. Accessibility](#6-accessibility)
- [7. Related Documents](#7-related-documents)

## 1. Overview

Rasadgah has one page (`/`) with three screens, selected on the server by the `token` query parameter. Implementation: [src/app/page.tsx](../../../../src/app/page.tsx) and [src/presentation/components/](../../../../src/presentation/components/).

![Layout diagram](layout-diagram.svg)

## 2. Page Frame

| Region | Content                                                                                | Style                                                                        |
| ------ | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Header | Logo mark (32 px), "Rasadgah" (link to `/`, not prefetched), tagline "KPI observatory" | Full width, 1 px bottom border `--border`, padding 1 rem × 1.5 rem           |
| Main   | Screen content                                                                         | Centred, max. width 1100 px, padding 1.5 rem, vertical grid with 1.5 rem gap |

## 3. Screens

### 3.1 Start screen (no token)

| Order | Region       | Content                                                                    |
| ----- | ------------ | -------------------------------------------------------------------------- |
| 1     | Token panel  | See Section 4.3                                                            |
| 2     | Upload panel | Heading "Upload KPIs", link to the example file, upload form (Section 4.2) |

A successful upload navigates to the dashboard.

### 3.2 Dashboard (valid token)

| Order | Region       | Content                                                                                                                                                |
| ----- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1     | Status panel | Heading "Dashboard"; definition list: "Last upload", "Token expires", "On target" (`met / with target`, shown only when at least one KPI has a target) |
| 2     | KPI grid     | One KPI card per KPI (Section 4.1); or the empty state "No KPIs uploaded yet…" in a panel                                                              |
| 3     | Update panel | Heading "Update KPIs", note about lifetime extension, upload form                                                                                      |

### 3.3 Notice (invalid token or rate limit)

A single panel with a `--negative` border, `role="alert"`, a heading ("Token expired or unknown" or "Too many requests"), one explanatory sentence and the link "Get a new token" to `/`.

## 4. Components

### 4.1 KPI card

```text
┌▌────────────────────────────────┐
│▌ Monthly revenue                │  label    0.9 rem, --muted
│▌ $128,400                       │  value    1.9 rem, bold
│▌ ▲ +9.5%                        │  change   0.85 rem, assessment colour
│▌ On target · target $125,000    │  target   0.85 rem, red when missed
└▌────────────────────────────────┘
 ▲ 4 px left border: --positive / --negative / --muted
```

- Element: `<article aria-labelledby>` with `data-assessment`.
- The target line is omitted when the KPI has no target.

### 4.2 Upload form

| State     | Presentation                                                                     |
| --------- | -------------------------------------------------------------------------------- |
| Idle      | File input (accepts `.json`), button "Upload"                                    |
| Uploading | Button disabled, label "Uploading…"                                              |
| Success   | `role="status"` text "Upload successful.", then navigation                       |
| Error     | `role="alert"` block in `--negative` with the message and a list of field errors |

### 4.3 Token panel

Heading "Your access token", warning that the token cannot be recovered, token in a bordered `<code>` block with a "Copy" button (label changes to "Copied"), expiry time, link "Open my dashboard".

## 5. Responsive Behaviour

- KPI grid: `repeat(auto-fill, minmax(220px, 1fr))` with 1 rem gap. At the maximum content width (1052 px) this gives 4 columns; below 456 px content width, 1 column.
- Token block, upload form and status list wrap with `flex-wrap`.
- Long tokens break with `word-break: break-all`.

## 6. Accessibility

- Landmarks: `<header>`, `<main>`, `<section aria-labelledby>` for every panel.
- Trend arrows are `aria-hidden`; a visually hidden text states "change, trend up/down/flat".
- Assessment is never conveyed by colour alone (see [DES-011, Section 5](../color-palette/color-palette.md#5-semantic-colours)).
- Form messages use `role="status"` and `role="alert"` so that screen readers announce them.
- The file input has a visible `<label>`.

## 7. Related Documents

- [REQ-000 System Requirements](../../../01-requirements/requirements.md), REQ-001, REQ-004, REQ-006
- [DES-010 Theming and Localisation](../theme.md)
