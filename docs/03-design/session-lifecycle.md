---
id: DES-002
title: Token and Session Lifecycle
type: design
status: proposed
version: 1.0
audience:
  - developer
tags:
  - token
  - session
  - storage
---

# Token and Session Lifecycle

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Responsibilities](#2-responsibilities)
- [3. Interfaces](#3-interfaces)
- [4. Data Structures](#4-data-structures)
- [5. State Machine](#5-state-machine)
- [6. Algorithms](#6-algorithms)
  - [6.1 Token generation](#61-token-generation)
  - [6.2 Session resolution](#62-session-resolution)
  - [6.3 Expiry](#63-expiry)
  - [6.4 Purge](#64-purge)
- [7. Error Handling](#7-error-handling)
- [8. Concurrency](#8-concurrency)
- [9. Configuration](#9-configuration)
- [10. Requirements Implemented](#10-requirements-implemented)
- [11. Tests](#11-tests)
- [12. Related Documents](#12-related-documents)

## 1. Purpose

Defines how tokens are created, validated, expired and deleted, and how session data is stored.

## 2. Responsibilities

- Generate unguessable tokens.
- Persist one session per token without storing the token.
- Enforce the sliding seven-day lifetime.
- Delete expired sessions.

## 3. Interfaces

`SessionStore` port ([src/application/ports.ts](../../src/application/ports.ts)):

| Method                 | Behaviour                                           |
| ---------------------- | --------------------------------------------------- |
| `find(token)`          | Returns the session or `null`.                      |
| `save(token, session)` | Creates or replaces the session atomically.         |
| `delete(token)`        | Removes the session; no error if absent.            |
| `purgeExpired(now)`    | Removes all expired sessions and returns the count. |

## 4. Data Structures

```ts
interface Session {
  createdAt: string;            // ISO 8601
  lastUploadAt: string | null;  // ISO 8601, null before the first upload
  report: KpiReport | null;     // INT-001
}
```

On disk (`DATA_DIR`, default `/data` in the container):

```text
/data/<sha256(token) as 64 hex chars>.json   mode 0600
```

## 5. State Machine

```mermaid
stateDiagram-v2
    [*] --> Issued: GET / or POST /api/tokens
    Issued --> Active: successful upload
    Active --> Active: successful upload (lifetime restarts)
    Issued --> Expired: 7 days after issuance
    Active --> Expired: 7 days after last upload
    Expired --> Deleted: token presented or hourly purge
    Deleted --> [*]
```

A failed upload (invalid JSON, schema violation, oversize body) does not change the state.

## 6. Algorithms

### 6.1 Token generation

24 bytes from `crypto.randomBytes`, encoded as base64url → 32 characters from `[A-Za-z0-9_-]`, 192 bits of entropy.

### 6.2 Session resolution

`requireActiveSession` in [src/application/useCases.ts](../../src/application/useCases.ts):

1. Reject unless the token matches `^[A-Za-z0-9_-]{32}$`. This check also prevents path traversal.
2. Load the session; reject if absent.
3. If expired, delete it and reject.

All rejections raise `AppError('TOKEN_INVALID')` with one shared message (REQ-006).

### 6.3 Expiry

```text
expiresAt = (lastUploadAt ?? createdAt) + 604 800 000 ms
expired   = now ≥ expiresAt
```

Implemented in [src/domain/session.ts](../../src/domain/session.ts).

### 6.4 Purge

`src/instrumentation.ts` runs `purgeExpired` once at server start and then every hour. The file store reads each `*.json` file, deletes expired sessions and skips unreadable files.

## 7. Error Handling

- `ENOENT` while reading a session is treated as "not found"; other file-system errors propagate and produce HTTP 500.
- A purge failure is logged and retried at the next interval.

## 8. Concurrency

- Writes go to `<file>.<uuid>.tmp` and are renamed over the target, which is atomic on POSIX file systems.
- Two concurrent uploads for the same token are resolved by "last rename wins".
- Running more than one application instance against the same volume is not supported.

## 9. Configuration

| Variable   | Effect                       |
| ---------- | ---------------------------- |
| `DATA_DIR` | Directory for session files. |

Lifetime and token length are constants in the domain layer and are not configurable. See [REF-001](../07-reference/configuration.md).

## 10. Requirements Implemented

REQ-001, REQ-005, REQ-006, REQ-008, NFR-002.

## 11. Tests

TST-001, TST-005, TST-006, TST-008, TST-010 in [TST-000](../05-testing/test-specification.md).

## 12. Related Documents

- [DES-001 System Architecture](architecture.md)
- [ADR-002 File-based session storage](adr/adr-002-file-based-session-storage.md)
- [PROC-004 How to back up and restore data](../howtos/howto-backup-restore.md)
