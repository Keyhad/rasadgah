---
id: API-001
title: HTTP API Specification
type: specification
status: proposed
version: 1.1
audience:
  - developer
  - tester
tags:
  - api
  - http
---

# HTTP API Specification

## Table of Contents

- [1. Overview](#1-overview)
- [2. Authentication](#2-authentication)
- [3. Base URL](#3-base-url)
- [4. Common Behaviour](#4-common-behaviour)
- [5. Endpoints](#5-endpoints)
  - [5.1 POST /api/tokens](#51-post-apitokens)
  - [5.2 PUT /api/kpis](#52-put-apikpis)
  - [5.3 GET /api/kpis](#53-get-apikpis)
  - [5.4 GET /api/health](#54-get-apihealth)
  - [5.5 GET / (web page)](#55-get--web-page)
- [6. Data Models](#6-data-models)
- [7. Error Codes](#7-error-codes)
- [8. Examples](#8-examples)
- [9. Versioning](#9-versioning)
- [10. Related Documents](#10-related-documents)

## 1. Overview

The API creates dashboards and stores and returns one KPI report per dashboard. It is implemented in [src/presentation/http/handlers.ts](../../src/presentation/http/handlers.ts) and exposed by the route files under [src/app/api/](../../src/app/api/).

## 2. Authentication

`PUT /api/kpis` and `GET /api/kpis` require the header:

```text
Authorization: Bearer <token>
```

Each dashboard has two tokens ([ADR-005](../03-design/adr/adr-005-read-and-write-tokens.md)):

| Token       | `GET /api/kpis` | `PUT /api/kpis`               | Page `/?token=`       |
| ----------- | --------------- | ----------------------------- | --------------------- |
| Write token | allowed         | allowed; extends the lifetime | editor                |
| Read token  | allowed         | `403`                         | shared read-only view |

The scheme name is case-insensitive. A missing, malformed, unknown or expired token produces the same `401` response (REQ-006).

`POST /api/tokens` and `GET /api/health` require no authentication.

## 3. Base URL

`https://<SITE_ADDRESS>` — for local Docker Compose: `https://localhost`.

## 4. Common Behaviour

- All API responses are JSON and carry `Cache-Control: no-store`.
- Error responses have the shape of [ErrorResponse](#6-data-models).
- Every response carries the security headers listed in [DES-001, Section 7](../03-design/architecture.md#7-security).
- The reverse proxy rejects request bodies larger than 1 MB before they reach the application.

## 5. Endpoints

### 5.1 POST /api/tokens

#### 5.1.1 Purpose

Create a dashboard and issue its write and read tokens. Equivalent to opening the start page.

#### 5.1.2 Request

No body.

#### 5.1.3 Response

`201 Created` — [IssuedTokens](#6-data-models).

#### 5.1.4 Errors

| Status | Condition                                                                                      |
| ------ | ---------------------------------------------------------------------------------------------- |
| 429    | The client IP has requested more than `TOKENS_PER_HOUR` tokens in the current one-hour window. |
| 500    | Storage failure.                                                                               |

### 5.2 PUT /api/kpis

#### 5.2.1 Purpose

Store a KPI report for the dashboard of the write token, replacing the previous report, and restart the lifetime of both tokens.

#### 5.2.2 Request

Body: a KPI file as defined in [INT-001](kpi-file-format.md). `Content-Type: application/json` should be sent; the body is parsed as JSON regardless of the header.

#### 5.2.3 Response

`200 OK` — [StoredReport](#6-data-models) containing the normalised report.

#### 5.2.4 Errors

| Status | Condition                                                                         |
| ------ | --------------------------------------------------------------------------------- |
| 400    | The body is not valid JSON.                                                       |
| 401    | Token missing, malformed, unknown or expired.                                     |
| 403    | The token is a read token.                                                        |
| 413    | `Content-Length` or actual body size exceeds `MAX_UPLOAD_BYTES`.                  |
| 422    | The body violates INT-001. `details` lists each violation as `<path>: <message>`. |
| 500    | Storage failure.                                                                  |

Validation order: size, JSON syntax, token, access level, KPI schema.

### 5.3 GET /api/kpis

#### 5.3.1 Purpose

Return the stored report and lifetime information. Accepts the write token and the read token.

#### 5.3.2 Response

`200 OK` — [StoredReport](#6-data-models). `access` is `write` or `read` according to the presented token. `report` and `updatedAt` are `null` before the first upload.

#### 5.3.3 Errors

| Status | Condition                                     |
| ------ | --------------------------------------------- |
| 401    | Token missing, malformed, unknown or expired. |
| 500    | Storage failure.                              |

### 5.4 GET /api/health

Liveness probe used by the container health check. Returns `200 OK` with `{"status":"ok"}`.

### 5.5 GET / (web page)

| Query                   | Behaviour                                                                                                                                                                                     |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| none                    | Creates a dashboard (subject to the same rate limit as `POST /api/tokens`) and renders both tokens with an upload form. When the limit is exceeded, a "Too many requests" notice is rendered. |
| `token=<write token>`   | Renders the editor (REQ-004).                                                                                                                                                                 |
| `token=<read token>`    | Renders the shared read-only view (REQ-009).                                                                                                                                                  |
| `token=<token>` invalid | Renders the "Token expired or unknown" notice (REQ-006).                                                                                                                                      |

## 6. Data Models

```ts
interface IssuedTokens {
  writeToken: string; // 32 characters, [A-Za-z0-9_-]; keep secret
  readToken: string;  // 32 characters, [A-Za-z0-9_-]; for sharing
  expiresAt: string;  // ISO 8601, UTC; shared by both tokens
}

interface StoredReport {
  access: 'write' | 'read'; // access level of the presented token
  report: KpiReport | null; // INT-001, after defaults are applied
  updatedAt: string | null; // ISO 8601 time of the last upload
  expiresAt: string;        // ISO 8601 time both tokens expire
}

interface ErrorResponse {
  error: string;
  details?: string[];       // present for 422 only
}
```

## 7. Error Codes

| Status | `error` message                                        |
| ------ | ------------------------------------------------------ |
| 400    | `Request body must be valid JSON.`                     |
| 401    | `Token is invalid or has expired. Request a new one.`  |
| 403    | `This is a read token. Use the write token to upload.` |
| 413    | `KPI file must be at most <n> bytes.`                  |
| 422    | `KPI file does not match the expected format.`         |
| 429    | `Too many tokens requested. Try again later.`          |
| 500    | `Unexpected server error.`                             |

## 8. Examples

```bash
BASE=https://localhost
TOKENS=$(curl -fsS -X POST "$BASE/api/tokens")
WRITE=$(echo "$TOKENS" | jq -r .writeToken)
READ=$(echo "$TOKENS" | jq -r .readToken)

curl -fsS -X PUT "$BASE/api/kpis" \
  -H "Authorization: Bearer $WRITE" \
  -H 'Content-Type: application/json' \
  --data-binary '@public/kpis.example.json'

curl -fsS "$BASE/api/kpis" -H "Authorization: Bearer $READ"
echo "Share: $BASE/?token=$READ"
```

Add `-k` when testing against `https://localhost` with Caddy's internal certificate.

## 9. Versioning

The API is unversioned at 0.x. Breaking changes shall be recorded in [REF-003 Release Notes](../08-release/release-notes.md). Version 1.1 of this specification replaced the `token` field of `POST /api/tokens` with `writeToken` and `readToken`.

## 10. Related Documents

- [INT-001 KPI File Format](kpi-file-format.md)
- [DES-002 Token and Session Lifecycle](../03-design/session-lifecycle.md)
- [REF-001 Configuration Reference](../07-reference/configuration.md)
