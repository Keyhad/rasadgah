---
id: PRJ-001
title: Project Overview
type: overview
status: proposed
version: 1.0
audience:
  - developer
  - tester
  - user
  - administrator
tags:
  - overview
---

# Project Overview

Rasadgah ("observatory" in Persian) is a web application that renders key performance indicators (KPIs) uploaded as a JSON file.

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Scope](#2-scope)
- [3. Out of Scope](#3-out-of-scope)
- [4. System Overview](#4-system-overview)
- [5. Key Features](#5-key-features)
- [6. Architecture](#6-architecture)
- [7. Requirements](#7-requirements)
- [8. Current Status](#8-current-status)
- [9. Known Limitations](#9-known-limitations)
- [10. Related Documents](#10-related-documents)

## 1. Purpose

Teams need to share a small set of KPIs without operating a dashboard platform or managing user accounts. Rasadgah gives each visitor a write token to upload a KPI file and a read token to share it, and renders the KPIs as a dashboard at a stable URL.

## 2. Scope

- Issuing anonymous write and read tokens.
- Uploading and validating KPI files through the browser or an HTTP API.
- Rendering KPIs with value, change, trend and target status, in an editor (write token) and a clean shared view with a freshness timestamp (read token).
- Expiring both tokens one week after the last upload and deleting their data.
- HTTPS delivery and deployment as a Docker Compose stack.

## 3. Out of Scope

- User accounts, login, password recovery or token recovery.
- Historical KPI series and charts. Each upload replaces the previous report.
- More than one read token per dashboard, or revoking a read token independently.
- Horizontal scaling across multiple application instances (see [ADR-002](../03-design/adr/adr-002-file-based-session-storage.md)).

## 4. System Overview

```mermaid
graph LR
    Browser -- HTTPS --> Caddy
    Script[Script / CI job] -- HTTPS --> Caddy
    Caddy -- HTTP --> App[Next.js application]
    App --> Volume[(Session files)]
```

A visitor who opens `/` without a token receives a write token and a read token. Uploading a KPI file with the write token stores the report. Opening `/?token=<write token>` shows the editor; opening `/?token=<read token>` shows only the KPIs and how fresh they are.

## 5. Key Features

- Write and read tokens issued on first visit, with copy-to-clipboard and links.
- Share link for read-only viewers; only the write token can upload.
- KPI upload from the browser or with `curl` (`PUT /api/kpis`).
- Validation with field-level error messages.
- KPI cards with formatted value, change versus previous value, trend and target status.
- Freshness line ("Updated 3 hours ago") on the shared view.
- Sliding seven-day lifetime shared by both tokens, extended only by uploads.
- Automatic HTTPS through Caddy, including Let's Encrypt certificates.
- Single-command deployment with Docker Compose and a GitHub Actions pipeline.

## 6. Architecture

See [DES-001 System Architecture](../03-design/architecture.md).

## 7. Requirements

See [REQ-000 System Requirements](../01-requirements/requirements.md).

## 8. Current Status

Version 0.1.0. All requirements in REQ-000 are implemented and covered by the tests in [TST-000](../05-testing/test-specification.md). Production deployment has not been performed yet.

## 9. Known Limitations

- A lost write token cannot be recovered. The data can still be viewed with the read token but no longer updated, and it is deleted when the tokens expire.
- Anyone who has the write token can replace the report; anyone who has the read token can view it. A read token cannot be revoked without abandoning the dashboard.
- The rate limiter keeps state in memory and resets when the application restarts.
- Only one application instance is supported because sessions are stored on a local volume.

## 10. Related Documents

- [Documentation index](../README.md)
- [User Guide](../06-user/user-guide.md)
- [How to deploy to a server](../howtos/howto-deploy-to-server.md)
