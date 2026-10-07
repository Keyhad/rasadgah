---
id: PROC-002
title: How to deploy to a server
type: procedure
status: proposed
version: 1.0
audience:
  - administrator
  - developer
tags:
  - deployment
  - docker
---

# How to deploy to a server

## Table of Contents

- [1. Purpose](#1-purpose)
- [2. Prerequisites](#2-prerequisites)
  - [2.1 Hardware](#21-hardware)
  - [2.2 Software](#22-software)
  - [2.3 Network Requirements](#23-network-requirements)
- [3. Installation](#3-installation)
  - [3.1 Copy the deployment files](#31-copy-the-deployment-files)
  - [3.2 Configure](#32-configure)
  - [3.3 Start](#33-start)
- [4. Verification](#4-verification)
- [5. Upgrade](#5-upgrade)
- [6. Rollback](#6-rollback)
- [7. Uninstallation](#7-uninstallation)
- [8. Troubleshooting](#8-troubleshooting)
- [9. Related Documents](#9-related-documents)

## 1. Purpose

Install Rasadgah on a Linux server with a public domain and Let's Encrypt certificates. To automate these steps from GitHub Actions, see [PROC-003](howto-configure-ci-cd.md).

## 2. Prerequisites

### 2.1 Hardware

1 vCPU, 512 MB RAM and 2 GB free disk are sufficient for the containers and images.

### 2.2 Software

- Linux with Docker Engine 24+ and the Compose plugin 2.20+.
- Access to the image `ghcr.io/keyhad/rasadgah`. If the GHCR package is private, run `docker login ghcr.io` once with a token that has `read:packages`.

### 2.3 Network Requirements

- A DNS `A`/`AAAA` record for the domain pointing to the server.
- Inbound TCP 80 and 443 and UDP 443 open.

## 3. Installation

### 3.1 Copy the deployment files

Only two files from the repository are needed on the server:

```bash
ssh user@server 'mkdir -p ~/rasadgah'
scp compose.yaml Caddyfile user@server:~/rasadgah/
```

### 3.2 Configure

On the server, create `~/rasadgah/.env`:

```bash
SITE_ADDRESS=kpi.example.com
APP_IMAGE=ghcr.io/keyhad/rasadgah
APP_TAG=main
```

All variables: [REF-001](../07-reference/configuration.md).

### 3.3 Start

```bash
cd ~/rasadgah
docker compose pull app proxy
docker compose up -d --no-build --wait
```

`--no-build` is required because the source code is not on the server.

## 4. Verification

```bash
curl -fsS https://kpi.example.com/api/health          # {"status":"ok"}
curl -sI http://kpi.example.com/ | head -1            # HTTP/1.1 308 Permanent Redirect
docker compose ps                                     # app: healthy
```

Open `https://kpi.example.com/` and confirm that a token is shown.

## 5. Upgrade

```bash
cd ~/rasadgah
docker compose pull app
docker compose up -d --no-build --wait
docker image prune -f
```

Sessions in the `kpi_data` volume are kept. Take a backup first if the release notes list a migration ([PROC-004](howto-backup-restore.md)).

## 6. Rollback

Every pushed commit is published as `sha-<full commit SHA>`. Set the previous tag and restart:

```bash
sed -i 's/^APP_TAG=.*/APP_TAG=sha-<previous-commit-sha>/' .env
docker compose up -d --no-build --wait
```

## 7. Uninstallation

```bash
docker compose down        # keep data and certificates
docker compose down -v     # also delete all sessions and certificates (irreversible)
```

## 8. Troubleshooting

See [REF-002](../07-reference/troubleshooting.md), Sections 3 to 5.

## 9. Related Documents

- [ADR-003 Caddy for TLS termination](../03-design/adr/adr-003-caddy-tls-termination.md)
- [DES-001, Section 8](../03-design/architecture.md#8-deployment)
