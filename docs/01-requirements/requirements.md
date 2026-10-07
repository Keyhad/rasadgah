---
id: REQ-000
title: System Requirements
type: requirement
status: proposed
version: 1.1
owner: engineering
audience:
  - architect
  - developer
  - tester
tags:
  - requirements
---

# System Requirements

## Table of Contents

- [1. Introduction](#1-introduction)
  - [1.1 Purpose](#11-purpose)
  - [1.2 Scope](#12-scope)
  - [1.3 Definitions](#13-definitions)
- [2. Functional Requirements](#2-functional-requirements)
  - [2.1 REQ-001 Token issuance](#21-req-001-token-issuance)
  - [2.2 REQ-002 KPI upload](#22-req-002-kpi-upload)
  - [2.3 REQ-003 KPI validation](#23-req-003-kpi-validation)
  - [2.4 REQ-004 Dashboard rendering](#24-req-004-dashboard-rendering)
  - [2.5 REQ-005 Token lifetime](#25-req-005-token-lifetime)
  - [2.6 REQ-006 Expired or unknown token](#26-req-006-expired-or-unknown-token)
  - [2.7 REQ-007 Programmatic access](#27-req-007-programmatic-access)
  - [2.8 REQ-008 Data deletion](#28-req-008-data-deletion)
  - [2.9 REQ-009 Shared read-only view](#29-req-009-shared-read-only-view)
  - [2.10 REQ-010 Write-token privileges](#210-req-010-write-token-privileges)
- [3. Non-Functional Requirements](#3-non-functional-requirements)
  - [3.1 NFR-001 Encrypted transport](#31-nfr-001-encrypted-transport)
  - [3.2 NFR-002 Token secrecy](#32-nfr-002-token-secrecy)
  - [3.3 NFR-003 Abuse limits](#33-nfr-003-abuse-limits)
  - [3.4 NFR-004 Deployment](#34-nfr-004-deployment)
  - [3.5 NFR-005 Verification](#35-nfr-005-verification)
  - [3.6 NFR-006 Maintainability](#36-nfr-006-maintainability)
- [4. Constraints](#4-constraints)
- [5. Assumptions](#5-assumptions)
- [6. Dependencies](#6-dependencies)
- [7. Traceability](#7-traceability)
- [8. Related Documents](#8-related-documents)

## 1. Introduction

### 1.1 Purpose

This document defines what Rasadgah shall do. Implementation is described in [DES-001](../03-design/architecture.md).

### 1.2 Scope

The requirements cover the web application, its HTTP API and its deployment. The scope boundary is defined in [PRJ-001](../00-project/README.md).

### 1.3 Definitions

| Term          | Definition                                                                              |
| ------------- | --------------------------------------------------------------------------------------- |
| Dashboard     | One stored set of KPIs, reachable with exactly one write token and one read token.      |
| Write token   | Secret string that allows uploading KPIs and opening the editor of one dashboard.       |
| Read token    | Secret string, intended for sharing, that allows only viewing one dashboard.            |
| Token         | A write token or a read token.                                                          |
| Report        | The validated content of one uploaded KPI file.                                         |
| Session       | The stored state of a dashboard: creation time, last upload time and report.            |
| Last activity | The time of the last successful upload, or the issuance time if no upload has occurred. |

## 2. Functional Requirements

### 2.1 REQ-001 Token issuance

#### 2.1.1 Requirement

When a visitor opens the start page without a `token` query parameter, the system shall create a new dashboard and display its write token, its read token, their common expiry time and an upload form.

#### 2.1.2 Acceptance Criteria

- [x] The start page displays a write token and a read token, each of 32 URL-safe characters, and they differ.
- [x] Two consecutive visits to the start page display different tokens.
- [x] The page states that the tokens must be saved and cannot be recovered, that the write token shall be kept secret and that the read token is for sharing.

### 2.2 REQ-002 KPI upload

#### 2.2.1 Requirement

The system shall accept a KPI file presented with a valid write token and replace any previously stored report of that dashboard.

#### 2.2.2 Acceptance Criteria

- [x] After a successful upload in the browser, the editor for the write token is displayed.
- [x] A second upload replaces the first report.

### 2.3 REQ-003 KPI validation

#### 2.3.1 Requirement

The system shall reject a KPI file that does not conform to [INT-001](../02-specification/kpi-file-format.md) and shall report each violation with its field path. A rejected file shall not change the stored report or the token lifetime.

#### 2.3.2 Acceptance Criteria

- [x] A file with a missing required field is rejected with a message naming the field.
- [x] A body that is not JSON is rejected.

### 2.4 REQ-004 Dashboard rendering

#### 2.4.1 Requirement

When a visitor opens `/?token=<write token>`, the system shall render the editor: one card per KPI showing the label, the formatted value, the change relative to the previous value, the trend and the target status; the time of the last upload; the expiry time; the share link containing the read token; and the upload form.

#### 2.4.2 Acceptance Criteria

- [x] Every KPI in the report is rendered as one card.
- [x] Values are formatted according to their unit (INT-001, Section 4).
- [x] A dashboard without a report shows an empty state and the upload form.
- [x] The share link opens the read-only view of the same dashboard.

### 2.5 REQ-005 Token lifetime

#### 2.5.1 Requirement

The write token and the read token of a dashboard shall share one expiry time, 7 days (604 800 seconds) after the last activity. Only a successful upload with the write token shall restart this period; viewing with either token shall not.

#### 2.5.2 Acceptance Criteria

- [x] A dashboard without uploads is rejected through both tokens 7 days after issuance.
- [x] A dashboard that receives an upload 1 second before expiry remains valid for another 7 days through both tokens.
- [x] A rejected upload with the read token does not change the expiry time.

### 2.6 REQ-006 Expired or unknown token

#### 2.6.1 Requirement

When a visitor opens the dashboard with an expired, unknown or malformed token, the system shall display a notice and a link to the start page to obtain a new token. The system must not distinguish between expired, unknown and malformed tokens in its response.

#### 2.6.2 Acceptance Criteria

- [x] An unknown token displays "Token expired or unknown" with a link to `/`.
- [x] The API returns the same status and message for each of the three cases.

### 2.7 REQ-007 Programmatic access

#### 2.7.1 Requirement

The system shall provide an HTTP API to issue a token, upload a report and read a report, as specified in [API-001](../02-specification/api-specification.md).

#### 2.7.2 Acceptance Criteria

- [x] A write token issued with `POST /api/tokens` can upload with `PUT /api/kpis`; both tokens can read with `GET /api/kpis`.

### 2.8 REQ-008 Data deletion

#### 2.8.1 Requirement

The system shall delete the session of an expired dashboard no later than 1 hour after expiry while the application is running, and immediately when either of its tokens is presented.

#### 2.8.2 Acceptance Criteria

- [x] Presenting an expired write or read token deletes the session.
- [x] The periodic purge deletes expired sessions and keeps valid ones.

### 2.9 REQ-009 Shared read-only view

#### 2.9.1 Requirement

When a visitor opens `/?token=<read token>`, the system shall render only the KPI cards and a freshness line stating how long ago and at what time (UTC) the KPIs were last uploaded, and the `generatedAt` time of the KPI file when present. The view must not contain the write token, the expiry time, an upload form or other controls.

#### 2.9.2 Acceptance Criteria

- [x] The view shows every KPI card and the text "Updated <age> (<UTC time>)".
- [x] The view contains no buttons, no file input and no write token.
- [x] Before the first upload the view states "No KPIs published yet."

### 2.10 REQ-010 Write-token privileges

#### 2.10.1 Requirement

Only the write token shall allow uploading KPIs, opening the editor and seeing the read token. An upload presented with a read token shall be rejected without changing the dashboard. The write token must not be derivable from the read token.

#### 2.10.2 Acceptance Criteria

- [x] `PUT /api/kpis` with a read token returns HTTP 403.
- [x] Opening `/?token=<read token>` renders the shared view, not the editor.

## 3. Non-Functional Requirements

### 3.1 NFR-001 Encrypted transport

#### 3.1.1 Requirement

All production traffic shall be served over HTTPS. HTTP requests shall be redirected to HTTPS and responses shall carry `Strict-Transport-Security`.

#### 3.1.2 Acceptance Criteria

- [x] `http://` requests receive a 308 redirect.
- [x] HTTPS responses include `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

### 3.2 NFR-002 Token secrecy

#### 3.2.1 Requirement

Write tokens shall contain at least 128 bits of entropy from a cryptographically secure source. Read tokens shall be derived from write tokens by a one-way function and shall have the same length. Raw tokens must not be written to persistent storage or access logs, and must not be sent to third parties in the `Referer` header.

#### 3.2.2 Acceptance Criteria

- [x] Write tokens carry 192 bits of entropy; read tokens are 192-bit truncated SHA-256 values.
- [x] Session files are named by the SHA-256 hash of the read token and contain neither token.
- [x] The proxy access log replaces the `token` query value with `REDACTED` and omits the `Authorization` header.
- [x] Every response carries `Referrer-Policy: no-referrer`.

### 3.3 NFR-003 Abuse limits

#### 3.3.1 Requirement

The system shall limit uploads to a configurable size (default 262 144 bytes) and token issuance to a configurable count per client IP address per hour (default 30).

#### 3.3.2 Acceptance Criteria

- [x] Larger uploads are rejected with HTTP 413.
- [x] Excess token requests are rejected with HTTP 429.

### 3.4 NFR-004 Deployment

#### 3.4.1 Requirement

The complete system shall be deployable on a host with Docker Engine and the Compose plugin with one command, without installing Node.js.

#### 3.4.2 Acceptance Criteria

- [x] `docker compose up -d` starts the application and the HTTPS proxy.
- [x] The CI pipeline starts the stack and passes an HTTPS smoke test.

### 3.5 NFR-005 Verification

#### 3.5.1 Requirement

Every change shall pass automated lint, type, unit and end-to-end checks in CI. Unit test coverage shall be at least 95 % of lines, statements and functions and 90 % of branches.

#### 3.5.2 Acceptance Criteria

- [x] The pipeline fails when coverage drops below the thresholds.

### 3.6 NFR-006 Maintainability

#### 3.6.1 Requirement

Source code shall be organised in domain, application, infrastructure and presentation layers with dependencies pointing inwards, and the rule shall be enforced automatically.

#### 3.6.2 Acceptance Criteria

- [x] An import that violates the layer rule fails `npm run lint`.

## 4. Constraints

- The application shall run as a single instance (see [ADR-002](../03-design/adr/adr-002-file-based-session-storage.md)).
- There are no user accounts (see [ADR-004](../03-design/adr/adr-004-anonymous-bearer-tokens.md) and [ADR-005](../03-design/adr/adr-005-read-and-write-tokens.md)).

## 5. Assumptions

- Users store their tokens themselves.
- The deployment host exposes ports 80 and 443 and has a DNS record for the site address.

## 6. Dependencies

- Let's Encrypt for production certificates.
- GitHub Actions and GitHub Container Registry for CI/CD.

## 7. Traceability

| Requirement | Design            | Test             |
| ----------- | ----------------- | ---------------- |
| REQ-001     | DES-001, DES-002  | TST-001          |
| REQ-002     | DES-001           | TST-002          |
| REQ-003     | INT-001           | TST-003          |
| REQ-004     | DES-001           | TST-002, TST-004 |
| REQ-005     | DES-002           | TST-005          |
| REQ-006     | DES-002           | TST-006          |
| REQ-007     | API-001           | TST-007          |
| REQ-008     | DES-002           | TST-008          |
| REQ-009     | DES-012, ADR-005  | TST-015          |
| REQ-010     | DES-002, ADR-005  | TST-016          |
| NFR-001     | ADR-003           | TST-009          |
| NFR-002     | DES-002, ADR-005  | TST-010          |
| NFR-003     | API-001           | TST-011          |
| NFR-004     | DES-001, PROC-002 | TST-012          |
| NFR-005     | PROC-003          | TST-013          |
| NFR-006     | DES-001           | TST-014          |

## 8. Related Documents

- [PRJ-001 Project Overview](../00-project/README.md)
- [TST-000 Test Specification](../05-testing/test-specification.md)
