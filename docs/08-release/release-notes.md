---
id: REF-003
title: Release Notes
type: release
status: draft
version: 1.0
audience:
  - user
  - developer
  - administrator
tags:
  - release
---

# Release Notes

## Table of Contents

- [1. Version 0.1.0](#1-version-010)
  - [1.1 Release Date](#11-release-date)
  - [1.2 Summary](#12-summary)
  - [1.3 New Features](#13-new-features)
  - [1.4 Breaking Changes](#14-breaking-changes)
  - [1.5 Known Issues](#15-known-issues)
  - [1.6 Migration](#16-migration)
  - [1.7 Compatibility](#17-compatibility)
- [2. Related Documents](#2-related-documents)

## 1. Version 0.1.0

### 1.1 Release Date

Unreleased.

### 1.2 Summary

First version: token-based KPI dashboards served over HTTPS and deployed with Docker Compose.

### 1.3 New Features

- Write token and read token issued on first visit and via `POST /api/tokens` (REQ-001, [ADR-005](../03-design/adr/adr-005-read-and-write-tokens.md)).
- KPI upload with the write token from the browser and via `PUT /api/kpis`, with validation; read tokens are rejected with HTTP 403 (REQ-002, REQ-003, REQ-010).
- Server-rendered editor at `/?token=<write token>` with a copyable share link (REQ-004).
- Clean shared view at `/?token=<read token>`: only the KPI cards and a freshness line such as "Updated 3 hours ago"; until KPIs are published, a full-page logo and slogan (REQ-009).
- JSON editor in the editor view, pre-filled with the stored KPIs, with Save, Format and Reset (REQ-011).
- Sliding seven-day lifetime shared by both tokens, extended only by uploads, and deletion of expired data (REQ-005, REQ-008).
- Caddy reverse proxy with automatic HTTPS.
- Brand identity: observatory logo used as favicon and header mark, tagline "KPI observatory" ([REF-020](../03-design/branding/README.md)).
- GitHub Actions pipeline: verification, end-to-end tests, image publishing to GHCR, optional SSH deployment.

### 1.4 Breaking Changes

None.

### 1.5 Known Issues

- See [PRJ-001, Section 9](../00-project/README.md#9-known-limitations).

### 1.6 Migration

Not applicable.

### 1.7 Compatibility

- Docker Engine 24+, Docker Compose 2.20+.
- Node.js 22 for development on the host.

## 2. Related Documents

- [API-001 HTTP API Specification](../02-specification/api-specification.md)
