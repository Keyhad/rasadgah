---
id: ADR-002
title: File-based session storage
type: decision
status: approved
version: 1.0
audience:
  - architect
  - developer
tags:
  - storage
---

# File-based session storage

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

Each token stores one report of at most `MAX_UPLOAD_BYTES` (default 256 KiB). Access is by exact key only; there are no queries across sessions except the hourly purge.

## 2. Problem

Choose where sessions are stored.

## 3. Options Considered

### 3.1 JSON file per session on a Docker volume

Advantages: no additional service; atomic writes via rename; backup with `tar`.

Disadvantages: single instance only; purge scans all files.

### 3.2 SQLite

Advantages: transactions; indexed expiry queries.

Disadvantages: native module in the image; not needed for key-value access.

### 3.3 PostgreSQL or Redis

Advantages: supports multiple instances; Redis TTL fits expiry.

Disadvantages: an additional container to operate, secure and back up.

## 4. Decision

Option 3.1, behind the `SessionStore` port.

## 5. Rationale

The access pattern is key-value with low volume. The port allows replacing the adapter with Redis or PostgreSQL without changing the application or domain layers.

## 6. Consequences

### 6.1 Positive

- The stack contains no database.
- Tests use the in-memory adapter or a temporary directory.

### 6.2 Negative

- The application shall run as one instance.

### 6.3 Risks

- A very large number of sessions slows the purge. Revisit this decision if the volume exceeds 100 000 files.

## 7. Related Requirements

REQ-002, REQ-008, NFR-004.

## 8. Related Documents

- [DES-002 Token and Session Lifecycle](../session-lifecycle.md)
- [PROC-004 How to back up and restore data](../../howtos/howto-backup-restore.md)
