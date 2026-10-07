---
id: ADR-001
title: Next.js server with standalone output
type: decision
status: approved
version: 1.0
audience:
  - architect
  - developer
tags:
  - nextjs
  - deployment
---

# Next.js server with standalone output

## Table of Contents

- [1. Context](#1-context)
- [2. Problem](#2-problem)
- [3. Options Considered](#3-options-considered)
- [4. Decision](#4-decision)
- [5. Rationale](#5-rationale)
- [6. Consequences](#6-consequences)
- [7. Related Requirements](#7-related-requirements)
- [8. Related Documents](#8-related-documents)

## 1. Context

The first concept was a static site that read a KPI JSON file shipped with the build. The requirements then added per-visitor tokens, uploads and expiry (REQ-001 to REQ-008), which require server-side state.

## 2. Problem

Choose how to run server logic while keeping the Next.js frontend.

## 3. Options Considered

### 3.1 Static export plus a separate API service

Advantages: static hosting for the UI.

Disadvantages: two codebases or runtimes, CORS, two deployments.

### 3.2 Next.js server with route handlers, `output: 'standalone'`

Advantages: one codebase and one container; server-side rendering of the dashboard; a small runtime image.

Disadvantages: requires a Node.js runtime instead of static hosting.

### 3.3 Serverless platform (for example Vercel)

Advantages: no server management.

Disadvantages: needs external storage for sessions; vendor dependency; conflicts with NFR-004 (Docker Compose deployment).

## 4. Decision

Option 3.2.

## 5. Rationale

It satisfies all requirements with the fewest moving parts and deploys as one container behind Caddy.

## 6. Consequences

### 6.1 Positive

- Dashboard HTML is rendered on the server; it works without client-side data fetching.
- The runtime image contains only `server.js`, the traced dependencies and static assets.

### 6.2 Negative

- `public/` and `.next/static` must be copied into the standalone folder (`postbuild` script).

### 6.3 Risks

- Next.js major upgrades can change the standalone output layout. The Docker smoke test in CI detects this.

## 7. Related Requirements

REQ-001 to REQ-008, NFR-004.

## 8. Related Documents

- [DES-001 System Architecture](../architecture.md)
