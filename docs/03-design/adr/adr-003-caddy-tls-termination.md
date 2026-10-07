---
id: ADR-003
title: Caddy for TLS termination
type: decision
status: approved
version: 1.0
audience:
  - architect
  - administrator
tags:
  - https
  - tls
  - proxy
---

# Caddy for TLS termination

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

NFR-001 requires HTTPS for all traffic. The application server (Next.js) serves plain HTTP.

## 2. Problem

Choose the component that terminates TLS and manages certificates.

## 3. Options Considered

### 3.1 Caddy

Advantages: automatic Let's Encrypt certificates and renewal; internal CA for `localhost`; HTTP→HTTPS redirect by default; short configuration.

Disadvantages: less widespread than nginx.

### 3.2 nginx with certbot

Advantages: widely known.

Disadvantages: separate certificate renewal process; longer configuration.

### 3.3 TLS in Node.js

Disadvantages: certificate management in application code.

## 4. Decision

Option 3.1, configured in [Caddyfile](../../../Caddyfile).

## 5. Rationale

The same configuration works locally (internal CA) and in production (Let's Encrypt) by changing only `SITE_ADDRESS`.

## 6. Consequences

### 6.1 Positive

- No certificate handling in CI or application code.
- The proxy also enforces the 1 MB body limit and redacts tokens from access logs.

### 6.2 Negative

- Browsers show a warning for `https://localhost` until Caddy's local root certificate is trusted ([REF-002](../../07-reference/troubleshooting.md)).

### 6.3 Risks

- Let's Encrypt issuance fails if ports 80/443 are unreachable or DNS is wrong.

## 7. Related Requirements

NFR-001, NFR-002.

## 8. Related Documents

- [PROC-002 How to deploy to a server](../../howtos/howto-deploy-to-server.md)
