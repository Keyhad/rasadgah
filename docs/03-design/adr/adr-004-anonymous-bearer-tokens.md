---
id: ADR-004
title: Bearer-token access without user accounts
type: decision
status: deprecated
version: 1.1
audience:
  - architect
  - developer
tags:
  - security
  - authentication
---

# Bearer-token access without user accounts

> **Deprecated.** The single-token model is superseded by [ADR-005 Separate read and write tokens](adr-005-read-and-write-tokens.md). The decision against user accounts remains in force.

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

The product brief requires that a visitor receives an ID on the first visit, saves it, and uses it to upload and view KPIs. No registration is wanted.

## 2. Problem

Choose how access to a dashboard is controlled.

## 3. Options Considered

### 3.1 Random bearer token as the only credential

Advantages: no accounts; usable from browsers and scripts.

Disadvantages: possession equals access; no recovery.

### 3.2 Accounts with login

Disadvantages: contradicts the brief; requires password or identity-provider handling.

### 3.3 Separate read and write tokens

Advantages: dashboards can be shared read-only.

Disadvantages: two secrets for the user to keep. Not requested.

## 4. Decision

Option 3.1. The token is passed as `?token=` for the page and as `Authorization: Bearer` for the API.

## 5. Rationale

It is the smallest design that meets the brief. Token entropy (192 bits) makes guessing infeasible.

## 6. Consequences

### 6.1 Positive

- No personal data is stored.

### 6.2 Negative

- The page URL contains the secret. Mitigations: `Referrer-Policy: no-referrer`, `robots: noindex`, token redaction in proxy logs, HTTPS only.

### 6.3 Risks

- Users share the URL and thereby grant write access. Option 3.3 is the follow-up if read-only sharing is requested.

## 7. Related Requirements

REQ-001, REQ-006, NFR-002.

## 8. Related Documents

- [DES-002 Token and Session Lifecycle](../session-lifecycle.md)
