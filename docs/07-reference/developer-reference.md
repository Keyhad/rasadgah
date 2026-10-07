---
id: REF-004
title: Developer Reference
type: reference
status: proposed
version: 1.0
audience:
  - developer
  - ai-agent
tags:
  - reference
  - modules
---

# Developer Reference

## Table of Contents

- [1. Overview](#1-overview)
- [2. Modules](#2-modules)
  - [2.1 Domain](#21-domain)
  - [2.2 Application](#22-application)
  - [2.3 Infrastructure](#23-infrastructure)
  - [2.4 Presentation](#24-presentation)
  - [2.5 Server and Next.js entry points](#25-server-and-nextjs-entry-points)
- [3. Error Codes](#3-error-codes)
- [4. Examples](#4-examples)
  - [4.1 Add a KPI unit](#41-add-a-kpi-unit)
  - [4.2 Replace the session store](#42-replace-the-session-store)
- [5. Related Documents](#5-related-documents)

## 1. Overview

Module-level reference for `src/`. Architecture and layer rules: [DES-001](../03-design/architecture.md). HTTP interface: [API-001](../02-specification/api-specification.md).

## 2. Modules

### 2.1 Domain

| Module                                    | Exports                                                                                                                       |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| [kpi.ts](../../src/domain/kpi.ts)         | `Kpi`, `KpiReport`, `KPI_UNITS`, `KPI_DIRECTIONS`, `changeRatio()`, `trendOf()`, `assess()`, `targetStatus()`                 |
| [session.ts](../../src/domain/session.ts) | `Session`, `Access`, `TOKEN_LIFETIME_MS`, `isWellFormedToken()`, `newSession()`, `withReport()`, `expiresAt()`, `isExpired()` |
| [format.ts](../../src/domain/format.ts)   | `formatValue()`, `formatChange()`, `formatDateTime()`, `formatAge()` (en-US, UTC)                                             |

### 2.2 Application

| Module                                                         | Exports                                                                                                                                                                                                        |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ports.ts](../../src/application/ports.ts)                     | `SessionStore` (keyed by read token), `TokenGenerator` (`generate()`, `readTokenFor()`), `Clock`                                                                                                               |
| [useCases.ts](../../src/application/useCases.ts)               | `createIssueTokens()`, `createUploadReport()`, `createGetReport()`, `createGetDashboard()`, `toKpiCard()`; types `Deps`, `IssuedTokens`, `StoredReport`, `Freshness`, `DashboardViewModel`, `KpiCardViewModel` |
| [kpiReportSchema.ts](../../src/application/kpiReportSchema.ts) | `kpiReportSchema` (zod), `MAX_KPIS`                                                                                                                                                                            |
| [errors.ts](../../src/application/errors.ts)                   | `AppError`, `AppErrorCode`, `isAppError()`                                                                                                                                                                     |

Each `create*` factory takes `Deps` (`store`, `tokens`, `clock`) and returns an async function.

### 2.3 Infrastructure

| Module                                                                  | Exports                                                                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [fileSessionStore.ts](../../src/infrastructure/fileSessionStore.ts)     | `createFileSessionStore(directory)`                                                        |
| [memorySessionStore.ts](../../src/infrastructure/memorySessionStore.ts) | `createMemorySessionStore()` with a `size` getter                                          |
| [system.ts](../../src/infrastructure/system.ts)                         | `cryptoTokenGenerator` (random write tokens, SHA-256 read-token derivation), `systemClock` |
| [rateLimiter.ts](../../src/infrastructure/rateLimiter.ts)               | `RateLimiter`, `createFixedWindowRateLimiter({ limit, windowMs, clock, maxKeys? })`        |

### 2.4 Presentation

| Module                                                                                          | Exports                                                                                                                         |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| [http/handlers.ts](../../src/presentation/http/handlers.ts)                                     | `createTokenHandlers(deps)` → `{ POST }`, `createKpiHandlers(deps)` → `{ GET, PUT }`, `bearerToken()`, `clientIp()`, `HttpDeps` |
| [components/DashboardView.tsx](../../src/presentation/components/DashboardView.tsx)             | Editor (write token): status, share link, KPI grid, update form                                                                 |
| [components/SharedDashboardView.tsx](../../src/presentation/components/SharedDashboardView.tsx) | Shared view (read token): freshness line and KPI grid only                                                                      |
| [components/KpiGrid.tsx](../../src/presentation/components/KpiGrid.tsx)                         | Grid of KPI cards or an empty-state message                                                                                     |
| [components/KpiCard.tsx](../../src/presentation/components/KpiCard.tsx)                         | One KPI card                                                                                                                    |
| [components/Freshness.tsx](../../src/presentation/components/Freshness.tsx)                     | "Updated … ago (… UTC) · data as of …"                                                                                          |
| [components/TokenPanel.tsx](../../src/presentation/components/TokenPanel.tsx)                   | Start screen: write token, read token, expiry, links                                                                            |
| [components/CopyField.tsx](../../src/presentation/components/CopyField.tsx)                     | Client component: value with a copy button; copies absolute URLs for links                                                      |
| [components/UploadForm.tsx](../../src/presentation/components/UploadForm.tsx)                   | Client component: file upload via `PUT /api/kpis`                                                                               |
| [components/JsonEditor.tsx](../../src/presentation/components/JsonEditor.tsx)                   | Client component: editable report JSON with Save, Format, Reset; `KPI_TEMPLATE`                                                 |
| [components/useKpiUpload.ts](../../src/presentation/components/useKpiUpload.ts)                 | Hook shared by `UploadForm` and `JsonEditor`: `PUT /api/kpis` with the write token, state, refresh on success                   |
| [components/UploadStatus.tsx](../../src/presentation/components/UploadStatus.tsx)               | Success status or error alert with field details                                                                                |
| [components/Notice.tsx](../../src/presentation/components/Notice.tsx)                           | Alert with a link to `/`                                                                                                        |

### 2.5 Server and Next.js entry points

| Module                                                       | Role                                                              |
| ------------------------------------------------------------ | ----------------------------------------------------------------- |
| [server/container.ts](../../src/server/container.ts)         | Composition root; reads environment ([REF-001](configuration.md)) |
| [app/page.tsx](../../src/app/page.tsx)                       | Start page, editor (write token) and shared view (read token)     |
| [app/api/tokens/route.ts](../../src/app/api/tokens/route.ts) | `POST /api/tokens`                                                |
| [app/api/kpis/route.ts](../../src/app/api/kpis/route.ts)     | `GET`, `PUT /api/kpis`                                            |
| [app/api/health/route.ts](../../src/app/api/health/route.ts) | `GET /api/health`                                                 |
| [instrumentation.ts](../../src/instrumentation.ts)           | Starts the hourly purge                                           |

## 3. Error Codes

| `AppErrorCode`    | Raised by                                                            | HTTP status |
| ----------------- | -------------------------------------------------------------------- | ----------- |
| `TOKEN_INVALID`   | Session resolution in all token-based use cases                      | 401         |
| `TOKEN_READ_ONLY` | `uploadReport` when a read token is presented                        | 403         |
| `REPORT_INVALID`  | `uploadReport` when the schema fails; `details` holds the violations | 422         |

Statuses 400, 413 and 429 are produced in the HTTP handlers without an `AppError`.

## 4. Examples

### 4.1 Add a KPI unit

1. Add the unit to `KPI_UNITS` in `src/domain/kpi.ts`.
2. Add a `case` to `formatValue()` in `src/domain/format.ts`. TypeScript reports a missing case.
3. Add tests to `src/domain/format.test.ts`.
4. Update [INT-001, Sections 3 and 4](../02-specification/kpi-file-format.md) and the release notes.

### 4.2 Replace the session store

1. Implement `SessionStore` in a new file in `src/infrastructure/`.
2. Run the contract cases from `fileSessionStore.test.ts` against it.
3. Change the `store` in `src/server/container.ts`.
4. Record the decision in a new ADR that supersedes [ADR-002](../03-design/adr/adr-002-file-based-session-storage.md).

## 5. Related Documents

- [PROC-001 Development Guide](../04-development/development-guide.md)
- [REF-010 TypeScript Coding Standards](../../.ai/project/rules/10-typescript-coding-standards.md)
