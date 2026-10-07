---
id: ADR-005
title: Separate read and write tokens
type: decision
status: approved
version: 1.0
audience:
  - architect
  - developer
tags:
  - security
  - authentication
  - sharing
---

# Separate read and write tokens

Supersedes [ADR-004](adr-004-anonymous-bearer-tokens.md), whose rejected Option 3.3 is adopted here.

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

With a single token, sharing a dashboard also shared the right to replace its KPIs. Users need to share KPIs with others while keeping the ability to edit to themselves (REQ-009, REQ-010).

## 2. Problem

Choose how a read-only credential is created, stored and resolved, without introducing user accounts.

## 3. Options Considered

### 3.1 Two independent random tokens with an index

The read token is random; the store keeps an extra index entry mapping it to the dashboard.

Advantages: the read token can be rotated independently.

Disadvantages: two storage records per dashboard; partial writes can leave orphaned index entries; the purge must clean both.

### 3.2 Read token derived one-way from the write token

`readToken = base64url(SHA-256("read:" + writeToken)[0..24])`. The session is stored under the read token. A presented token is resolved first as a write token (derive, then look up) and then as a read token (look up directly).

Advantages: one record per dashboard; the write token is never stored, not even hashed; the editor can always recompute the share link; no change to the storage adapter.

Disadvantages: the read token cannot be rotated without issuing a new write token; a read-token lookup costs two reads.

### 3.3 Signed capability tokens (for example JWT with a scope claim)

Advantages: no lookup to decide the access level.

Disadvantages: requires a server secret and key management; tokens become longer; revocation still needs storage.

## 4. Decision

Option 3.2.

## 5. Rationale

It satisfies the requirements with the smallest change: one session file per dashboard, unchanged `SessionStore` port, no secret to manage. SHA-256 preimage resistance ensures that a read token reveals nothing about the write token.

## 6. Consequences

### 6.1 Positive

- Read tokens can be shared without granting write access.
- Both tokens share one session and therefore one expiry time; only writes extend it.

### 6.2 Negative

- `POST /api/tokens` returns `writeToken` and `readToken` instead of `token` (breaking API change at version 0.x).
- Dashboards created before this change are stored under their former single token, which now acts as a read token. They expire within 7 days.

### 6.3 Risks

- A token that is simultaneously a valid write token of dashboard A and a valid read token of dashboard B would resolve as the write token of A. The probability is 2⁻¹⁹² and is accepted.

## 7. Related Requirements

REQ-001, REQ-005, REQ-009, REQ-010, NFR-002.

## 8. Related Documents

- [DES-002 Token and Session Lifecycle](../session-lifecycle.md)
- [API-001 HTTP API Specification](../../02-specification/api-specification.md)
