---
id: PROC-004
title: How to back up and restore data
type: procedure
status: proposed
version: 1.0
audience:
  - administrator
tags:
  - backup
  - operations
---

# How to back up and restore data

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Prerequisites](#2-prerequisites)
- [3. Back Up](#3-back-up)
- [4. Restore](#4-restore)
- [5. Verification](#5-verification)
- [6. Related Documents](#6-related-documents)

## 1. Purpose

Back up and restore the Docker volumes that hold state:

| Volume                | Content                                                      | Loss impact                                                                 |
| --------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------- |
| `rasadgah_kpi_data`   | Session files ([DES-002](../03-design/session-lifecycle.md)) | All tokens become invalid                                                   |
| `rasadgah_caddy_data` | TLS certificates and ACME account                            | Certificates are re-issued; repeated loss can hit Let's Encrypt rate limits |

Session data expires after at most 7 days, so backups older than 7 days contain no valid sessions.

## 2. Prerequisites

Run the commands in the directory that contains `compose.yaml`.

## 3. Back Up

```bash
for v in kpi_data caddy_data; do
  docker run --rm -v "rasadgah_$v":/source:ro -v "$PWD":/backup alpine \
    tar czf "/backup/$v-$(date +%Y%m%d%H%M).tgz" -C /source .
done
```

The archive contains no raw tokens, only SHA-256 hashes, but it does contain KPI data. Store it with the same protection as the server.

## 4. Restore

```bash
docker compose stop app proxy
docker run --rm -v rasadgah_kpi_data:/target -v "$PWD":/backup alpine \
  sh -c 'rm -rf /target/* && tar xzf /backup/kpi_data-<timestamp>.tgz -C /target && chown -R 1000:1000 /target'
docker compose up -d --no-build --wait
```

Restore `caddy_data` in the same way, without the `chown`.

## 5. Verification

```bash
docker compose exec app ls -l /data
```

Open a dashboard URL whose token was valid at backup time and is less than 7 days old.

## 6. Related Documents

- [PROC-002 How to deploy to a server](howto-deploy-to-server.md)
