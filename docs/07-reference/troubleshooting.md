---
id: REF-002
title: Troubleshooting
type: reference
status: proposed
version: 1.0
audience:
  - user
  - administrator
  - developer
tags:
  - troubleshooting
---

# Troubleshooting

User-facing messages are covered in [USR-001, Section 9](../06-user/user-guide.md#9-troubleshooting). This document covers operation and development.

## Table of Contents

- [1. Browser warns about the certificate on localhost](#1-browser-warns-about-the-certificate-on-localhost)
- [2. Port 80 or 443 is already in use](#2-port-80-or-443-is-already-in-use)
- [3. Let's Encrypt certificate is not issued](#3-lets-encrypt-certificate-is-not-issued)
- [4. API returns 500](#4-api-returns-500)
- [5. All visitors share one rate limit](#5-all-visitors-share-one-rate-limit)
- [6. E2E image build fails or browsers do not start](#6-e2e-image-build-fails-or-browsers-do-not-start)
- [7. Dev server does not reload on macOS](#7-dev-server-does-not-reload-on-macos)
- [8. zsh asks to correct @file arguments](#8-zsh-asks-to-correct-file-arguments)
- [9. Diagnostic Commands](#9-diagnostic-commands)
- [10. Logs](#10-logs)
- [11. Escalation](#11-escalation)

## 1. Browser warns about the certificate on localhost

### 1.1 Symptoms

`https://localhost` shows "Your connection is not private".

### 1.2 Possible Causes

Caddy issues `localhost` certificates from its own local CA, which the host does not trust.

### 1.3 Solution

Accept the warning for local use, or trust the root certificate (macOS):

```bash
docker compose cp proxy:/data/caddy/pki/authorities/local/root.crt ./caddy-root.crt
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain caddy-root.crt
```

## 2. Port 80 or 443 is already in use

### 2.1 Symptoms

`docker compose up` fails with "port is already allocated".

### 2.2 Solution

Use other host ports: `HTTP_PORT=8080 HTTPS_PORT=8443 docker compose up -d`, then open `https://localhost:8443`.

## 3. Let's Encrypt certificate is not issued

### 3.1 Symptoms

Proxy logs contain `obtaining certificate` errors; browsers show a TLS error.

### 3.2 Possible Causes

- The DNS record for `SITE_ADDRESS` does not point to the server.
- Ports 80 or 443 are blocked by a firewall.
- Let's Encrypt rate limits after repeated failures.

### 3.3 Diagnosis

```bash
dig +short "$SITE_ADDRESS"
docker compose logs proxy | grep -i -E 'acme|certificate'
```

### 3.4 Solution

Correct DNS or firewall, then `docker compose restart proxy`. Certificates are stored in the `caddy_data` volume; do not delete it, to avoid rate limits.

## 4. API returns 500

### 4.1 Symptoms

`{"error":"Unexpected server error."}`.

### 4.2 Possible Causes

- `/data` is not writable by user `node` (UID 1000), for example after replacing the named volume with a bind mount.
- The disk is full.

### 4.3 Diagnosis

```bash
docker compose logs app | tail -50
docker compose exec app sh -c 'id; ls -ld /data; df -h /data'
```

### 4.4 Solution

For a bind mount: `sudo chown -R 1000:1000 <host-dir>`. Free disk space if full.

## 5. All visitors share one rate limit

### 5.1 Symptoms

Many users receive "Too many requests" at the same time.

### 5.2 Possible Causes

The app is reached without Caddy, or another proxy in front of Caddy hides client IPs, so all clients share one key.

### 5.3 Solution

Expose only the `proxy` service. If another proxy or load balancer sits in front, configure Caddy `trusted_proxies` for it.

## 6. E2E image build fails or browsers do not start

### 6.1 Possible Causes

`PLAYWRIGHT_VERSION` in the Dockerfile differs from the installed `@playwright/test` version.

### 6.2 Solution

```bash
grep '"version"' node_modules/@playwright/test/package.json
```

Set `ARG PLAYWRIGHT_VERSION` in the [Dockerfile](../../Dockerfile) to that value.

## 7. Dev server does not reload on macOS

### 7.1 Solution

The `dev` service sets `WATCHPACK_POLLING=true`. If reloads still fail, restart with `docker compose --profile dev up --build dev`.

## 8. zsh asks to correct @file arguments

### 8.1 Symptoms

`zsh: correct '@public/kpis.example.json' to 'public/kpis.example.json' [nyae]?`

### 8.2 Solution

Answer `n`, or quote the argument: `--data-binary '@public/kpis.example.json'`.

## 9. Diagnostic Commands

```bash
docker compose ps
docker compose logs -f app proxy
curl -k https://localhost/api/health
docker compose exec app ls -l /data
docker inspect --format '{{json .State.Health}}' rasadgah-app-1
```

## 10. Logs

| Source      | Command                     | Notes                                                                                         |
| ----------- | --------------------------- | --------------------------------------------------------------------------------------------- |
| Application | `docker compose logs app`   | Unexpected errors and purge failures                                                          |
| Proxy       | `docker compose logs proxy` | JSON access log; `token` query values are `REDACTED`, `Authorization` removed                 |
| CI          | GitHub → Actions → run      | The `docker` job prints compose logs on failure; Playwright report is uploaded as an artifact |

## 11. Escalation

Record production incidents with the [incident analysis template](../../.ai/core/templates/incident-analysis.md) and open a GitHub issue with the result.
