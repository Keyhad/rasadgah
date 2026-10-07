---
id: PROC-001
title: Development Guide
type: procedure
status: proposed
version: 1.0
audience:
  - developer
  - ai-agent
tags:
  - development
---

# Development Guide

## Table of Contents

- [1. Prerequisites](#1-prerequisites)
- [2. Repository Structure](#2-repository-structure)
- [3. Dependencies](#3-dependencies)
- [4. Setup](#4-setup)
  - [4.1 Clone](#41-clone)
  - [4.2 Configure](#42-configure)
  - [4.3 Start the development server](#43-start-the-development-server)
- [5. Build](#5-build)
- [6. Run](#6-run)
- [7. Test](#7-test)
- [8. Debugging](#8-debugging)
- [9. Coding Guidelines](#9-coding-guidelines)
- [10. Common Problems](#10-common-problems)
- [11. Related Documents](#11-related-documents)

## 1. Prerequisites

| Tool                                     | Version                         | Required                                        |
| ---------------------------------------- | ------------------------------- | ----------------------------------------------- |
| Docker Engine or Docker Desktop / Colima | 24 or later                     | yes                                             |
| Docker Compose plugin                    | 2.20 or later                   | yes                                             |
| Git                                      | any                             | yes                                             |
| Node.js                                  | 22 (see [.nvmrc](../../.nvmrc)) | no — only for running `npm` scripts on the host |

## 2. Repository Structure

```text
.ai/                 rules, agent personas and templates (see AGENTS.md)
.github/workflows/   CI/CD pipeline
docs/                documentation (this folder)
e2e/                 Playwright end-to-end tests
public/              static files, including kpis.example.json
src/
  domain/            entities and business rules
  application/       use cases, ports, validation
  infrastructure/    adapters (file store, crypto, clock, rate limiter)
  presentation/      React components and HTTP handlers
  server/            composition root
  app/               Next.js pages and route handlers
Caddyfile            reverse proxy and TLS configuration
compose.yaml         services: app, proxy, dev, test, e2e
Dockerfile           multi-stage build
```

Layer rules: [DES-001, Section 4](../03-design/architecture.md#4-high-level-architecture).

## 3. Dependencies

Runtime: `next`, `react`, `react-dom`, `zod`. Development: TypeScript, ESLint (`eslint-config-next`), Vitest, Testing Library, Playwright. Exact versions are locked in `package-lock.json`.

Add or update a dependency without a local Node.js:

```bash
docker run --rm -v "$PWD":/app -w /app node:22-alpine npm install <package>
```

## 4. Setup

### 4.1 Clone

```bash
git clone git@github.com:Keyhad/rasadgah.git
cd rasadgah
```

### 4.2 Configure

Optional. Copy [.env.example](../../.env.example) to `.env` to override defaults ([REF-001](../07-reference/configuration.md)).

### 4.3 Start the development server

```bash
docker compose --profile dev up dev
```

Open <http://localhost:3000>. Source changes reload automatically. Sessions are written to `.data/` in the working copy.

## 5. Build

```bash
docker compose build app
```

With Node.js on the host: `npm ci && npm run build`. The build writes `.next/standalone/` and the `postbuild` script copies static assets into it.

## 6. Run

```bash
docker compose up -d --build
```

Open <https://localhost>. To use other ports: `HTTP_PORT=8080 HTTPS_PORT=8443 docker compose up -d`.

Stop: `docker compose down`. Data volumes are kept.

## 7. Test

```bash
docker compose --profile test run --rm test   # lint, typecheck, unit tests with coverage
docker compose --profile test run --rm e2e    # build + Playwright (Chromium)
```

With Node.js on the host:

| Command                           | Purpose                                                     |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run lint`                    | ESLint, including layer boundaries                          |
| `npm run typecheck`               | `tsc --noEmit`                                              |
| `npm test` / `npm run test:watch` | Vitest                                                      |
| `npm run test:coverage`           | Vitest with coverage thresholds; HTML report in `coverage/` |
| `npm run test:e2e`                | Playwright; builds and starts the app on port 3100          |
| `npm run verify`                  | lint + typecheck + coverage                                 |

Test strategy and traceability: [TST-000](../05-testing/test-specification.md). The e2e HTML report is written to `playwright-report/`.

## 8. Debugging

- Application logs: `docker compose logs -f app`.
- Proxy logs (tokens redacted): `docker compose logs -f proxy`.
- Inspect stored sessions: `docker compose exec app ls -l /data`.
- Call the API from the host: see [API-001, Section 8](../02-specification/api-specification.md#8-examples).
- Run one unit test file: `npx vitest run src/domain/session.test.ts`.
- Debug an e2e test with the inspector (host Node.js required): `npx playwright test --debug`.

## 9. Coding Guidelines

[REF-010 TypeScript Coding Standards](../../.ai/project/rules/10-typescript-coding-standards.md) and [REF-011 Project Security Rules](../../.ai/project/rules/40-security.md). Definition of done: [AGENTS.md, Section 7](../../AGENTS.md#7-definition-of-done).

## 10. Common Problems

See [REF-002 Troubleshooting](../07-reference/troubleshooting.md).

## 11. Related Documents

- [PROC-003 How to configure the CI/CD pipeline](../howtos/howto-configure-ci-cd.md)
- [REF-004 Developer Reference](../07-reference/developer-reference.md)
